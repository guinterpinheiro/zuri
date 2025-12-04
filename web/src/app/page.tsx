import Link from 'next/link'
import { ArrowRight, MessageSquare, Phone, CheckSquare, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">Z</span>
            </div>
            <span className="text-2xl font-bold text-white">ZURI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Painel Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6">
            Seu Assistente Inteligente
          </h1>
          <p className="text-xl text-white/90 mb-12">
            ZURI gerencia suas mensagens, chamadas e tarefas com inteligência artificial.
            Nunca mais perca uma informação importante.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition flex items-center space-x-2"
            >
              <span>Começar Agora</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition"
            >
              Saiba Mais
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Mensagens Inteligentes"
            description="Respostas automáticas e contextuais para WhatsApp, Telegram e mais"
          />
          <FeatureCard
            icon={<Phone className="w-8 h-8" />}
            title="Transcrição de Chamadas"
            description="Converta chamadas em texto e obtenha resumos automáticos"
          />
          <FeatureCard
            icon={<CheckSquare className="w-8 h-8" />}
            title="Gestão de Tarefas"
            description="Crie e organize tarefas automaticamente a partir de conversas"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Automações"
            description="Configure regras e deixe o ZURI trabalhar por você"
          />
        </div>

        {/* Stats */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 text-center">
          <StatCard number="10k+" label="Mensagens Processadas" />
          <StatCard number="500+" label="Horas Economizadas" />
          <StatCard number="99%" label="Satisfação" />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-32 border-t border-white/20">
        <div className="text-center text-white/80">
          <p>&copy; 2024 ZURI. Todos os direitos reservados.</p>
          <div className="mt-4 space-x-6">
            <Link href="/policies/privacy.html" className="hover:text-white transition">
              Privacidade
            </Link>
            <Link href="/policies/terms.html" className="hover:text-white transition">
              Termos
            </Link>
            <a href="mailto:SUPPORT_EMAIL_PLACEHOLDER" className="hover:text-white transition">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition">
      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-indigo-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
      <div className="text-5xl font-bold text-white mb-2">{number}</div>
      <div className="text-white/80">{label}</div>
    </div>
  )
}
