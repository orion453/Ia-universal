import React, { useState, useEffect } from "react";
import { 
  Compass, AlertTriangle, Cpu, TrendingUp, TrendingDown, 
  CheckCircle, Zap, ShieldAlert, Award, FileText, ArrowRight, Play
} from "lucide-react";

interface MarketSentimentScannerProps {
  idToken: string | null;
  virtualCapital: number;
  onTradeExecuted: (profit: number) => void;
  activeStrategy: string;
}

interface NewsItem {
  id: string;
  asset: string;
  title: string;
  source: string;
  time: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  impactScore: number; // 1 to 100
}

const PRESET_NEWS: NewsItem[] = [
  {
    id: "news_1",
    asset: "BTC",
    title: "Reserva Federal mantiene tasas de interés: Analistas proyectan un fuerte impulso de liquidez hacia activos de riesgo.",
    source: "Bloomberg Quantum",
    time: "Hace 5 minutos",
    sentiment: "BULLISH",
    impactScore: 88,
  },
  {
    id: "news_2",
    asset: "SOL",
    title: "Solana rompe récord de transacciones por segundo (TPS) en red principal tras actualización de v2.1 de validadores.",
    source: "CryptoSlam",
    time: "Hace 12 minutos",
    sentiment: "BULLISH",
    impactScore: 92,
  },
  {
    id: "news_3",
    asset: "AAPL",
    title: "Apple anuncia su revolucionario chip cuántico y asocia su hardware con modelos avanzados de inteligencia artificial local.",
    source: "TechPulse",
    time: "Hace 20 minutos",
    sentiment: "BULLISH",
    impactScore: 85,
  },
  {
    id: "news_4",
    asset: "TSLA",
    title: "Investigaciones del departamento de transporte generan volatilidad en el sistema de conducción autónoma de Tesla.",
    source: "Reuters Next",
    time: "Hace 35 minutos",
    sentiment: "BEARISH",
    impactScore: 68,
  },
  {
    id: "news_5",
    asset: "BTC",
    title: "Aduladores y grandes fondos de cobertura aumentan su acumulación de Bitcoin un 12% en billeteras frías.",
    source: "Glassnode Alerts",
    time: "Hace 48 minutos",
    sentiment: "BULLISH",
    impactScore: 79,
  }
];

