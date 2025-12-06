import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { user_id, context_text, style = 'default', conversation_id } = await req.json();

    if (!user_id || !context_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    // Validate subscription/quota
    const subscriptionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user_id}&status=eq.active&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const subscriptions = await subscriptionResponse.json();

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'Assinatura inativa ou não encontrada' },
        { status: 403 }
      );
    }

    // Prepare prompt based on style
    const systemPrompt = getSystemPrompt(style);
    const userPrompt = `Contexto da conversa:\n\n${context_text}\n\nResponda de forma apropriada e útil.`;

    // Call OpenAI
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
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const reply = openaiData?.choices?.[0]?.message?.content ?? 'Desculpe, não consegui processar sua solicitação.';

    // Log operation
    await fetch(`${SUPABASE_URL}/rest/v1/operations_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id,
        op_type: 'llm_respond',
        meta: {
          style,
          conversation_id,
          tokens: openaiData?.usage,
          model: 'gpt-4o-mini'
        }
      }),
    });

    return NextResponse.json({
      reply_text: reply,
      tokens_used: openaiData?.usage?.total_tokens || 0,
      meta: { style, model: 'gpt-4o-mini' }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getSystemPrompt(style: string): string {
  const prompts: Record<string, string> = {
    default: 'Você é ZURI, um assistente inteligente e prestativo. Responda de forma clara, concisa e profissional.',
    friendly: 'Você é ZURI, um assistente amigável e descontraído. Use um tom casual e acolhedor.',
    formal: 'Você é ZURI, um assistente corporativo. Mantenha um tom formal e profissional.',
    brief: 'Você é ZURI. Seja extremamente conciso e direto ao ponto. Respostas curtas.',
  };
  return prompts[style] || prompts.default;
}
