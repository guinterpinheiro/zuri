import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.5.0'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        await handlePaymentFailed(invoice)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCheckoutCompleted(session: any) {
  const { customer, subscription, metadata } = session
  const userId = metadata?.user_id

  if (!userId) return

  await supabase.from('subscriptions').insert([{
    user_id: userId,
    stripe_customer_id: customer,
    stripe_subscription_id: subscription,
    status: 'active',
    plan: metadata?.plan || 'pro',
  }])

  // Atualizar plano do usuário
  await supabase
    .from('users')
    .update({ plan: metadata?.plan || 'pro' })
    .eq('id', userId)
}

async function handleSubscriptionUpdate(subscription: any) {
  const { id, customer, status, current_period_end } = subscription

  await supabase
    .from('subscriptions')
    .update({
      status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', id)
}

async function handleSubscriptionDeleted(subscription: any) {
  const { id } = subscription

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', id)

  // Atualizar plano do usuário para free
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', id)
    .single()

  if (sub) {
    await supabase
      .from('users')
      .update({ plan: 'free' })
      .eq('id', sub.user_id)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded:', invoice.id)
  // MANUAL: Implementar lógica adicional se necessário
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed:', invoice.id)
  // MANUAL: Enviar notificação ao usuário
}