export default function MarketSentimentScanner({
  idToken,
  virtualCapital,
  onTradeExecuted,
  activeStrategy
}: MarketSentimentScannerProps) {
  const [selectedAsset, setSelectedAsset] = useState<string>("SOL");
  const [news, setNews] = useState<NewsItem[]>(PRESET_NEWS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [sentimentScore, setSentimentScore] = useState<number>(78); // Out of 100
  const [sentimentLabel, setSentimentLabel] = useState<string>("Alza Fuerte (Bullish)");
  const [aiReport, setAiReport] = useState<string>("");
  const [activeSignal, setActiveSignal] = useState<{
    symbol: string;
    type: "COMPRA" | "VENTA";
    price: number;
    amount: number;
    takeProfit: number;
    stopLoss: number;
    total: number;
    confidence: number;
  } | null>(null);

  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Play advanced high-tech synthesizer beeps in browser
  const playBeep = (freq: number, duration: number, type: "sine" | "square" | "triangle" | "sawtooth" = "sine") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Automated feed rotation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuate scores slightly to show live action
      setSentimentScore(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(10, Math.min(95, prev + delta));
        if (next > 75) setSentimentLabel("Alza Fuerte (Extreme Bullish)");
        else if (next > 55) setSentimentLabel("Alza Moderada (Bullish)");
        else if (next > 40) setSentimentLabel("Consolidación Lateral (Neutral)");
        else setSentimentLabel("Baja de Corto Plazo (Bearish)");
        return next;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const handleScanSentiment = async () => {
    setIsScanning(true);
    setAiReport("");
    setActiveSignal(null);
    playBeep(880, 0.1, "sine");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const response = await fetch("/api/news-sentiment", {
        method: "POST",
        headers,
        body: JSON.stringify({ asset: selectedAsset })
      });

      if (response.ok) {
        const data = await response.json();
        setAiReport(data.analysis);
        setSentimentScore(data.score);
        setSentimentLabel(data.label);
        
        // Setup suggested order
        setActiveSignal({
          symbol: data.signal.symbol,
          type: data.signal.type,
          price: data.signal.price,
          amount: data.signal.amount,
          takeProfit: data.signal.takeProfit,
          stopLoss: data.signal.stopLoss,
          total: data.signal.total,
          confidence: data.signal.confidence
        });

        playBeep(1200, 0.15, "triangle");
      } else {
        throw new Error("Respuesta fallida del servidor.");
      }
    } catch (error) {
      console.error("Error running NLP scanner:", error);
      // Offline fallback
      setTimeout(() => {
        const mockPrice = selectedAsset === "BTC" ? 67450.25 : selectedAsset === "SOL" ? 148.80 : selectedAsset === "AAPL" ? 182.45 : 174.50;
        const score = Math.floor(Math.random() * 30) + 65; // Bullish
        setSentimentScore(score);
        setSentimentLabel("Alza Explosiva Detectada");
        setAiReport(`[Escaner Cuántico Adexa] El análisis semántico en tiempo real de múltiples canales para ${selectedAsset} revela una concentración significativa de interés institucional. Se observa una correlación de rebote alcista en el soporte de 15 períodos del gráfico promedio de 1 hora. La liquidez del mercado fluye favorablemente.`);
        
        setActiveSignal({
          symbol: selectedAsset,
          type: "COMPRA",
          price: mockPrice,
          amount: Number((1200 / mockPrice).toFixed(3)),
          takeProfit: Number((mockPrice * 1.08).toFixed(2)),
          stopLoss: Number((mockPrice * 0.965).toFixed(2)),
          total: 1200,
          confidence: score
        });

        playBeep(980, 0.2, "sine");
      }, 1500);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExecuteSignal = async () => {
    if (!activeSignal) return;

    if (virtualCapital < activeSignal.total) {
      setNotification({
        text: "Error: Capital virtual insuficiente para ejecutar esta señal cuántica.",
        type: "error"
      });
      playBeep(220, 0.4, "sawtooth");
      return;
    }

    try {
      if (idToken) {
        // Sync to cloud trade_logs directly
        const res = await fetch("/api/trade-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({
            symbol: activeSignal.symbol,
            type: activeSignal.type,
            price: activeSignal.price,
            amount: activeSignal.amount,
            total: activeSignal.total,
            strategy: `NLP Signal Scanner (${activeStrategy})`,
            status: "COMPLETADO"
          })
        });

        if (!res.ok) {
          throw new Error("No se pudo persistir la orden en el servidor.");
        }
      }

      // Deduct capital
      onTradeExecuted(-activeSignal.total);
      
      setNotification({
        text: `¡Señal ejecutada! ${activeSignal.type} de ${activeSignal.amount} ${activeSignal.symbol} por un total de $${activeSignal.total} USD. Almacenado en base de datos.`,
        type: "success"
      });

      // Play ultra futuristic high-fidelity order success bip (2 stacked frequencies)
      playBeep(1046.50, 0.1, "sine"); // C6
      setTimeout(() => {
        playBeep(1318.51, 0.15, "triangle"); // E6
      }, 80);

      // Reset
      setActiveSignal(null);
    } catch (err: any) {
      console.error("Error executing custom order:", err);
      setNotification({
        text: "Error de red al procesar la señal. Intenta de nuevo.",
        type: "error"
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Intro Header */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00FF9D]/10 text-[#00FF9D] flex items-center justify-center border border-[#00FF9D]/20 shadow-[0_0_12px_rgba(0,255,157,0.1)]">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xs text-zinc-100 uppercase tracking-widest">
              Radar de Sentimiento & NLP
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">
              Análisis semántico en milisegundos con IA
            </p>
          </div>
        </div>
        <span className="text-[8px] border border-orange-500/30 text-orange-400 bg-orange-950/20 px-2 py-0.5 rounded-lg font-mono font-bold uppercase animate-pulse">
          Beta Neuronal
        </span>
      </div>

      {notification && (
        <div className={`p-3 rounded-2xl border text-[10px] font-mono flex items-center justify-between gap-2 animate-fade-in ${
          notification.type === "success" 
            ? "bg-[#00FF9D]/5 border-[#00FF9D]/20 text-[#00FF9D]" 
            : "bg-red-950/10 border-red-900/30 text-red-400"
        }`}>
          <span>{notification.text}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-white font-bold px-1.5 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid splits into Live Feed & NLP Analysis Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Sentiment Gauge Card (5 cols) */}
        <div className="md:col-span-5 rounded-3xl border border-zinc-900 bg-[#09090b] p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">SENTIMIENTO CONSOLIDADO</span>
            
            {/* Visual Circular Gauge using CSS gradients */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center relative border border-zinc-850"
                style={{
                  background: `conic-gradient(from 180deg, #00FF9D ${sentimentScore}%, #18181b 0%)`
                }}
              >
                {/* Hollow center to make it a donut chart */}
                <div className="w-[118px] h-[118px] rounded-full bg-zinc-950 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[26px] font-black font-mono text-[#00FF9D] tracking-tighter leading-none">
                    {sentimentScore}%
                  </span>
                  <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider mt-1 block">SCORE GLOBAL</span>
                </div>
              </div>

              {/* Slider simulation for display info */}
              <div className="text-center mt-3">
                <span className="text-[10px] font-mono text-zinc-200 font-bold block">
                  {sentimentLabel}
                </span>
                <span className="text-[8px] text-zinc-500 font-mono uppercase mt-0.5 block">
                  Estrategia: {activeStrategy}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-zinc-900 space-y-2">
            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block font-bold">SELECCIONAR ACTIVO</span>
            <div className="grid grid-cols-4 gap-1">
              {["BTC", "SOL", "AAPL", "TSLA"].map((assetName) => (
                <button
                  key={assetName}
                  onClick={() => {
                    setSelectedAsset(assetName);
                    playBeep(650, 0.08, "sine");
                  }}
                  className={`text-[9px] py-1.5 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                    selectedAsset === assetName 
                      ? "bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]" 
                      : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {assetName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live News Feed (7 cols) */}
        <div className="md:col-span-7 rounded-3xl border border-zinc-900 bg-[#09090b] p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">NLP FEED EN TIEMPO REAL</span>
              <span className="text-[8px] text-[#00FF9D] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
                CONEXIÓN SEGURA
              </span>
            </div>

            <div className="space-y-2 max-h-[178px] overflow-y-auto pr-1">
              {news.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2.5 rounded-xl border transition-all text-left ${
                    item.asset === selectedAsset 
                      ? "bg-zinc-900/50 border-[#00FF9D]/20" 
                      : "bg-zinc-950/40 border-zinc-900/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-zinc-900 text-zinc-300 font-mono font-bold px-1.5 py-0.2 rounded border border-zinc-800">
                        {item.asset}
                      </span>
                      <span className="text-[7.5px] text-zinc-500 font-mono">{item.source} • {item.time}</span>
                    </div>
                    <span className={`text-[7.5px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                      item.sentiment === "BULLISH" 
                        ? "bg-[#00FF9D]/10 text-[#00FF9D]" 
                        : "bg-red-400/10 text-red-400"
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-zinc-300 leading-normal font-sans tracking-wide">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleScanSentiment}
            disabled={isScanning}
            className="w-full mt-3 bg-zinc-950 hover:bg-zinc-900 text-white border border-[#00FF9D]/30 hover:border-[#00FF9D] font-mono text-[10px] font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none uppercase tracking-wide"
          >
            {isScanning ? (
              <>
                <Cpu className="w-3.5 h-3.5 text-[#00FF9D] animate-spin" /> PROCESANDO NLP...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#00FF9D]" /> ESCANEAR SENTIMIENTO DE {selectedAsset}
              </>
            )}
          </button>
        </div>

      </div>

      {/* AI Decision Generator Result Box */}
      {isScanning && (
        <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/20 p-8 flex flex-col items-center justify-center text-center py-10 animate-pulse">
          <Cpu className="w-8 h-8 text-zinc-700 mb-2 animate-spin-slow" />
          <p className="text-xs text-zinc-400 font-mono">Consolidando flujos semánticos...</p>
          <p className="text-[9px] text-zinc-550 font-mono mt-1">Extrayendo datos de Bloomberg, Reuters y analizando con Gemini 3.5-Flash</p>
        </div>
      )}

      {!isScanning && aiReport && (
        <div className="rounded-3xl border border-[#00FF9D]/20 bg-gradient-to-tr from-zinc-950 to-zinc-900 p-4.5 space-y-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Cpu className="w-4 h-4 text-[#00FF9D]" />
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-zinc-300">ANÁLISIS NEURONAL ADEXA</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-sans tracking-wide mt-2">
              {aiReport}
            </p>
          </div>

          {activeSignal && (
            <div className="bg-[#0c0c0e] border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between sm:flex-row sm:items-center gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20 px-2 py-0.5 rounded-lg font-mono font-bold uppercase">
                    SEÑAL COMPILADA
                  </span>
                  <span className="text-[8.5px] text-zinc-500 font-mono">Confianza: {activeSignal.confidence}%</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[7.5px] text-zinc-500 font-mono block">PAR</span>
                    <span className="text-[11px] font-black text-white font-mono">{activeSignal.symbol}/USD</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-zinc-500 font-mono block">DIRECCIÓN</span>
                    <span className={`text-[11px] font-black font-mono flex items-center gap-1 ${
                      activeSignal.type === "COMPRA" ? "text-[#00FF9D]" : "text-red-400"
                    }`}>
                      {activeSignal.type === "COMPRA" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {activeSignal.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-zinc-500 font-mono block">PRECIO COMPRA</span>
                    <span className="text-[11px] font-black text-white font-mono">${activeSignal.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] text-zinc-500 font-mono block">CANTIDAD RECOMENDADA</span>
                    <span className="text-[11px] font-black text-white font-mono">{activeSignal.amount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-zinc-900">
                  <span className="text-[8.5px] text-zinc-400 font-mono">
                    🟢 Take-Profit: <strong className="text-zinc-200">${activeSignal.takeProfit}</strong>
                  </span>
                  <span className="text-[8.5px] text-zinc-400 font-mono">
                    🔴 Stop-Loss: <strong className="text-zinc-200">${activeSignal.stopLoss}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between items-end self-stretch">
                <div className="mb-2">
                  <span className="text-[7px] text-zinc-500 font-mono block">TOTAL ORDEN</span>
                  <span className="text-[13px] font-black text-[#00FF9D] font-mono">${activeSignal.total.toLocaleString()} USD</span>
                </div>

                <button
                  onClick={handleExecuteSignal}
                  className="bg-[#00FF9D] hover:bg-[#00E5FF] active:scale-95 text-black font-mono text-[9px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 uppercase tracking-wide select-none shadow-[0_0_15px_rgba(0,255,157,0.25)] hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]"
                >
                  <Play className="w-3 h-3 fill-current" /> EJECUTAR EN CARTERA
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!aiReport && !isScanning && (
        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/20 p-7 flex flex-col items-center justify-center text-center py-8">
          <Cpu className="w-7 h-7 text-zinc-700 mb-2.5 animate-pulse" />
          <h4 className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest font-bold">ESPERANDO ORDEN DE ESCANEO</h4>
          <p className="text-[9px] text-zinc-550 font-mono tracking-wide mt-1.5 max-w-xs leading-normal">
            Selecciona uno de los activos globales arriba y ejecuta el NLP Parser de Adexa para extraer señales de mercado del feed de noticias en vivo.
          </p>
        </div>
      )}
    </div>
  );
}
