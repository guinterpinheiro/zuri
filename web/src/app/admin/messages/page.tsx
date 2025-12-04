"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { MessageSquare, Bot, User, Calendar } from "lucide-react";

interface Message {
  id: string;
  user_id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "user" | "ai">("all");

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    if (filter === "ai") return msg.is_ai;
    if (filter === "user") return !msg.is_ai;
    return true;
  });

  const stats = {
    total: messages.length,
    user: messages.filter((m) => !m.is_ai).length,
    ai: messages.filter((m) => m.is_ai).length,
  };

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
          Mensagens
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Histórico de conversas e interações com IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total de Mensagens
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
            <MessageSquare className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Mensagens de Usuários
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.user}
              </p>
            </div>
            <User className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Respostas da IA
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.ai}
              </p>
            </div>
            <Bot className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter("user")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "user"
              ? "bg-green-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setFilter("ai")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "ai"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          IA
        </button>
      </div>

      {/* Lista de Mensagens */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.is_ai
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  {message.is_ai ? (
                    <Bot className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {message.is_ai
                        ? "ZURI AI"
                        : message.profiles?.full_name || "Usuário"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma mensagem encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
