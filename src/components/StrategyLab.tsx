/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, Sliders, ChevronRight, BarChart2, TrendingUp, 
  RefreshCw, Check, Shield, Award, HelpCircle
} from "lucide-react";
import { InvestmentStrategy, RiskLevel } from "../types";
import { STRATEGIES } from "../data";

interface StrategyLabProps {
  activeStrategy: InvestmentStrategy;
  setActiveStrategy: (strategy: InvestmentStrategy) => void;
  riskLevel: RiskLevel;
  setRiskLevel: (level: RiskLevel) => void;
  virtualCapital: number;
  setVirtualCapital: (capital: number) => void;
}

export default function StrategyLab({
  activeStrategy,
  setActiveStrategy,
  riskLevel,
  setRiskLevel,
  virtualCapital,
  setVirtualCapital
}: StrategyLabProps) {
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestStage, setBacktestStage] = useState("");
  const [backtestResults, setBacktestResults] = useState<{
    cumulativeProfitUSD: number;
    cumulativeProfitPercent: number;
    maxDrawdown: number;
    sharpeRatio: number;
    totalTrades: number;
    winRate: number;
    equityCurve: number[];
  } | null>(null);

  const runBacktestSimulator = () => {
    setIsRunningBacktest(true);
    setBacktestResults(null);
    const stages = [
      "Iniciando cargador lineal histórico...",
      "Descargando 350,000 velas de cotización...",
      "Alimentando redes neuronales recurrentes...",
      "Calculando niveles óptimos de Stop Loss...",
      "Evaluando coste de comisiones...",
      "Finalizando informe cuántico..."
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      setBacktestStage(stages[currentStage]);
      currentStage++;
      
      if (currentStage >= stages.length) {
        clearInterval(interval);
        
        // Calculate dynamic results depending on strategy + risk selections
        const riskMultiplier = riskLevel === "Agresivo" ? 1.45 : riskLevel === "Moderado" ? 1.0 : 0.6;
        const baseReturn = activeStrategy.expectedAnnualReturn;
        const finalReturnPercent = baseReturn * riskMultiplier * (0.9 + Math.random() * 0.2);
        const finalReturnUSD = virtualCapital * (finalReturnPercent / 100);
        const baseWinRate = activeStrategy.winRateSimulated;
        const adjustedWinRate = Math.min(95, Math.max(55, baseWinRate + (Math.random() - 0.5) * 6));
        
        // Generate simulated monthly equity data points for curves
        const equityCurve: number[] = [virtualCapital];
        let runningCapital = virtualCapital;
        const monthlyYield = finalReturnPercent / 12;
        
        for (let i = 1; i <= 12; i++) {
          const shift = (Math.random() - 0.35) * (runningCapital * (riskLevel === "Agresivo" ? 0.08 : 0.04));
          runningCapital = Number((runningCapital + (runningCapital * (monthlyYield / 100)) + shift).toFixed(2));
          equityCurve.push(runningCapital);
        }

        setBacktestResults({
          cumulativeProfitUSD: Number(finalReturnUSD.toFixed(2)),
          cumulativeProfitPercent: Number(finalReturnPercent.toFixed(2)),
          maxDrawdown: riskLevel === "Agresivo" ? 18.4 : riskLevel === "Moderado" ? 8.2 : 3.5,
          sharpeRatio: riskLevel === "Agresivo" ? 1.85 : riskLevel === "Moderado" ? 2.45 : 2.90,
          totalTrades: riskLevel === "Agresivo" ? 1240 : riskLevel === "Moderado" ? 245 : 48,
          winRate: Number(adjustedWinRate.toFixed(1)),
          equityCurve
        });
        setIsRunningBacktest(false);
      }
    }, 850);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      
      {/* LEFT: Parameters & Selector (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        
        {/* Core Profile Parameters */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-display font-bold text-sm text-zinc-200 tracking-wider uppercase flex items-center gap-1.5 border-b border-zinc-800 pb-3 mb-4">
            <Sliders className="w-4 h-4 text-[#00FF9D]" /> Configurar Laboratorio
          </h3>

          <div className="space-y-5">
            {/* Input Capital simulation */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-mono flex items-center justify-between">
                <span>CAPITAL DE PORTAFOLIO (USD)</span>
                <span className="text-[#00FF9D] font-bold text-sm">${virtualCapital.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={virtualCapital}
                onChange={(e) => setVirtualCapital(Number(e.target.value))}
                className="w-full accent-[#00FF9D] h-1 rounded-lg bg-zinc-800 outline-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-650 font-mono">
                <span>$1,000 USD</span>
                <span>$100,000 USD</span>
              </div>
            </div>

            {/* Risk Selection Level */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-mono tracking-wide">PERFIL DE RIESGO DE LA IA</label>
              <div className="grid grid-cols-3 gap-2">
                {["Conservador", "Moderado", "Agresivo"].map((level) => {
                  const isActive = riskLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level as any)}
                      type="button"
                      className={`py-2 text-xs rounded-lg font-mono border transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D] font-bold"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-350"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed mt-1">
                {riskLevel === "Conservador" && "🌿 Prioriza la conservación de tus fondos. Rebalancea un 80% en activos estables y Oro Spot."}
                {riskLevel === "Moderado" && "⚖️ Balance equilibrado. 50% activos volátiles y 50% coberturas tradicionales."}
                {riskLevel === "Agresivo" && "⚡ Explotación máxima de volatilidad intradiaria en criptoactivos de alto rendimiento."}
              </p>
            </div>
          </div>
        </div>

        {/* Strategies Options selection list */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex-1 flex flex-col">
          <h3 className="font-display font-bold text-xs text-zinc-400 tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-zinc-805 pb-3">
            <Shield className="w-3.5 h-3.5 text-[#00FF9D]" /> Selecciona Estrategia base
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {STRATEGIES.map((strategy) => {
              const isSelected = strategy.id === activeStrategy.id;
              return (
                <button
                  key={strategy.id}
                  onClick={() => setActiveStrategy(strategy)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected 
                      ? "bg-[#00FF9D]/10 border-[#00FF9D]" 
                      : "bg-zinc-950 border-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg bg-zinc-900 text-[#00FF9D] shrink-0 border ${
                    isSelected ? "border-[#00FF9D]/30" : "border-zinc-800"
                  }`}>
                    {isSelected ? <Check className="w-3.5 h-3.5 text-[#00FF9D]" /> : <BarChart2 className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-white tracking-wide">{strategy.name}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">{strategy.description}</p>
                    
                    <div className="flex gap-3 mt-2 text-[9px] font-mono">
                      <span className="text-zinc-500">Vol: <span className="text-zinc-300 font-bold">{strategy.type}</span></span>
                      <span className="text-zinc-500">Retorno sugerido: <span className="text-[#00FF9D] font-bold">+{strategy.expectedAnnualReturn}%</span></span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT: High-fidelity Simulator (7 cols) */}
      <div className="lg:col-span-7 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 overflow-hidden justify-between">
        
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <h3 className="font-display font-semibold text-white text-sm tracking-wide uppercase flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-[#00FF9D] animate-pulse" /> Simulador de Backtesting Histórico
            </h3>
            <span className="text-[10px] font-mono text-zinc-500">MUESTRA: 365 DÍAS RECIENTES</span>
          </div>

          <div className="text-center py-5 bg-zinc-950/45 rounded-2xl border border-zinc-850 mb-4">
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed px-2">
              Haz clic en el botón de abajo para poner a prueba tu estrategia con el motor estadístico cuántico de Adexa. Sincroniza inflación, tendencias técnicas y volatilidad real del mercado de los últimos 12 meses.
            </p>
            
            <button
              onClick={runBacktestSimulator}
              disabled={isRunningBacktest}
              className="mt-4 px-6 py-3 rounded-xl bg-white hover:opacity-90 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-40"
            >
              {isRunningBacktest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>{backtestStage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Iniciar Simulación Cuántica</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backtest simulated Results Dashboard */}
        {backtestResults ? (
          <div className="space-y-4 animate-fade-in">
            {/* Top Stat Gauges row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Ganancia Proyectada</span>
                <p className="font-mono text-lg font-bold text-[#00FF9D]">+${backtestResults.cumulativeProfitUSD.toLocaleString()}</p>
                <p className="text-[10px] text-[#00FF9D] font-mono">+{backtestResults.cumulativeProfitPercent}% anual</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Win Rate Global</span>
                <p className="font-mono text-lg font-bold text-white">{backtestResults.winRate}%</p>
                <p className="text-[10px] text-zinc-500 font-mono">Órdenes Ganadas</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase">Max Drawdown</span>
                <p className="font-mono text-lg font-bold text-rose-500">-{backtestResults.maxDrawdown}%</p>
                <p className="text-[10px] text-zinc-500 font-mono">Pérdida Máxima</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase font-semibold text-zinc-400">Sharpe Ratio</span>
                <p className="font-mono text-lg font-bold text-zinc-300">{backtestResults.sharpeRatio}</p>
                <p className="text-[10px] text-zinc-500 font-mono">Relación Riesgo/Gto</p>
              </div>
            </div>

            {/* Custom SVG performance equity line chart */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-mono uppercase flex items-center justify-between">
                <span>Curva de Capital en 12 meses (Equity Curve)</span>
                <span className="text-[#00FF9D]">Rendimiento: +{backtestResults.cumulativeProfitPercent}%</span>
              </label>
              
              <div className="h-[120px] bg-zinc-950 border border-zinc-850 rounded-xl relative px-4 py-2">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[10, 20].map((gl, gIdx) => (
                    <line 
                      key={gIdx}
                      x1="0" y1={gl} x2="100" y2={gl}
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="0.25"
                    />
                  ))}

                  {/* Profit Curve Area */}
                  <path
                    d={`M 0,30 ${backtestResults.equityCurve.map((point, idx) => {
                      const step = 100 / 12;
                      const x = idx * step;
                      const prices = backtestResults.equityCurve;
                      const max = Math.max(...prices);
                      const min = Math.min(...prices);
                      const range = max - min;
                      const y = 28 - ((point - min) / range) * 24;
                      return `L ${x},${y}`;
                    }).join(" ")} L 100,30 Z`}
                    fill="url(#grad-equity)"
                    opacity="0.15"
                  />

                  {/* Core Curve Stroke line */}
                  <path
                    d={backtestResults.equityCurve.map((point, idx) => {
                      const step = 100 / 12;
                      const x = idx * step;
                      const prices = backtestResults.equityCurve;
                      const max = Math.max(...prices);
                      const min = Math.min(...prices);
                      const range = max - min;
                      const y = 28 - ((point - min) / range) * 24;
                      return `${idx === 0 ? "M" : "L"} ${x},${y}`;
                    }).join(" ")}
                    stroke="#00FF9D"
                    strokeWidth="1.25"
                    fill="none"
                  />

                  <defs>
                    <linearGradient id="grad-equity" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00FF9D" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Simulated months tags row bottom */}
                <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[8px] font-mono text-zinc-650">
                  <span>MES 0</span>
                  <span>MES 3</span>
                  <span>MES 6</span>
                  <span>MES 9</span>
                  <span>MES 12</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 font-mono text-center leading-relaxed">
              ⚠️ Disclaimer: Los datos expuestos son simulaciones matemáticas. Rendimientos pasados no garantizan rendimientos futuros.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/30 py-10 min-h-[160px]">
            <HelpCircle className="w-10 h-10 text-zinc-800 mb-2" />
            <p className="text-xs text-zinc-650 font-mono">Esperando simulación histórica...</p>
          </div>
        )}

      </div>
    </div>
  );
}
