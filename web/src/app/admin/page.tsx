'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  MessageSquare, 
  Phone, 
  CheckSquare, 
  TrendingUp,
  Activity,
  DollarSign,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalCalls: 0,
    totalTasks: 0,
    activeSubscriptions: 0,
    revenue: 0
  })

  useEffect(() => {
    checkAuth()
    loadStats()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/admin/login')
      return
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!userData?.is_admin) {
      router.push('/')
      return
    }

    setUser(userData)
    setLoading(false)
  }

  async function loadStats() {
    try {
      // Total de usuários
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Total de mensagens
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Total de chamadas
      const { count: callsCount } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })

      // Total de tarefas
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })

      // Assinaturas ativas
      const { count: subsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      setStats({
        totalUsers: usersCount || 0,
        totalMessages: messagesCount || 0,
        totalCalls: callsCount || 0,
        totalTasks: tasksCount || 0,
        activeSubscriptions: subsCount || 0,
        revenue: (subsCount || 0) * 29.90 // Exemplo
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ZURI Admin</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total de Usuários"
            value={stats.totalUsers.toString()}
            change="+12%"
            positive
          />
          <StatCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Mensagens Processadas"
            value={stats.totalMessages.toString()}
            change="+8%"
            positive
          />
          <StatCard
            icon={<Phone className="w-6 h-6" />}
            title="Chamadas Transcritas"
            value={stats.totalCalls.toString()}
            change="+15%"
            positive
          />
          <StatCard
            icon={<CheckSquare className="w-6 h-6" />}
            title="Tarefas Criadas"
            value={stats.totalTasks.toString()}
            change="+5%"
            positive
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Assinaturas Ativas"
            value={stats.activeSubscriptions.toString()}
            change="+20%"
            positive
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Receita Mensal"
            value={`R$ ${stats.revenue.toFixed(2)}`}
            change="+18%"
            positive
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <ActionButton
              icon={<Users className="w-5 h-5" />}
              label="Gerenciar Usuários"
              href="/admin/users"
            />
            <ActionButton
              icon={<MessageSquare className="w-5 h-5" />}
              label="Ver Mensagens"
              href="/admin/messages"
            />
            <ActionButton
              icon={<Settings className="w-5 h-5" />}
              label="Configurações"
              href="/admin/settings"
            />
            <ActionButton
              icon={<TrendingUp className="w-5 h-5" />}
              label="Relatórios"
              href="/admin/reports"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            <ActivityItem
              type="user"
              message="Novo usuário registrado"
              time="2 minutos atrás"
            />
            <ActivityItem
              type="message"
              message="100 novas mensagens processadas"
              time="15 minutos atrás"
            />
            <ActivityItem
              type="subscription"
              message="Nova assinatura Pro ativada"
              time="1 hora atrás"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ 
  icon, 
  title, 
  value, 
  change, 
  positive 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
          {icon}
        </div>
        <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ActionButton({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition"
    >
      <div className="text-indigo-600">{icon}</div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  )
}

function ActivityItem({ type, message, time }: { type: string; message: string; time: string }) {
  const icons = {
    user: <Users className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
    subscription: <DollarSign className="w-5 h-5" />
  }

  return (
    <div className="flex items-start space-x-3 p-3 border-l-4 border-indigo-600 bg-gray-50">
      <div className="text-indigo-600 mt-0.5">
        {icons[type as keyof typeof icons]}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}
