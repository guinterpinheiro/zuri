# 🚀 ZURI - Assistente Inteligente Completo

<div align="center">

![ZURI Logo](assets/logo.png)

**Assistente de IA com Voz, Mensagens, Tarefas e Chamadas**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.0+-blue)](https://flutter.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)

[Demo](https://zuri.app) • [Documentação](docs/) • [Suporte](mailto:suporte@zuri.app)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre

**ZURI** é um assistente inteligente completo que combina IA conversacional, reconhecimento de voz, gerenciamento de tarefas e chamadas em uma única plataforma. Desenvolvido com as melhores tecnologias do mercado para oferecer uma experiência fluida e moderna.

### Por que ZURI?

- ✨ **Interface Moderna**: Design limpo e intuitivo
- 🤖 **IA Avançada**: Powered by GPT-4
- 🎤 **Reconhecimento de Voz**: Transcrição em tempo real
- 📱 **Multiplataforma**: Web, iOS e Android
- 🔒 **Seguro**: Autenticação robusta e dados criptografados
- ⚡ **Rápido**: Edge Functions para baixa latência
- 💰 **Monetização**: Integração completa com Stripe

---

## ✨ Funcionalidades

### 📱 Mobile (Flutter)

- **Autenticação**
  - Login/Registro com email
  - Autenticação social (Google, Apple)
  - Recuperação de senha
  - Biometria (Face ID / Touch ID)

- **Mensagens com IA**
  - Chat em tempo real com GPT-4
  - Histórico de conversas
  - Sugestões inteligentes
  - Contexto persistente

- **Reconhecimento de Voz**
  - Transcrição de áudio (Whisper)
  - Comandos por voz
  - Síntese de voz (TTS)
  - Múltiplos idiomas

- **Tarefas**
  - Criar e gerenciar tarefas
  - Lembretes inteligentes
  - Categorização automática
  - Sincronização em tempo real

- **Chamadas**
  - Histórico de chamadas
  - Integração com contatos
  - Gravação de chamadas
  - Transcrição automática

- **Perfil**
  - Edição de dados pessoais
  - Gerenciamento de assinatura
  - Configurações de privacidade
  - Tema claro/escuro

- **Notificações Push**
  - Alertas em tempo real
  - Notificações personalizadas
  - Firebase (Android) + APNs (iOS)

### 🌐 Web (Next.js)

- **Landing Page**
  - Design profissional
  - Seções de features
  - Depoimentos
  - Pricing
  - FAQ
  - Call-to-action

- **Painel Admin**
  - Dashboard com analytics
  - Gerenciamento de usuários
  - Monitoramento de mensagens
  - Logs de IA
  - Configurações do sistema
  - Relatórios financeiros

- **Autenticação**
  - Login seguro
  - Sessões persistentes
  - Controle de acesso (RBAC)

### ⚡ Edge Functions (Deno)

- **llm-respond**: Proxy para OpenAI GPT-4
- **asr-transcribe**: Transcrição de áudio com Whisper
- **push-notify**: Envio de notificações push
- **stripe-webhook**: Processamento de eventos Stripe
- **Middleware**: Rate limiting, autenticação, logs

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    ZURI Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Mobile     │  │     Web      │  │    Admin     │ │
│  │  (Flutter)   │  │  (Next.js)   │  │   Panel      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                   ┌────────▼────────┐                   │
│                   │  Supabase Edge  │                   │
│                   │   Functions     │                   │
│                   └────────┬────────┘                   │
│                            │                             │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │   Supabase   │  │    OpenAI    │  │    Stripe    │ │
│  │   Database   │  │   GPT-4 +    │  │   Payments   │ │
│  │   + Auth     │  │   Whisper    │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   Firebase   │  │     APNs     │                   │
│  │     FCM      │  │    (Apple)   │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Frontend

- **Web**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mobile**: Flutter 3.0+, Dart

### Backend

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Edge Functions**: Deno
- **Storage**: Supabase Storage

### Integrações

- **IA**: OpenAI (GPT-4, Whisper, TTS)
- **Pagamentos**: Stripe
- **Push**: Firebase Cloud Messaging + Apple Push Notifications
- **Deploy**: Vercel (Web) + Supabase (Edge)

### DevOps

- **CI/CD**: GitHub Actions
- **Monorepo**: Estrutura modular
- **Scripts**: Automação completa

---

## 🚀 Instalação

### Pré-requisitos

```bash
# Node.js 18+
node --version

# Flutter 3.0+
flutter --version

# Supabase CLI
npm install -g supabase

# Git
git --version
```

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/zuri.git
cd zuri
```

### 2. Configurar Variáveis de Ambiente

```bash
# Execute o script de configuração
node replacePlaceholders.js

# Será solicitado:
# - Email de suporte
# - URL do app
# - Credenciais Supabase
# - API Keys (OpenAI, Stripe, Firebase)
```

### 3. Instalar Dependências

```bash
# Web
cd web
npm install

# Mobile
cd ../mobile
flutter pub get
```

### 4. Executar Migrations

```bash
cd infra
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

### 5. Executar Localmente

```bash
# Web
cd web
npm run dev
# Acesse: http://localhost:3000

# Mobile
cd mobile
flutter run
```

---

## 📦 Deploy

### Web (Vercel)

```bash
cd web
vercel --prod
```

### Edge Functions (Supabase)

```bash
cd edge
supabase functions deploy
```

### Mobile

**Android:**
```bash
cd mobile
flutter build appbundle --release
# Upload para Google Play Console
```

**iOS:**
```bash
cd mobile
flutter build ipa --release
# Upload para App Store Connect
```

📖 **Guia completo**: [docs/DEPLOY.md](docs/DEPLOY.md)

---

## 📁 Estrutura do Projeto

```
zuri/
├── mobile/                 # App Flutter
│   ├── lib/
│   │   ├── screens/       # Telas do app
│   │   ├── services/      # Serviços (API, Auth, Notificações)
│   │   ├── models/        # Modelos de dados
│   │   └── widgets/       # Componentes reutilizáveis
│   ├── android/           # Configuração Android
│   └── ios/               # Configuração iOS
│
├── web/                   # App Next.js
│   └── src/
│       ├── app/           # Páginas e rotas
│       │   ├── admin/     # Painel admin
│       │   └── page.tsx   # Landing page
│       ├── components/    # Componentes React
│       └── lib/           # Utilitários
│
├── edge/                  # Supabase Edge Functions
│   └── functions/
│       ├── llm-respond/
│       ├── asr-transcribe/
│       ├── push-notify/
│       └── stripe-webhook/
│
├── infra/                 # Infraestrutura
│   ├── migrations/        # SQL migrations
│   └── scripts/           # Scripts de automação
│
├── docs/                  # Documentação
│   ├── SETUP.md          # Guia de instalação
│   ├── DEPLOY.md         # Guia de deploy
│   └── API.md            # Referência da API
│
├── policies/              # Políticas legais
│   ├── privacy.html      # Política de privacidade
│   ├── terms.html        # Termos de uso
│   └── cookies.html      # Política de cookies
│
├── assets/                # Assets do projeto
│   ├── logo.png
│   ├── screenshots/
│   └── demo/
│
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD automático
│
├── .env.example          # Template de variáveis
├── replacePlaceholders.js # Script de configuração
└── README.md             # Este arquivo
```

---

## 📚 Documentação

- [📖 Guia de Instalação](docs/SETUP.md)
- [🚀 Guia de Deploy](docs/DEPLOY.md)
- [🔌 Referência da API](docs/API.md)
- [🏗️ Arquitetura](docs/ARCHITECTURE.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- **Email**: suporte@zuri.app
- **Discord**: [Comunidade ZURI](https://discord.gg/zuri)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/zuri/issues)

---

## 🌟 Agradecimentos

- [OpenAI](https://openai.com/) - GPT-4 e Whisper
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting e deploy
- [Flutter](https://flutter.dev/) - Framework mobile
- [Next.js](https://nextjs.org/) - Framework web

---

<div align="center">

**Feito com ❤️ pela equipe ZURI**

[Website](https://zuri.app) • [Twitter](https://twitter.com/zuriapp) • [LinkedIn](https://linkedin.com/company/zuri)

</div>
