import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarMensagemParaIA, MensagemAI } from '@/biblioteca/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory } = await request.json()

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Mensagem e userId são obrigatórios' },
        { status: 400 }
      )
    }

    // Salvar mensagem do usuário no banco
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        content: message,
        type: 'text',
        status: 'pending',
      })
      .select()
      .single()

    if (userMessageError) throw userMessageError

    // Enviar para IA
    const aiResponse = await sendMessageToAI(message, conversationHistory)

    // Atualizar mensagem com resposta da IA
    const { error: updateError } = await supabase
      .from('messages')
      .update({
        ai_response: aiResponse,
        status: 'completed',
      })
      .eq('id', userMessage.id)

    if (updateError) throw updateError

    // Criar notificação para o usuário
    await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Nova resposta da IA',
      message: 'ZURI respondeu sua mensagem',
      type: 'info',
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageId: userMessage.id,
    })
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ success: true, messages: data })
  } catch (error: any) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
