import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, body, data = {} } = await req.json();

    if (!user_id || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!FIREBASE_SERVER_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    // Fetch user tokens
    const tokensResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/device_tokens?user_id=eq.${user_id}&select=token`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const tokens = await tokensResponse.json();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum token encontrado para o usuário' },
        { status: 404 }
      );
    }

    // Send notification via FCM
    const fcmTokens = tokens.map((t: any) => t.token);
    
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
    });

    const fcmData = await fcmResponse.json();

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
        op_type: 'push_notification',
        meta: {
          title,
          body,
          tokens_sent: fcmTokens.length,
          fcm_response: fcmData,
        }
      }),
    });

    return NextResponse.json({
      success: true,
      tokens_sent: fcmTokens.length,
      fcm_response: fcmData,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao enviar notificação',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
