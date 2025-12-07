"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/web/src/lib/supabase";
import { Users, MessageSquare, Activity, DollarSign } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

 async function loadStats() {
  try {
    // Total de usuários
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Usuários ativos (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: activeUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", sevenDaysAgo.toISOString());

    // Total de mensagens
    const { count: totalMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    setStats({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalMessages: totalMessages || 0,
      revenue: 0
    });
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  } finally {
    setLoading(false);
  }
}
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Usuários Ativos",
      value: stats.activeUsers,
      icon: Activity,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Total de Mensagens",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Receita (MRR)",
      value: `R$ ${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral do sistema ZURI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${card.color} p-6`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Usuários */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Crescimento de Usuários
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico em desenvolvimento
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Atividade Recente
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Novo usuário registrado
                </p>
                <p className="text-xs text-gray-500">Há 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Nova mensagem processada
                </p>
                <p className="text-xs text-gray-500">Há 12 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Assinatura Pro ativada
                </p>
                <p className="text-xs text-gray-500">Há 1 hora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
