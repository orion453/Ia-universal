/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Terminal, ShieldCheck, Activity, Cpu, Calendar, DollarSign, Compass,
  HelpCircle, Settings, Users, ArrowUpRight, TrendingUp, Sparkles, Gem,
  PieChart, Phone, Smartphone, Wifi, Battery, BatteryCharging, Signal, Clock, Info
} from "lucide-react";
import { auth, db, googleAuthProvider } from "./lib/firebase.ts";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import { InvestmentStrategy, RiskLevel } from "./types";
import { STRATEGIES } from "./data";
import AIAssistant from "./components/AIAssistant";
import TradingTerminal from "./components/TradingTerminal";
import StrategyLab from "./components/StrategyLab";
import MarketSentimentScanner from "./components/MarketSentimentScanner";
import PricingPlans from "./components/PricingPlans";
import PortfolioSuite from "./components/PortfolioSuite";

export default function App() {
  // Shared global States
  const [activeStrategy, setActiveStrategy] = useState<InvestmentStrategy>(STRATEGIES[1]); // Default to Neural Swing Trading
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Moderado");
  const [virtualCapital, setVirtualCapital] = useState<number>(15000); // Default simulated initial capital S.A.S
  const [currentPlan, setCurrentPlan] = useState<string>("Membresía PRO");
  const [activeTab, setActiveTab] = useState<"terminal" | "backtesting" | "portafolio" | "finances" | "plans">("terminal");
  const [phoneTime, setPhoneTime] = useState<string>("12:00");
  const [batteryLevel, setBatteryLevel] = useState<number>(98);
  const [isFullscreenOnDesktop, setIsFullscreenOnDesktop] = useState<boolean>(false);

  // Validate Connection to Firestore on startup
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        console.log("Firestore connection verified successfully.");
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Please check your Firebase configuration or network status.");
        } else {
          // It's fine if the document is not found, as long as we got a response from firestore server
          console.log("Firestore connection test completed.");
        }
      }
    };
    testConnection();
  }, []);

  // Authentication & Cloud SQL sync states
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Listen for Firebase Auth state shifts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          setIsSyncing(true);
          const token = await currentUser.getIdToken();
          setIdToken(token);

          // Synchronize user profile from remote Postgres Cloud SQL
          const res = await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.user) {
              setVirtualCapital(data.user.virtualCapital);
              setCurrentPlan(data.user.currentPlan);
              setRiskLevel(data.user.riskLevel);
              const matchedStr = STRATEGIES.find((s) => s.id === data.user.activeStrategyId);
              if (matchedStr) {
                setActiveStrategy(matchedStr);
              }
            }
          }
        } catch (error) {
          console.error("Error syncing profile with Cloud SQL:", error);
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIdToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state mutations back to Cloud SQL
  const syncProfileToBackend = async (updates: {
    virtualCapital?: number;
    currentPlan?: string;
    riskLevel?: string;
    activeStrategyId?: string;
  }) => {
    if (!idToken) return;
    try {
      await fetch("/api/user-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Error updating profile in backend:", err);
    }
  };

  useEffect(() => {
    if (!idToken || isSyncing) return;
    
    // Automatically debounce/save profile parameter changes made by subcomponents
    const timeout = setTimeout(() => {
      syncProfileToBackend({
        virtualCapital,
        currentPlan,
        riskLevel,
        activeStrategyId: activeStrategy.id
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [idToken, virtualCapital, currentPlan, riskLevel, activeStrategy.id, isSyncing]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Revert states back to anonymous defaults
      setVirtualCapital(15000);
      setCurrentPlan("Membresía PRO");
      setRiskLevel("Moderado");
      setActiveStrategy(STRATEGIES[1]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Live time ticker for the mobile status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setPhoneTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Battery simulation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 15) return 100;
        return prev - 1;
      });
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Handler for trade bot profit triggers
  const handleTradeExecuted = (profit: number) => {
    setVirtualCapital((prev) => Number((prev + profit).toFixed(2)));
  };

  const currentTabLabel = () => {
    switch (activeTab) {
      case "terminal": return "Terminal Recurrente";
      case "backtesting": return "Laboratorio Backtest";
      case "portafolio": return "Portafolio Inteligente";
      case "finances": return "Escáner IA";
      case "plans": return "Estilo Membresía";
      default: return "Adexa IA Mobile";
    }
  };

  const appContent = (
    <div className="flex flex-col h-full bg-[#09090b] text-white relative font-sans overflow-hidden select-none">
      
      {/* Phone StatusBar */}
      <div className="bg-[#030303] text-zinc-400 text-[10px] font-mono px-5 pt-3.5 pb-2.5 flex items-center justify-between shrink-0 border-b border-zinc-900 select-none">
        {/* Local device time */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#00FF9D]" />
          <span className="font-bold text-zinc-300">{phoneTime}</span>
        </div>

        {/* Dynamic Island Notch in simulator */}
        <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-2 w-[110px] h-6 bg-black rounded-full border border-zinc-850/50 z-55 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-950/40 border border-blue-900/45 absolute left-3" />
          <div className="w-2.5 h-1 bg-[#00FF9D]/80 rounded-full absolute right-4 animate-pulse" />
        </div>

        {/* Connection status indicators */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] bg-[#00FF9D]/10 text-[#00FF9D] font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-widest leading-none">
            5G LIVE
          </span>
          <Signal className="w-3 h-3 text-zinc-400" />
          <Wifi className="w-3 h-3 text-zinc-350" />
          <div className="flex items-center gap-0.5">
            <span className="text-[9px] font-bold font-mono text-zinc-300">{batteryLevel}%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-[#00FF9D] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main app header (Compact for mobile) */}
      <header className="bg-gradient-to-b from-[#0e0e11] to-[#09090b] px-4 py-3 border-b border-zinc-900 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-855 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
            <svg className="w-5.5 h-5.5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="42" stroke="url(#headNeon)" strokeWidth="1.5" strokeOpacity="0.25" />
              <path d="M 33 74 L 48 35 C 49 32, 51 32, 52 35 L 67 74" stroke="url(#headNeon)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 38 61 Q 50 63, 67 52" stroke="url(#headNeon)" strokeWidth="6" strokeLinecap="round" />
              <defs>
                <linearGradient id="headNeon" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="60%" stopColor="#00FF9D" />
                  <stop offset="100%" stopColor="#A7FF3F" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-black text-white text-xs tracking-wider uppercase leading-none">
              ADEXA MOBILE
            </h1>
            <span className="text-[7.5px] text-zinc-500 font-mono tracking-widest block mt-0.5">
              DAVIDHERRERAPRODUCCIONES S.A.S
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* User auth state or Sign In button */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#0d0d11] border border-zinc-850 pl-1.5 pr-2.5 py-1 rounded-xl select-none">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Usuario"} 
                  className="w-5.5 h-5.5 rounded-full border border-[#00FF9D]/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5.5 h-5.5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-[#00FF9D]">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[7.5px] font-black text-white leading-none block max-w-[55px] truncate">
                  {user.displayName?.split(" ")[0] || "Trader"}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-[6.5px] text-red-400 hover:text-red-300 font-mono text-left cursor-pointer transition-all mt-0.5 leading-none"
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-[#00FF9D]/40 text-white font-mono text-[8.5px] font-bold px-2 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wide shrink-0 animate-pulse"
            >
              <Sparkles className="w-3 h-3 text-[#00FF9D]" /> Conectar
            </button>
          )}

          {/* Floating live simulated capital badge */}
          <div className="bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded-xl text-right select-none">
            <span className="text-[7px] text-zinc-500 block uppercase font-mono tracking-tight leading-none mb-0.5">VIRTUAL</span>
            <span className="text-[10px] font-black text-[#00FF9D] font-mono leading-none font-bold">
              ${virtualCapital.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Info Context Marquee Banner */}
      <div className="bg-zinc-950/70 border-b border-zinc-900 px-4 py-1.5 text-[8.5px] font-mono text-zinc-400 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
          <span className="truncate text-zinc-300">Bot Activo: <strong>{activeStrategy.name}</strong></span>
        </div>
        <span className="text-[#00FF9D] shrink-0 font-bold">{currentPlan}</span>
      </div>

      {/* Dynamic Viewport Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-none scroll-smooth">
        
        {activeTab === "terminal" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Core Candlesticks Chart component customized for full width touch scrolling */}
            <TradingTerminal 
              currentPlan={currentPlan}
              onTradeExecuted={handleTradeExecuted}
              virtualCapital={virtualCapital}
              idToken={idToken}
            />

            {/* Smart IA Assistant Prompt module */}
            <AIAssistant 
              activeStrategy={activeStrategy.name}
              riskLevel={riskLevel}
              virtualCapital={virtualCapital}
              currentPlan={currentPlan}
              idToken={idToken}
            />
          </div>
        )}

        {activeTab === "backtesting" && (
          <div className="animate-fade-in h-full">
            <StrategyLab 
              activeStrategy={activeStrategy}
              setActiveStrategy={setActiveStrategy}
              riskLevel={riskLevel}
              setRiskLevel={setRiskLevel}
              virtualCapital={virtualCapital}
              setVirtualCapital={setVirtualCapital}
            />
          </div>
        )}

        {activeTab === "portafolio" && (
          <div className="animate-fade-in">
            <PortfolioSuite />
          </div>
        )}

        {activeTab === "finances" && (
          <div className="animate-fade-in">
            <MarketSentimentScanner 
              idToken={idToken}
              virtualCapital={virtualCapital}
              onTradeExecuted={handleTradeExecuted}
              activeStrategy={activeStrategy.name}
            />
          </div>
        )}

        {activeTab === "plans" && (
          <div className="animate-fade-in">
            <PricingPlans 
              currentPlan={currentPlan}
              setCurrentPlan={setCurrentPlan}
              setVirtualCapital={setVirtualCapital}
              setRiskLevel={setRiskLevel}
            />
          </div>
        )}

      </div>

      {/* Mobile-Native Persistent Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-[#060608]/95 backdrop-blur-xl border-t border-zinc-900 py-2.5 px-3 z-50 flex items-center justify-between select-none">
        {[
          { id: "terminal", label: "Terminal IA", icon: Terminal },
          { id: "backtesting", label: "Lab Test", icon: Activity },
          { id: "portafolio", label: "Portafolio", icon: PieChart },
          { id: "finances", label: "Escáner IA", icon: Compass },
          { id: "plans", label: "Membresía", icon: Gem }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                // Simulate physical haptic touch
                if (navigator.vibrate) navigator.vibrate(12);
                setActiveTab(tab.id as any);
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 text-center transition-all cursor-pointer relative"
              style={{ minHeight: "44px" }}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "text-zinc-500 hover:text-zinc-300"
              }`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className={`text-[8.5px] font-mono leading-none tracking-tight font-medium ${
                isActive ? "text-[#00FF9D] font-bold" : "text-zinc-500"
              }`}>
                {tab.label}
              </span>
              
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#00FF9D] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-center items-center p-0 sm:p-4 md:p-8 font-sans antialiased relative overflow-hidden selection:bg-[#00FF9D]/20">
      
      {/* Decorative vector matrix or background pattern to create professional applet canvas */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF9D]/3 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Desktop frame toggle helper controller button */}
      <div className="hidden md:flex absolute top-5 right-5 items-center gap-3 z-50 bg-zinc-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-800 text-xs font-mono">
        <Smartphone className="w-4 h-4 text-[#00FF9D]" />
        <span className="text-zinc-400 font-semibold">Visualizador Móvil Adexa</span>
        <button
          onClick={() => setIsFullscreenOnDesktop(!isFullscreenOnDesktop)}
          className="ml-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-[#00FF9D] border border-zinc-700/60 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition-all"
        >
          {isFullscreenOnDesktop ? "Ajustar al Celular" : "Pantalla Completa"}
        </button>
      </div>

      {/* Conditionally rendering standard native smartphone bezel wrapper */}
      {isFullscreenOnDesktop ? (
        <div className="w-full h-screen max-w-none rounded-none border-none shadow-none overflow-hidden relative">
          {appContent}
        </div>
      ) : (
        <div className="w-full h-full max-w-md max-h-[880px] min-h-[750px] aspect-[9/19.5] sm:aspect-auto sm:h-[820px] bg-black sm:rounded-[44px] sm:border-8 sm:border-zinc-800 sm:ring-4 sm:ring-zinc-900/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden relative flex flex-col">
          
          {/* Subtle simulated ambient hardware speaker notch or reflections */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 h-1.5 bg-zinc-850 z-52" />
          
          {/* Physical bottom native home-bar handle indicator */}
          <div className="hidden sm:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-800 rounded-full z-55 pointer-events-none" />
          
          {/* Inside Mobile app context flow */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {appContent}
          </div>
        </div>
      )}

      {/* Minimalistic legal copyright line on desktop margin footer */}
      <div className="hidden md:block mt-5 text-[9.5px] text-zinc-650 font-mono text-center tracking-wide">
        DavidHerreraproducciones S.A.S • NIT: 901906721-1 • Optimizado para Android (Google Play) e iOS (App Store) • 2026 CO
      </div>

    </div>
  );
}

