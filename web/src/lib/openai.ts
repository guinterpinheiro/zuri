import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function sendMessageToAI(
  message: string,
  conversationHistory: AIMessage[] = []
): Promise<string> {
  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `Você é ZURI, um assistente virtual inteligente e prestativo. 
        Você ajuda usuários com suas tarefas diárias, responde perguntas, 
        fornece informações úteis e mantém conversas naturais em português brasileiro.
        Seja amigável, profissional e conciso nas respostas.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
  } catch (error) {
    console.error('Erro ao enviar mensagem para IA:', error)
    throw new Error('Erro ao processar mensagem com IA')
  }
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt',
    })

    return transcription.text
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error)
    throw new Error('Erro ao transcrever áudio')
  }
}

export async function generateTasksFromText(text: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que extrai tarefas de textos. 
          Analise o texto fornecido e extraia todas as tarefas mencionadas.
          Retorne apenas uma lista de tarefas, uma por linha, sem numeração ou marcadores.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    })

    const response = completion.choices[0]?.message?.content || ''
    return response.split('\n').filter(task => task.trim().length > 0)
  } catch (error) {
    console.error('Erro ao gerar tarefas:', error)
    throw new Error('Erro ao gerar tarefas')
  }
}

export async function summarizeText(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que cria resumos concisos e informativos de textos em português.',
        },
        {
          role: 'user',
          content: `Resuma o seguinte texto:\n\n${text}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content || 'Não foi possível gerar resumo.'
  } catch (error) {
    console.error('Erro ao resumir texto:', error)
    throw new Error('Erro ao resumir texto')
  }
}
