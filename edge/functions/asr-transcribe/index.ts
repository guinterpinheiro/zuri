import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface RequestBody {
  user_id: string
  audio_url: string
  call_id?: string
}

serve(async (req) => {
  try {
    const { user_id, audio_url, call_id }: RequestBody = await req.json()

    // Baixar áudio
    const audioResponse = await fetch(audio_url)
    const audioBlob = await audioResponse.blob()

    // Transcrever com Whisper
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.mp3')
    formData.append('model', 'whisper-1')
    formData.append('language', 'pt')

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    })

    const whisperData = await whisperResponse.json()
    const transcription = whisperData.text

    // Gerar resumo com GPT
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que resume chamadas telefônicas. Extraia os pontos principais, ações necessárias e informações importantes.'
          },
          {
            role: 'user',
            content: `Resuma esta transcrição de chamada:\n\n${transcription}`
          }
        ],
        max_tokens: 300,
      }),
    })

    const summaryData = await summaryResponse.json()
    const summary = summaryData?.choices?.[0]?.message?.content

    // Atualizar banco de dados
    if (call_id) {
      await supabase
        .from('calls')
        .update({
          transcription,
          summary,
        })
        .eq('id', call_id)
    }

    // Registrar operação
    await supabase.from('operations_log').insert([{
      user_id,
      op_type: 'asr_transcribe',
      meta: {
        call_id,
        audio_url,
        transcription_length: transcription.length,
      }
    }])

    return new Response(
      JSON.stringify({
        transcription,
        summary,
        call_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao transcrever áudio' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
