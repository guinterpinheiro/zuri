export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  plans: {
    free: {
      name: 'Gratuito',
      price: 0,
      features: [
        '10 mensagens por mês',
        'Suporte básico',
        'Acesso limitado'
      ]
    },
    pro: {
      name: 'Pro',
      priceId: process.env.STRIPE_PRICE_ID_PRO || '',
      price: 29.90,
      features: [
        '500 mensagens por mês',
        'Transcrição de áudio',
        'Suporte prioritário',
        'Histórico completo'
      ]
    },
    premium: {
      name: 'Premium',
      priceId: process.env.STRIPE_PRICE_ID_PREMIUM || '',
      price: 79.90,
      features: [
        'Mensagens ilimitadas',
        'Transcrição ilimitada',
        'Suporte VIP 24/7',
        'API personalizada',
        'Análises avançadas'
      ]
    }
  }
};

export function getPlanByName(planName: string) {
  return stripeConfig.plans[planName as keyof typeof stripeConfig.plans];
}
