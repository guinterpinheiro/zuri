import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Variáveis de ambiente
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Tipagem do corpo da requisição
interface CorpoDaSolicitacao {
  ID_do_usuario: string;
  url_de_audio: string;
  id_da_chamada?: string;
}

serve(async (req) => {
  try {
    const { ID_do_usuario, url_de_audio, id_da_chamada }: CorpoDaSolicitacao =
      await req.json();

    // ================================
    // 1. BAIXAR ÁUDIO DO ARQUIVO
    // ================================
    const respostaAudio = await fetch(url_de_audio);
    const blobAudio = await respostaAudio.blob();

    // ================================
    // 2. TRANSCRITAR ÁUDIO COM WHISPER
    // ================================
    const form = new FormData();
    form.append("file", blobAudio, "audio.mp3");
    form.append("model", "whisper-1");
    form.append("language", "pt");

    const respostaWhisper = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: form,
      }
    );

    const dadosTranscricao = await respostaWhisper.json();
    const transcricao = dadosTranscricao.text;

    // ================================
    // 3. RESUMIR TRANSCRIÇÃO COM GPT
    // ================================
    const respostaResumo = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente que resume chamadas telefônicas. Extraia os pontos principais, ações necessárias e informações úteis.",
            },
            {
              role: "user",
              content: `Resuma esta transcrição de chamada:\n\n${transcricao}`,
            },
          ],
          max_tokens: 300,
        }),
      }
    );

    const dadosResumo = await respostaResumo.json();
    const resumo = dadosResumo?.choices?.[0]?.message?.content ?? "";

    // ================================
    // 4. SALVAR NO BANCO DE DADOS
    // ================================
    if (id_da_chamada) {
      await supabase
        .from("chamadas")
        .update({
          transcricao,
          resumo,
        })
        .eq("id", id_da_chamada);
    }

    // Registrar operação
    await supabase.from("log_de_operacoes").insert([
      {
        ID_do_usuario,
        op_type: "asr_transcribe",
        meta: {
          id_da_chamada,
          url_de_audio,
          comprimento_da_transcricao: transcricao?.length ?? 0,
        },
      },
    ]);

    // ================================
    // 5. RETORNAR RESPOSTA AO CLIENTE
    // ================================
    return new Response(
      JSON.stringify({
        transcricao,
        resumo,
        id_da_chamada,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (erro) {
    console.error("Erro:", erro);
    return new Response(
      JSON.stringify({ erro: "Erro ao transcrever áudio" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
