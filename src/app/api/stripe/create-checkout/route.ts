import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json();

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://zuriasistent.com';

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Define price IDs based on plan
    const priceIds: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_ID_PRO || '',
      premium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
    };

    const priceId = priceIds[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${APP_URL}/pricing`,
        'metadata[user_id]': userId,
        'metadata[plan]': plan,
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const session = await checkoutResponse.json();

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
