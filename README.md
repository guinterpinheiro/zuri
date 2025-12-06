# 🤖 ZURI - Assistente Inteligente

Sistema completo de assistente virtual com IA, transcrição de áudio, notificações push e sistema de assinaturas integrado com Stripe.

---

## 🌟 Funcionalidades

### 🎯 Core
- ✅ **Chat com IA** (GPT-4o-mini)
- ✅ **Transcrição de Áudio** (Whisper)
- ✅ **Resumo de Chamadas** automático
- ✅ **Push Notifications** (Firebase)
- ✅ **Sistema de Assinaturas** (Stripe)
- ✅ **Autenticação** (Supabase Auth)

### 💳 Planos
- **Gratuito**: 10 mensagens/mês
- **Pro** (R$ 29,90/mês): 500 mensagens + transcrição
- **Premium** (R$ 79,90/mês): Ilimitado + suporte VIP

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│           Next.js 15 (App Router)               │
│              Runtime: Edge                      │
├─────────────────────────────────────────────────┤
│  API Routes:                                    │
│  • /api/stripe/create-checkout                  │
│  • /api/stripe/webhook                          │
│  • /api/chat                                    │
│  • /api/transcribe                              │
│  • /api/notifications/send                      │
└─────────────────────────────────────────────────┘
         │           │           │           │
         ▼           ▼           ▼           ▼
    ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Stripe │  │ Supabase │  │ OpenAI   │  │ Firebase │
    │   API  │  │   DB     │  │   API    │  │   FCM    │
    └────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/zuri.git
cd zuri
npm install
```

### 2. Configure Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# Firebase
FIREBASE_SERVER_KEY=AAAA...

# App
NEXT_PUBLIC_APP_URL=https://zuriasistent.com
```

### 3. Configure o Banco de Dados
```bash
# Acesse o SQL Editor no Supabase
# Execute o script: supabase-schema.sql
```

### 4. Execute Localmente
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📚 Documentação

- **[Sistema de Assinaturas](./SISTEMA-ASSINATURAS.md)**: Documentação completa do Stripe
- **[Guia Rápido de Setup](./GUIA-RAPIDO-SETUP.md)**: Configuração em 5 passos
- **[Schema do Banco](./supabase-schema.sql)**: Estrutura completa do Supabase

---

## 🔧 Stack Tecnológica

### Frontend/Backend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Edge Runtime** - Execução em edge para baixa latência

### Serviços
- **Stripe** - Pagamentos e assinaturas
- **Supabase** - Banco de dados PostgreSQL + Auth
- **OpenAI** - GPT-4o-mini (chat) + Whisper (transcrição)
- **Firebase** - Push notifications (FCM)

### Deploy
- **Vercel** - Hospedagem e CI/CD
- **Domínio**: zuriasistent.com

---

## 📁 Estrutura do Projeto

```
zuri/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── create-checkout/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   ├── chat/route.ts
│   │   │   ├── transcribe/route.ts
│   │   │   └── notifications/
│   │   │       └── send/route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── lib/
│       ├── supabase.ts
│       └── stripe-config.ts
├── supabase-schema.sql
├── SISTEMA-ASSINATURAS.md
├── GUIA-RAPIDO-SETUP.md
└── README.md
```

---

## 🔐 Segurança

### Row Level Security (RLS)
Todas as tabelas do Supabase têm RLS habilitado:
```sql
CREATE POLICY "Users can view own data" 
ON table_name FOR SELECT 
USING (auth.uid() = user_id);
```

### Validação de Webhook
Webhooks do Stripe são validados com assinatura:
```typescript
const signature = req.headers.get('stripe-signature');
if (!signature) {
  return NextResponse.json({ error: 'No signature' }, { status: 400 });
}
```

### Validação de Assinatura
APIs protegidas validam assinatura ativa:
```typescript
const subscriptions = await fetch(
  `${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user_id}&status=eq.active`
);
```

---

## 🧪 Testes

### Cartões de Teste (Stripe)
| Cenário | Número | CVC | Data |
|---------|--------|-----|------|
| ✅ Sucesso | 4242 4242 4242 4242 | Qualquer | Futura |
| ❌ Falha | 4000 0000 0000 0002 | Qualquer | Futura |

### Testar Webhook Localmente
```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escutar webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Simular evento
stripe trigger checkout.session.completed
```

### Testar API de Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "uuid",
    "context_text": "Olá, como você está?",
    "style": "friendly"
  }'
```

---

## 📊 Monitoramento

### Logs
- **Vercel**: https://vercel.com/seu-projeto/logs
- **Stripe**: https://dashboard.stripe.com/logs
- **Supabase**: SQL Editor → `SELECT * FROM operations_log`

### Métricas
```sql
-- Total de assinaturas ativas
SELECT plan, COUNT(*) 
FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan;

-- Receita mensal (MRR)
SELECT 
  SUM(CASE WHEN plan = 'pro' THEN 29.90 ELSE 79.90 END) as mrr
FROM subscriptions 
WHERE status = 'active';

-- Operações por tipo (últimas 24h)
SELECT op_type, COUNT(*) 
FROM operations_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY op_type;
```

---

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conectar Repositório**:
```bash
vercel
```

2. **Configurar Variáveis de Ambiente**:
- Acesse: Settings → Environment Variables
- Adicione todas as variáveis do `.env.local`

3. **Deploy**:
```bash
vercel --prod
```

### Configurar Domínio
1. Adicionar domínio na Vercel: Settings → Domains
2. Configurar DNS na Hostinger:
   - Tipo: CNAME
   - Nome: @
   - Valor: cname.vercel-dns.com

---

## 🐛 Troubleshooting

### Webhook não funciona
**Solução**:
1. Verificar URL no Stripe Dashboard
2. Verificar `STRIPE_WEBHOOK_SECRET`
3. Testar com Stripe CLI

### Erro 403 nas APIs
**Solução**:
1. Verificar assinatura ativa do usuário
2. Verificar `SUPABASE_SERVICE_ROLE_KEY`
3. Verificar RLS no Supabase

### Notificações não chegam
**Solução**:
1. Verificar `FIREBASE_SERVER_KEY`
2. Verificar device token em `device_tokens`
3. Verificar logs em `operations_log`

---

## 📝 Roadmap

### Em Desenvolvimento
- [ ] Dashboard de analytics
- [ ] Integração com WhatsApp
- [ ] Suporte a múltiplos idiomas
- [ ] API pública para desenvolvedores

### Futuro
- [ ] App desktop (Electron)
- [ ] Integração com CRM
- [ ] Webhooks customizados
- [ ] Marketplace de plugins

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- **Email**: suporte@zuriasistent.com
- **Website**: https://zuriasistent.com
- **Documentação**: Ver arquivos `.md` no repositório

---

## 🎉 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Stripe](https://stripe.com/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [Vercel](https://vercel.com/)

---

**Desenvolvido com ❤️ pela equipe ZURI**
