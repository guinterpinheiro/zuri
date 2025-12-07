
"use client";

import { useEffect, useState } from "react";
import { MessageSquare, DollarSign } from "lucide-react";

interface Stats {
  totalMessages: number;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // dados mockados (temporários)
    setStats({
      totalMessages: 0,
      revenue: 0,
    });
    setLoading(false);
  }, []);

  const cards = [
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Visão geral do sistema ZURI</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
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
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
