import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface RequestBody {
  user_id: string
  context_text: string
  style?: string
  conversation_id?: string
}

serve(async (req) => {
  try {
    const { user_id, context_text, style = 'default', conversation_id }: RequestBody = await req.json()

    // Validar quota/assinatura
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return new Response(
        JSON.stringify({ error: 'Assinatura inativa ou não encontrada' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Preparar prompt baseado no estilo
    const systemPrompt = getSystemPrompt(style)
    const userPrompt = `Contexto da conversa:\n\n${context_text}\n\nResponda de forma apropriada e útil.`

    // Chamar OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    const openaiData = await openaiResponse.json()
    const reply = openaiData?.choices?.[0]?.message?.content ?? 'Desculpe, não consegui processar sua solicitação.'

    // Registrar operação
    await supabase.from('operations_log').insert([{
      user_id,
      op_type: 'llm_respond',
      meta: {
        style,
        conversation_id,
        tokens: openaiData?.usage,
        model: 'gpt-4o-mini'
      }
    }])

    return new Response(
      JSON.stringify({
        reply_text: reply,
        tokens_used: openaiData?.usage?.total_tokens || 0,
        meta: { style, model: 'gpt-4o-mini' }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function getSystemPrompt(style: string): string {
  const prompts: Record<string, string> = {
    default: 'Você é ZURI, um assistente inteligente e prestativo. Responda de forma clara, concisa e profissional.',
    friendly: 'Você é ZURI, um assistente amigável e descontraído. Use um tom casual e acolhedor.',
    formal: 'Você é ZURI, um assistente corporativo. Mantenha um tom formal e profissional.',
    brief: 'Você é ZURI. Seja extremamente conciso e direto ao ponto. Respostas curtas.',
  }
  return prompts[style] || prompts.default
}
