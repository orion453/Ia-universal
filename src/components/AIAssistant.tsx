/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, User, ShieldAlert, Cpu, Radio, ChevronRight, HelpCircle } from "lucide-react";
import { ChatMessage, RiskLevel } from "../types";

interface AIAssistantProps {
  activeStrategy: string;
  riskLevel: RiskLevel;
  virtualCapital: number;
  currentPlan: string;
  idToken: string | null;
}

export default function AIAssistant({
  activeStrategy,
  riskLevel,
  virtualCapital,
  currentPlan,
  idToken
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Sincronizada");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set default welcome message or fetch historical messages from backend
  useEffect(() => {
    if (!idToken) {
      setMessages([
        {
          id: "welcome-msg",
          role: "model",
          text: `¡Saludos, inversionista! Soy **Adexa IA**, tu Inteligencia Artificial Universal de Inversiones. 
  
He sincronizado con el mercado global en tiempo real y he cargado tu perfil. Actualmente opero bajo una suscripción **${currentPlan}**, con un capital simulado de **$${virtualCapital.toLocaleString()} USD** y la estrategia de riesgo **${riskLevel}**.
  
¿En qué te puedo asesorar hoy? Puedes preguntarme:
- ¿Qué criptoactivos se proyectan al alza para las próximas horas?
- Analiza la resistencia del S&P 500 y cómo afecta a mi portafolio.
- Dame una estrategia micro-scalping optimizada para proteger capital.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      return;
    }

    const loadHistoryFromDB = async () => {
      try {
        setStatusText("Restaurando bitácora cuántica...");
        const response = await fetch("/api/chat-messages", {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        if (response.ok) {
          const historicalLogs = await response.json();
          if (historicalLogs && historicalLogs.length > 0) {
            const mappedMessages: ChatMessage[] = historicalLogs.map((log: any) => ({
              id: log.id,
              role: log.role as "user" | "model",
              text: log.text,
              timestamp: new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
            setMessages(mappedMessages);
          } else {
            // First time auth, render initial welcome
            setMessages([
              {
                id: "welcome-msg",
                role: "model",
                text: `¡Te has autenticado correctamente con tu cuenta! Bienvenido a **Adexa IA Mobile** con almacenamiento en base de datos PostgreSQL en la nube de Google Cloud (Cloud SQL).

Toda tu bitácora de chat y transacciones ahora se almacenan de forma segura e indefinida. ¿En qué te puedo asistir el día de hoy?`,
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
          }
        }
        setStatusText("Sincronizada");
      } catch (err) {
        console.error("Error loading chat history:", err);
        setStatusText("Error de sincronización");
      }
    };

    loadHistoryFromDB();
  }, [idToken]);

  const promptSuggestions = [
    "¿Qué activos recomiendas hoy?",
    "¿Qué activos es mejor evitar?",
    "¿Cómo protejo mis $ vs inflación?",
    "Explica mi riesgo actual"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    setStatusText("Procesando redes neuronales...");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: textToSend,
          strategy: activeStrategy,
          riskLevel: riskLevel,
          capital: virtualCapital
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: data.id || (Date.now() + 1).toString(),
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStatusText(data.note ? "Simulado / Sin API Key" : "Sincronizada");
    } catch (error) {
      console.error("Error communicating with Adexa back-end:", error);
      
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Disculpa, he tenido una fluctuación de red en mis servidores cuánticos. Por favor asegúrate de que el servidor remoto esté activo y vuelve a intentarlo en unos momentos.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setStatusText("Fluctuación de Red");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format simplified bold text '**text**' and lists in chats
  const formatMessageText = (text: string) => {
    return text.split("\n").map((line, lIdx) => {
      // Handle list items starting with '-' or '*'
      const isListItem = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const cleanLine = isListItem ? line.trim().substring(2) : line;

      // Handle bold blocks '**text**'
      const parts = cleanLine.split(/\*\*(.*?)\*\*/);
      const elements = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="text-[#00FF9D] font-bold">{part}</strong>;
        }
        return part;
      });

      if (isListItem) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-zinc-200 text-sm py-0.5 leading-relaxed">
            {elements}
          </li>
        );
      }

      return (
        <p key={lIdx} className="text-zinc-200 text-sm leading-relaxed mb-2">
          {elements}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden neon-border-bento transition-all duration-300">
      {/* AI Assistant Header */}
      <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#00FF9D] flex items-center justify-center text-black font-mono font-bold text-lg border border-[#00FF9D]/25">
              A
            </div>
            {/* Pulsing online status indicator */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00FF9D] border-2 border-zinc-900 pulsing-neural-node" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-wide text-white uppercase">Adexa IA</span>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-md border border-zinc-700 font-mono">
                Neural.V2
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <Radio className="w-3 h-3 text-[#00FF9D] animate-pulse" />
              Estatus: <span className="text-[#00FF9D] font-bold">{statusText}</span>
            </p>
          </div>
        </div>

        {/* Neural Network Micro-Gauge */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono">NEURAL FREQ</span>
          <div className="flex gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-3 rounded-[1px] transition-all duration-300 ${
                  isLoading 
                    ? "bg-[#00FF9D] animate-bounce" 
                    : i < 4 
                      ? "bg-zinc-500" 
                      : "bg-zinc-800"
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages Sandbox Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              msg.role === "user" 
                ? "bg-zinc-850 border-zinc-700 text-zinc-300"
                : "bg-zinc-950 border-zinc-800 text-zinc-400"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble block */}
            <div className={`rounded-2xl px-4 py-3 border ${
              msg.role === "user"
                ? "bg-zinc-800/40 border-zinc-700 text-zinc-100 rounded-tr-none"
                : "bg-zinc-950 border-zinc-850 rounded-tl-none"
            }`}>
              <div className="prose prose-zinc max-w-none">
                {formatMessageText(msg.text)}
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/40">
                <span className="text-[9px] text-zinc-500 font-mono">
                  {msg.role === "user" ? "INVERSIONISTA" : "ADEXA SYSTEM"}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-[50%] mr-auto">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-950 border border-zinc-850 text-zinc-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-zinc-400 font-mono">Modelando mercado...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Quick Chips */}
      <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-900 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#00FF9D]" /> Consultas rápidas:
        </span>
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            className="text-[10px] px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all hover:text-white font-mono text-left cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Inputs form section */}
      <div className="px-4 py-3 border-t border-zinc-900 bg-zinc-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Haz una pregunta financiera, técnica o de backtesting a Adexa..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs outline-none focus:border-[#00FF9D] font-mono placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-white hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none text-black font-mono font-bold flex items-center gap-1.5 text-xs cursor-pointer transition-all uppercase tracking-wide shrink-0"
          >
            <span>Preguntar</span>
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00FF9D]" /> Sincronizada con S&P500, BTC, Oro Spot
          </span>
          <span className="hidden sm:inline">DavidHerreraproducciones S.A.S • NIT: 901906721-1</span>
        </div>
      </div>
    </div>
  );
}
