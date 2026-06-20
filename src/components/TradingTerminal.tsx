/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, Play, Square, Key, CheckCircle, 
  RefreshCw, Activity, AlertCircle, Database, ShieldCheck, Zap
} from "lucide-react";
import { TickerData, TradeLog, RiskLevel } from "../types";
import { INITIAL_TICKERS } from "../data";

interface TradingTerminalProps {
  currentPlan: string;
  onTradeExecuted: (profit: number) => void;
  virtualCapital: number;
  idToken: string | null;
}

export default function TradingTerminal({
  currentPlan,
  onTradeExecuted,
  virtualCapital,
  idToken
}: TradingTerminalProps) {
  const [tickers, setTickers] = useState<TickerData[]>(INITIAL_TICKERS);
  const [selectedAsset, setSelectedAsset] = useState<TickerData>(INITIAL_TICKERS[0]);
  const [timeframe, setTimeframe] = useState<"1H" | "1D" | "1W" | "1M">("1D");
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Sincronizando con redes neuronales Adexa...",
    "Conectores de API en espera de credenciales.",
    "IA preparada para emitir órdenes en modo educativo."
  ]);
  const [recentTrades, setRecentTrades] = useState<TradeLog[]>([
    {
      id: "tr-001",
      timestamp: "Hace 5 minutos",
      symbol: "BTC/USD",
      type: "COMPRA",
      price: 66800.00,
      amount: 0.25,
      total: 16700,
      strategy: "Micro-Scalping HFT",
      status: "COMPLETADO"
    },
    {
      id: "tr-002",
      timestamp: "Hace 1 hora",
      symbol: "AAPL",
      type: "VENTA",
      price: 181.50,
      amount: 40,
      total: 7260,
      strategy: "Swing Trading Neuronal",
      status: "COMPLETADO"
    }
  ]);

  // Load trade history from DB when idToken is available
  useEffect(() => {
    if (!idToken) return;

    const fetchTradesFromDB = async () => {
      try {
        const res = await fetch("/api/trade-logs", {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        if (res.ok) {
          const dbTrades = await res.json();
          if (dbTrades && dbTrades.length > 0) {
            const mappedTrades: TradeLog[] = dbTrades.map((t: any) => ({
              id: t.id,
              timestamp: new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              symbol: t.symbol,
              type: t.type as "COMPRA" | "VENTA",
              price: t.price,
              amount: t.amount,
              total: t.total,
              strategy: t.strategy,
              status: t.status as any
            }));
            setRecentTrades(mappedTrades);
          }
        }
      } catch (err) {
        console.error("Error loading trades from Cloud SQL:", err);
      }
    };

    fetchTradesFromDB();
  }, [idToken]);

  // Broker API states
  const [selectedBroker, setSelectedBroker] = useState<"binance" | "bybit" | "alpaca" | "ibkr">("binance");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Hover states for the main chart crosshair
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, open: number, close: number, high: number, low: number } | null>(null);

  // Generate randomized price shifts in real time to simulate a "live" terminal
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prevTickers) => 
        prevTickers.map((ticker) => {
          const shiftPercent = (Math.random() - 0.495) * 0.4; // subtle shifts
          const priceChange = ticker.price * (shiftPercent / 100);
          const newPrice = Number((ticker.price + priceChange).toFixed(ticker.type === "crypto" ? 2 : 2));
          const totalChange = ticker.change + priceChange;
          const totalChangePercent = (totalChange / (ticker.price - totalChange)) * 100;
          
          const updated = {
            ...ticker,
            price: newPrice,
            change: Number(totalChange.toFixed(2)),
            changePercent: Number(totalChangePercent.toFixed(2)),
          };

          // If this is our active asset, sync the selection
          if (ticker.symbol === selectedAsset.symbol) {
            setSelectedAsset(updated);
          }

          return updated;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // Handle simulated trading bot actions when running
  useEffect(() => {
    if (!isBotRunning) return;

    const interval = setInterval(() => {
      // Create a simulated trade log
      const side = Math.random() > 0.45 ? "COMPRA" : "VENTA";
      const brokerPrefix = `[BOT-${selectedBroker.toUpperCase()}]`;
      const randomTicker = tickers[Math.floor(Math.random() * tickers.length)];
      
      const multiplier = randomTicker.type === "crypto" ? 0.1 : 10;
      const amount = Number((Math.random() * multiplier + 0.1).toFixed(2));
      const price = randomTicker.price;
      const total = Number((price * amount).toFixed(2));
      
      const newLog = `${brokerPrefix} Ejecutado: ${side} ${amount} ${randomTicker.symbol} a $${price.toLocaleString()} USD (Total: $${total.toLocaleString()})`;
      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      // Execute a profit/loss event
      const pnl = (Math.random() - 0.35) * (virtualCapital * 0.004); // slight positive bias
      onTradeExecuted(Number(pnl.toFixed(2)));

      // Add to trades log
      const newTrade: TradeLog = {
        id: `tr-${Date.now().toString().slice(-4)}`,
        timestamp: "Ahora mismo",
        symbol: randomTicker.symbol,
        type: side,
        price: price,
        amount: amount,
        total: total,
        strategy: "Adexa Auto Engine",
        status: "COMPLETADO"
      };
      setRecentTrades((prev) => [newTrade, ...prev.slice(0, 8)]);

      // Direct sync with Postgres Cloud SQL
      if (idToken) {
        fetch("/api/trade-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({
            symbol: randomTicker.symbol,
            type: side,
            price: price,
            amount: amount,
            total: total,
            strategy: "Adexa Auto Engine",
            status: "COMPLETADO"
          })
        }).catch((err) => console.error("Error logging remote trade:", err));
      }

    }, 6000);

    return () => clearInterval(interval);
  }, [isBotRunning, tickers, selectedBroker, virtualCapital, idToken]);

  // Conectar Broker handler
  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) {
      alert("Por favor digita las llaves API simuladas.");
      return;
    }
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsBrokerConnected(true);
      setLogs((prev) => [
        `[SISTEMA] Canal seguro de comunicación con ${selectedBroker.toUpperCase()} establecido por túnel SSH. Encriptación AES-256 ACTIVA.`,
        ...prev
      ]);
    }, 1500);
  };

  const handleDisconnectBroker = () => {
    setIsBrokerConnected(false);
    setIsBotRunning(false);
    setApiKey("");
    setApiSecret("");
    setLogs((prev) => [
      `[SISTEMA] Broker desconectado de forma segura de las centrales de Adexa.`,
      ...prev
    ]);
  };

  const handleToggleBot = () => {
    if (!isBrokerConnected) {
      alert("Debes conectar tu Broker por API en la sección lateral derecha antes de activar el trading automático.");
      return;
    }
    const nextState = !isBotRunning;
    setIsBotRunning(nextState);
    
    setLogs((prev) => [
      `[SISTEMA] Motor Adexa trading auto-operado: ${nextState ? "ACTIVADO (Iniciando análisis neuronal)" : "DETENIDO"}`,
      ...prev
    ]);
  };

  // Generate simulated candle data points based on selected timeframe
  const getRenderCandles = () => {
    const seed = selectedAsset.price;
    const isUp = selectedAsset.changePercent >= 0;
    
    // Create distinct heights depending on sparkline or price
    const count = timeframe === "1H" ? 14 : timeframe === "1D" ? 22 : timeframe === "1W" ? 30 : 40;
    const candles = [];
    
    for (let i = 0; i < count; i++) {
      const progressFactor = i / count;
      let center = seed * (0.95 + progressFactor * 0.08);
      
      // Introduce wave patterns
      center += Math.sin(i * 0.5) * (seed * 0.015);
      
      const bull = i === count - 1 ? isUp : Math.random() > 0.45;
      const open = center + (Math.random() - 0.5) * (seed * 0.008);
      const close = open + (bull ? 1 : -1) * (Math.random() * (seed * 0.01) + (seed * 0.002));
      const high = Math.max(open, close) + (Math.random() * (seed * 0.005));
      const low = Math.min(open, close) - (Math.random() * (seed * 0.005));
      
      candles.push({
        open,
        close,
        high,
        low,
        isBull: close >= open
      });
    }
    return candles;
  };

  const candles = getRenderCandles();

  // Highlight trading signal predictions (Slide 10)
  const getAISignal = (asset: TickerData) => {
    const hash = asset.symbol.charCodeAt(0) + asset.symbol.charCodeAt(1);
    const buyProbability = (hash % 30) + 60; // 60% to 90%
    const sentiment = hash % 2 === 0 ? "COMPRA EXTREMA" : "VENTA SUGERIDA";
    const isBuy = hash % 2 === 0;

    return {
      sentiment,
      isBuy,
      probability: buyProbability,
      targetPrice: isBuy ? asset.price * 1.085 : asset.price * 0.915,
      stopLoss: isBuy ? asset.price * 0.96 : asset.price * 1.03
    };
  };

  const aiSignal = getAISignal(selectedAsset);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* LEFT: Assets Tickers List (4 cols) - Styled with Bento Grid panels */}
      <div className="lg:col-span-3 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="p-4 bg-zinc-900 text-[10px] font-mono text-zinc-400 flex items-center justify-between border-b border-zinc-800 tracking-wider">
          <span>ACTIVO DE MERCADO</span>
          <span>ÚLTIMO PRECIO</span>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
          {tickers.map((ticker) => {
            const isSelected = ticker.symbol === selectedAsset.symbol;
            return (
              <button
                key={ticker.symbol}
                onClick={() => setSelectedAsset(ticker)}
                className={`w-full text-left p-3.5 flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? "bg-[#00FF9D]/10 border-l-4 border-[#00FF9D]" : "hover:bg-zinc-800/30"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-zinc-100">{ticker.symbol}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      ticker.type === "crypto" 
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700/50" 
                        : ticker.type === "stock"
                          ? "bg-zinc-900 text-zinc-400"
                          : "bg-zinc-950 text-yellow-400"
                    }`}>
                      {ticker.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans truncate pr-2 mt-0.5">{ticker.name}</p>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-zinc-200">
                    ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-0.5 justify-end font-mono text-[10px] ${
                    ticker.changePercent >= 0 ? "text-[#00FF9D]" : "text-rose-500"
                  }`}>
                    {ticker.changePercent >= 0 ? "+" : ""}
                    {ticker.changePercent}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Trading Chart Area & Trade Controls (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        
        {/* Active Asset Info Bar - Bento Curved style */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-[#00FF9D]">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                {selectedAsset.name} 
                <span className="text-xs font-mono text-zinc-500">({selectedAsset.symbol})</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono font-bold text-[#00FF9D] text-lg">
                  ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                  selectedAsset.changePercent >= 0 ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {selectedAsset.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {selectedAsset.changePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {["1H", "1D", "1W", "1M"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf as any)}
                className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition-all cursor-pointer ${
                  timeframe === tf 
                    ? "bg-zinc-800 text-white border border-zinc-750" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Futuristic Holographic SVG Chart - Bento Style */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex-1 flex flex-col h-[320px] overflow-hidden relative">
          
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/25 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5 font-bold uppercase tracking-wide">
              <Zap className="w-2.5 h-2.5" /> PROYECTANDO PATRONES NEURONALES
            </span>
          </div>

          {/* Holographic Watermark Symbol */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="font-display font-bold text-8xl text-[#00FF9D] tracking-widest uppercase">
              {selectedAsset.symbol.split("/")[0]}
            </span>
          </div>

          {/* Core chart workspace rendering SVG candles */}
          <div className="flex-1 w-full mt-6 min-h-[200px] relative">
            <svg 
              className="w-full h-full overflow-visible"
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Horizontal Grid lines */}
              {[20, 40, 60, 80].map((grid, gIdx) => (
                <line 
                  key={gIdx}
                  x1="0" y1={grid} x2="100" y2={grid}
                  stroke="rgba(255, 255, 255, 0.04)" 
                  strokeDasharray="2,2"
                  strokeWidth="0.25"
                />
              ))}

              {/* Loop candles */}
              {candles.map((candle, cIdx) => {
                const step = 100 / candles.length;
                const x = cIdx * step + (step / 2);
                
                // Scale values proportionally between 5% and 95% on chart height
                const pricesArr = candles.flatMap(c => [c.high, c.low]);
                const maxPrice = Math.max(...pricesArr);
                const minPrice = Math.min(...pricesArr);
                const range = maxPrice - minPrice;

                const scaleY = (p: number) => 95 - ((p - minPrice) / range) * 85;

                const yOpen = scaleY(candle.open);
                const yClose = scaleY(candle.close);
                const yHigh = scaleY(candle.high);
                const yLow = scaleY(candle.low);

                const strokeColor = candle.isBull ? "#00FF9D" : "#ef4444";
                const fillColor = candle.isBull ? "rgba(0, 255, 157, 0.25)" : "rgba(239, 68, 68, 0.25)";

                return (
                  <g 
                    key={cIdx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({
                      x: cIdx,
                      open: Math.round(candle.open),
                      close: Math.round(candle.close),
                      high: Math.round(candle.high),
                      low: Math.round(candle.low)
                    })}
                  >
                    {/* Shadow wick */}
                    <line 
                      x1={x} y1={yHigh} x2={x} y2={yLow}
                      stroke={strokeColor}
                      strokeWidth="0.5"
                    />
                    {/* Candle body rectangle */}
                    <rect 
                      x={x - (step * 0.35)} 
                      y={Math.min(yOpen, yClose)} 
                      width={step * 0.7} 
                      height={Math.max(1.5, Math.abs(yOpen - yClose))}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="0.4"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Tooltip showing data metrics inside the Chart bounds */}
            {hoveredPoint && (
              <div className="absolute top-2 right-2 bg-zinc-950/95 border border-zinc-800 rounded-lg p-2.5 text-[10px] font-mono text-zinc-300 z-10 w-32 shadow-xl">
                <p className="text-[#00FF9D] font-bold mb-1 uppercase tracking-wide">CANDELA {hoveredPoint.x + 1}</p>
                <div className="space-y-0.5">
                  <p>O: <span className="text-white font-bold">${hoveredPoint.open}</span></p>
                  <p>C: <span className="text-white font-bold">${hoveredPoint.close}</span></p>
                  <p>H: <span className="text-white font-bold">${hoveredPoint.high}</span></p>
                  <p>L: <span className="text-white font-bold">${hoveredPoint.low}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Quick AI indicators at bottom of chart */}
          <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-3 text-[10px] font-mono text-[#00FF9D]/60">
            <span>Rango Máx: ${Math.max(...candles.map(c => c.high)).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
            <span className="text-[#00FF9D] flex items-center gap-1 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
              Soporte de Predicción IA Activado
            </span>
            <span>Rango Mín: ${Math.min(...candles.map(c => c.low)).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>
          </div>
        </div>

        {/* AI Prediction Buy/Sell Callout Module (Slide 10) - Bento Style */}
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-zinc-855 rounded text-[#00FF9D] border border-zinc-800 font-bold">
                Sugerencia Algorítmica Adexa
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Confianza: {aiSignal.probability}%</span>
            </div>
            <h3 className="font-display font-medium text-white text-sm mt-1">
              Señal: <span className={`font-extrabold ${aiSignal.isBuy ? "text-[#00FF9D]" : "text-rose-500"}`}>{aiSignal.sentiment}</span>
            </h3>
            
            <div className="flex gap-4 mt-2 text-[11px] font-mono">
              <div className="text-zinc-400">TP Proyectado: <span className="text-[#00FF9D] font-bold">${aiSignal.targetPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
              <div className="text-zinc-400">SL de Cobertura: <span className="text-rose-400 font-bold">${aiSignal.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          <button 
            onClick={handleToggleBot}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl border font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer ${
              isBotRunning 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" 
                : "bg-[#00FF9D] hover:opacity-90 border-transparent text-black"
            }`}
          >
            {isBotRunning ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Detener Auto-Trading</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Activar Auto-Trading</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* RIGHT: Broker Connect Panel & Execution Log (5 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        
        {/* API Credentials Setup Panel - Bento Style */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
            <h3 className="font-display font-bold text-xs text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00FF9D]" /> API de Broker
            </h3>
            <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider ${
              isBrokerConnected ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "bg-zinc-800 text-zinc-500"
            }`}>
              {isBrokerConnected ? "CONECTADO" : "SIN CONECTAR"}
            </span>
          </div>

          {isBrokerConnected ? (
            <div className="space-y-4 py-1">
              <div className="p-3.5 rounded-2xl bg-[#00FF9D]/5 border border-[#00FF9D]/20 flex items-center gap-2.5 text-[#00FF9D]">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div className="text-[11px] font-mono">
                  <p className="font-bold uppercase tracking-wide">Broker Sincronizado</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{selectedBroker.toUpperCase()} conectado vía API.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                <p className="font-bold text-zinc-300">Canal de Fondos: Protegido</p>
                <p className="text-[10px] text-[#00FF9D] mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF9D]" /> Adexa no retiene dinero
                </p>
              </div>

              <button
                type="button"
                onClick={handleDisconnectBroker}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] font-mono text-zinc-300 font-bold transition-all cursor-pointer uppercase tracking-wider"
              >
                Desconectar Broker S.A.S
              </button>
            </div>
          ) : (
            <form onSubmit={handleConnectBroker} className="space-y-4">
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                {(["binance", "bybit", "alpaca", "ibkr"] as const).map((brok) => (
                  <button
                    key={brok}
                    type="button"
                    onClick={() => setSelectedBroker(brok)}
                    className={`py-1 text-[9px] rounded-lg uppercase font-mono transition-all cursor-pointer ${
                      selectedBroker === brok 
                        ? "bg-zinc-800 text-[#00FF9D] font-bold" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {brok === "ibkr" ? "IBKR" : brok}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase font-bold">API KEY SIMULADO</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="bin_key_abc123..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300 text-xs font-mono outline-none focus:border-[#00FF9D]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase font-bold">API SECRET SIMULADO</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="bin_sec_xyz456..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300 text-xs font-mono outline-none focus:border-[#00FF9D]"
                  />
                </div>
              </div>

              <div className="text-[9px] text-zinc-500 font-mono leading-relaxed bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850">
                🔒 Encriptado localmente mediante algoritmo AES-256 bits. DavidHerreraproducciones S.A.S garantiza el flujo indirecto sin control bancario directo.
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-2.5 rounded-xl bg-white hover:opacity-90 font-mono font-bold text-xs uppercase text-black tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Encriptando llave...</span>
                  </>
                ) : (
                  <span>Conectar Broker</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live System Operational Logs Display - Bento style */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex-1 flex flex-col min-h-[190px]">
          <h4 className="font-display font-medium text-xs text-zinc-400 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-3 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00FF9D] animate-ping" /> LÍNEA OPERACIONAL ADEXA
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px]">
            {logs.map((log, idx) => (
              <div key={idx} className="font-mono text-[10px] text-zinc-300 p-2 rounded-lg bg-zinc-950/60 leading-relaxed border border-zinc-850">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
