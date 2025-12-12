import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: any, supabaseUrl: string, serviceKey: string) {
  const { customer, subscription, metadata } = session;
  const userId = metadata?.user_id;

  if (!userId) return;

  // Create subscription record
  await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      user_id: userId,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      status: 'active',
      plan: metadata?.plan || 'pro',
    }),
  });

  // Update user plan
  await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ plan: metadata?.plan || 'pro' }),
  });

  // Create notification
  await fetch(`${supabaseUrl}/rest/v1/notifications`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      user_id: userId,
      type: 'subscription',
      title: 'Assinatura Ativada',
      message: `Sua assinatura ${metadata?.plan || 'pro'} foi ativada com sucesso!`,
      read: false,
    }),
  });
}

async function handleSubscriptionUpdate(subscription: any, supabaseUrl: string, serviceKey: string) {
  const { id, status, current_period_end } = subscription;

  await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
    }),
  });
}

async function handleSubscriptionDeleted(subscription: any, supabaseUrl: string, serviceKey: string) {
  const { id } = subscription;

  await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ status: 'canceled' }),
  });

  // Get subscription to find user_id
  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${id}&select=user_id`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );

  const subscriptions = await response.json();
  
  if (subscriptions && subscriptions.length > 0) {
    const userId = subscriptions[0].user_id;
    
    // Update user plan to free
    await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ plan: 'free' }),
    });

    // Create notification
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        type: 'subscription',
        title: 'Assinatura Cancelada',
        message: 'Sua assinatura foi cancelada. Você foi movido para o plano gratuito.',
        read: false,
      }),
    });
  }
}

async function handlePaymentSucceeded(invoice: any, supabaseUrl: string, serviceKey: string) {
  console.log('Payment succeeded:', invoice.id);
  
  const { customer, subscription } = invoice;
  
  // Get subscription to find user_id
  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription}&select=user_id`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );

  const subscriptions = await response.json();
  
  if (subscriptions && subscriptions.length > 0) {
    const userId = subscriptions[0].user_id;
    
    // Create notification
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        type: 'payment',
        title: 'Pagamento Confirmado',
        message: 'Seu pagamento foi processado com sucesso!',
        read: false,
      }),
    });
  }
}

async function handlePaymentFailed(invoice: any, supabaseUrl: string, serviceKey: string) {
  console.log('Payment failed:', invoice.id);
  
  const { customer, subscription } = invoice;
  
  // Get subscription to find user_id
  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription}&select=user_id`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );

  const subscriptions = await response.json();
  
  if (subscriptions && subscriptions.length > 0) {
    const userId = subscriptions[0].user_id;
    
    // Create notification
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        type: 'payment',
        title: 'Falha no Pagamento',
        message: 'Houve um problema ao processar seu pagamento. Por favor, atualize suas informações de pagamento.',
        read: false,
      }),
    });
  }
}
