import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { user_id, audio_url, call_id } = await req.json();

    if (!user_id || !audio_url) {
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

    // Download audio
    const audioResponse = await fetch(audio_url);
    const audioBlob = await audioResponse.blob();

    // Transcribe with Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      throw new Error(`Whisper API error: ${whisperResponse.statusText}`);
    }

    const whisperData = await whisperResponse.json();
    const transcription = whisperData.text;

    // Generate summary with GPT
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
    });

    if (!summaryResponse.ok) {
      throw new Error(`OpenAI API error: ${summaryResponse.statusText}`);
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData?.choices?.[0]?.message?.content;

    // Update database
    if (call_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/calls?id=eq.${call_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          transcription,
          summary,
        }),
      });
    }

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
        op_type: 'asr_transcribe',
        meta: {
          call_id,
          audio_url,
          transcription_length: transcription.length,
        }
      }),
    });

    return NextResponse.json({
      transcription,
      summary,
      call_id,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
