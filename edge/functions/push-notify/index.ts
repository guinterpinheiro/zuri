import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface RequestBody {
  user_id: string
  title: string
  body: string
  data?: Record<string, any>
}

serve(async (req) => {
  try {
    const { user_id, title, body, data = {} }: RequestBody = await req.json()

    // Buscar tokens do usuário
    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', user_id)

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum token encontrado para o usuário' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Enviar notificação via FCM
    const fcmTokens = tokens.map(t => t.token)
    
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: fcmTokens,
        notification: {
          title,
          body,
          sound: 'default',
          badge: '1',
        },
        data,
        priority: 'high',
      }),
    })

    const fcmData = await fcmResponse.json()

    // Registrar operação
    await supabase.from('operations_log').insert([{
      user_id,
      op_type: 'push_notification',
      meta: {
        title,
        body,
        tokens_sent: fcmTokens.length,
        fcm_response: fcmData,
      }
    }])

    return new Response(
      JSON.stringify({
        success: true,
        tokens_sent: fcmTokens.length,
        fcm_response: fcmData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar notificação' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
