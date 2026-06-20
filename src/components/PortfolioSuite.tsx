/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Sliders, ChevronRight, BarChart2, TrendingUp, TrendingDown,
  RefreshCw, Check, Shield, Award, HelpCircle, Newspaper, BookOpen, Brain, 
  ArrowUpRight, DollarSign, PieChart, Info, Scale, RotateCcw, AlertTriangle, Globe
} from "lucide-react";

export type RiskLevel = "Conservador" | "Moderado" | "Agresivo";
export type GoalLevel = "corto" | "mediano" | "largo";

interface AssetClass {
  id: string;
  name: string;
  color: string;
  riskWeight: number; // 1 to 5 scale
}

const ASSET_CLASSES: AssetClass[] = [
  { id: "stocks", name: "Acciones Líquidas (US/EU)", color: "#3B82F6", riskWeight: 4 },
  { id: "bonds", name: "Bonos del Tesoro / Deuda Soberana", color: "#10B981", riskWeight: 1 },
  { id: "indexes", name: "Fondos Indexados (S&P500/Nasdaq)", color: "#00FF9D", riskWeight: 3 },
  { id: "realestate", name: "Fideicomisos Inmobiliarios (REITs)", color: "#F59E0B", riskWeight: 2 },
  { id: "cryptogold", name: "Criptoactivos & Oro Spot", color: "#8B5CF6", riskWeight: 5 }
];

interface NewsItem {
  id: string;
  source: string;
  title: string;
  snippet: string;
  date: string;
  accent: string;
  nlpSummary: string;
  trend: string;
  trendDir: "up" | "down" | "flat";
  eurUsdImpact: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: "news-1",
    source: "Federal Reserve (FED)",
    title: "Veredicto del FOMC: Tasas se mantienen en rango alto pero se proyectan recortes",
    snippet: "La junta de gobernadores de la Reserva Federal ratificó que las tasas hipotecarias e interbancarias se sostendrán a la espera de más lecturas inflacionarias estables, encendiendo el optimismo.",
    date: "Ayer, 18:40 UTC",
    accent: "#00FF9D",
    nlpSummary: "La FED prepara el terreno para recortes de tasas graduales hacia fin de año. Esto alivia la carga de deuda institucional y genera un entorno macroeconómico propicio para la rotación de capital fiduciario hacia renta variable de crecimiento tecnológico y commodities financieros.",
    trend: "Alcista en Tecnología, Moderado en Coberturas tradicionales",
    trendDir: "up",
    eurUsdImpact: "Estabiliza el par EUR/USD en la banda de 1.0850 - 1.0910 debido al diferencial de rendimientos esperados en bonos a 10 años."
  },
  {
    id: "news-2",
    source: "Eurozone ECB Report",
    title: "Banco Central Europeo aplica recorte de tasas para dinamizar crecimiento alemán",
    snippet: "Por segunda vez en el periodo económico actual, el BCE recortó su tasa de depósito clave a 3.50%. El organismo apunta a fomentar el financiamiento ante el letargo de la industria de exportaciones.",
    date: "Hoy, 09:12 UTC",
    accent: "#3B82F6",
    nlpSummary: "La flexibilización monetaria en Europa responde a presiones deflacionarias internas en el núcleo de manufactura germano. Adexa proyecta flujos de alivio en costo crediticio corporativo, incentivando indices europeos como el Euro Stoxx 50.",
    trend: "Lateral Neutro para Renta Variable Global; Debilitamiento regional",
    trendDir: "flat",
    eurUsdImpact: "Presión bajista indirecta en el Euro frente al Dólar US. El soporte táctico se sitúa en 1.0790 si persisten brechas de actividad manufacturera."
  },
  {
    id: "news-3",
    source: "Nasdaq Global Markets",
    title: "S&P 500 y NASDAQ superan proyecciones históricas por demanda de clusters IA",
    snippet: "El S&P 500 avanzó un 1.4% logrando nuevas cotas históricas. Corporaciones líderes de semiconductores registran aumentos récord de márgenes impulsando una oleada de capital directo.",
    date: "Hoy, 14:05 UTC",
    accent: "#8B5CF6",
    nlpSummary: "Expansión industrial masiva catalizada por despliegue de cómputo empresarial. Adexa NLP detecta alta acumulación de capital inteligente en índices institucionales, con poca sensibilidad momentánea a presiones de volatilidad tradicional.",
    trend: "Fuertemente Alcista en Renta Variable Indexada",
    trendDir: "up",
    eurUsdImpact: "Fortalece el dólar estadounidense de manera temporal debido al flujo comprador para cobertura de acciones cotizadas en bolsas americanas."
  },
  {
    id: "news-4",
    source: "London Gold Market Spot",
    title: "Oro roza los $2,420 USD por onza por demanda institucional de cobertura absoluta",
    snippet: "El metal precioso sostiene su rally histórico del trimestre ante tensiones geoestratégicas globales y rebalanceos de carteras soberanas de bancos centrales en mercados emergentes.",
    date: "Hoy, 06:30 UTC",
    accent: "#F59E0B",
    nlpSummary: "La acumulación soberana desborda los canales tradicionales de renta fija. La escasez física de lingotes colisiona con el reaseguro corporativo. El oro opera como cobertura asimétrica de alto impacto ante riesgos geopolíticos latentes.",
    trend: "Alcista defensivo clásico (Hedge de Portafolio activado)",
    trendDir: "up",
    eurUsdImpact: "Impulsa devaluación monetaria indirecta general. Los swaps internacionales de divisas fiduciarias buscan refugio en metales duros."
  }
];

export default function PortfolioSuite() {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<"advisor" | "simulator" | "news">("advisor");

  // Global-influenced internal controls
  const [risk, setRisk] = useState<RiskLevel>("Moderado");
  const [goal, setGoal] = useState<GoalLevel>("mediano");
  const [capital, setCapital] = useState<number>(15000);

  // Recommendations data
  const [recommendedAlloc, setRecommendedAlloc] = useState<Record<string, number>>({});
  const [aiRationale, setAiRationale] = useState<string>("");

  // News interactive elements
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [processingNlpNews, setProcessingNlpNews] = useState<string | null>(null);
  const [activeNlpAnalysis, setActiveNlpAnalysis] = useState<NewsItem | null>(null);

  // Simulator controls
  const [userAllocStocks, setUserAllocStocks] = useState<number>(25);
  const [userAllocBonds, setUserAllocBonds] = useState<number>(20);
  const [userAllocIndexes, setUserAllocIndexes] = useState<number>(30);
  const [userAllocRealEstate, setUserAllocRealEstate] = useState<number>(15);
  const [userAllocCryptoGold, setUserAllocCryptoGold] = useState<number>(10);
  const [marketScenario, setMarketScenario] = useState<"alcista" | "bajista" | "estable">("alcista");

  // Trigger recommendation calculations whenever state changes
  useEffect(() => {
    calculateRecommendation();
  }, [risk, goal, capital]);

  const calculateRecommendation = () => {
    let alloc: Record<string, number> = {};
    let rationale = "";

    if (risk === "Conservador") {
      if (goal === "corto") {
        alloc = { bonds: 60, indexes: 25, cryptogold: 15, stocks: 0, realestate: 0 };
        rationale = "Estructura defensiva líquida. Se prioriza un 60% en Bonos Soberanos para garantizar retornos fijos predecibles ante tu corto plazo objetivo (< 1 año), con un 25% de soporte en índices globales de bajo beta y un 15% de Oro contra fluctuación inflacionaria. Cero exposición a acciones tecnológicas individuales.";
      } else if (goal === "mediano") {
        alloc = { bonds: 45, indexes: 35, realestate: 12, cryptogold: 8, stocks: 0 };
        rationale = "Balance conservador para 1 a 5 años. Tu menor apetito al riesgo se estructura con 45% de renta fija de alta calificación, integrando un 35% en fondos indexados globales para capturar dividendos acumulativos, y un 12% en fideicomisos de bienes raíces (REITs) para rentas periódicas constantes.";
      } else {
        alloc = { bonds: 30, indexes: 45, realestate: 15, cryptogold: 10, stocks: 0 };
        rationale = "Protección de largo plazo con crecimiento orgánico. Al proyectar a más de 5 años, podemos aumentar los fondos indexados a 45% para permitir que el interés compuesto actúe sobre canastas de acciones estables, complementado con 30% de bonos y un 15% de bienes raíces comerciales de baja correlación accionaria.";
      }
    } else if (risk === "Moderado") {
      if (goal === "corto") {
        alloc = { indexes: 40, bonds: 35, cryptogold: 15, stocks: 10, realestate: 0 };
        rationale = "Asignación equilibrada de maduración rápida. Combina un 40% de fondos indexados estables con un 35% de bonos líquidos protectores. Destina un 10% a acciones corporativas selectas para optimizar rendimientos y un 15% de resguardo en commodities de liquidación ágil frente a riesgos temporales.";
      } else if (goal === "mediano") {
        alloc = { indexes: 45, bonds: 25, realestate: 15, stocks: 10, cryptogold: 5 };
        rationale = "El 'Estilo Adexa Neutral Core'. Es el portafolio ideal según DavidHerreraproducciones S.A.S. Con una meta de 1-5 años, un 45% en fondos indexados (S&P500) proporciona tracción global, 25% en bonos gubernamentales estabiliza desvíos diarios, 15% en REITs capta flujo inmobiliario comercial, y un 15% combinado en acciones individuales y criptomonedas/oro potencia la rentabilidad marginal.";
      } else {
        alloc = { indexes: 50, bonds: 15, realestate: 15, stocks: 15, cryptogold: 5 };
        rationale = "Crecimiento acumulativo balanceado. Con un horizonte a largo plazo (> 5 años), reducimos la renta fija a un 15% e incrementamos la inversión en el mercado accionario indexado (50%) e individual especializado (15%). El interés compuesto genera la base protectora, amortiguando fluctuaciones pasajeras.";
      }
    } else { // Agresivo
      if (goal === "corto") {
        alloc = { stocks: 35, cryptogold: 25, indexes: 25, bonds: 15, realestate: 0 };
        rationale = "Explosión acelerada de volatilidad. Un 35% en acciones seleccionadas de alta beta y un 25% en criptomonedas líquidas de alto momentum (Bitcoin/Solana). Se mantiene un colchón del 25% de fondos de índices y un 15% en bonos soberanos para reversiones repentinas de mercado intradía.";
      } else if (goal === "mediano") {
        alloc = { stocks: 40, cryptogold: 25, indexes: 20, realestate: 10, bonds: 5 };
        rationale = "Captura intensiva de megatendencias. Enfocado en sectores de disrupción global informática, semiconductores y finanzas descentralizadas. 40% en acciones individuales de alto rendimiento técnico, 25% en criptoactivos en rangos dinámicos, 20% en fondos de índices bursátiles de crecimiento, y cobertura auxiliar mediante REITs y bonos.";
      } else {
        alloc = { stocks: 45, cryptogold: 25, realestate: 10, indexes: 15, bonds: 5 };
        rationale = "Multiplicador de capital máximo. Diseñado para optimizar los ciclos alcistas más agresivos a largo plazo. 45% concentrado en acciones globales líderes de crecimiento veloz, 25% en criptoactivos estructurados de alta capitalización, y el remanente en fondos indexados del sector tecnológico de vanguardia apoyado en un 10% de bienes raíces selectos.";
      }
    }

    setRecommendedAlloc(alloc);
    setAiRationale(rationale);
  };

  // Helper to apply recommended percentages to the interactive portfolio simulator
  const applyRecommendationToSimulator = () => {
    setUserAllocStocks(recommendedAlloc.stocks || 0);
    setUserAllocBonds(recommendedAlloc.bonds || 0);
    setUserAllocIndexes(recommendedAlloc.indexes || 0);
    setUserAllocRealEstate(recommendedAlloc.realestate || 0);
    setUserAllocCryptoGold(recommendedAlloc.cryptogold || 0);
    setActiveSubTab("simulator");
  };

  // Safe allocation adjustment to keep the sum exactly equal to 100%
  const autoBalanceAllocations = () => {
    const total = userAllocStocks + userAllocBonds + userAllocIndexes + userAllocRealEstate + userAllocCryptoGold;
    if (total === 100) return;
    
    // Proportional scaling
    const factor = 100 / (total || 1);
    setUserAllocStocks(Math.round(userAllocStocks * factor));
    setUserAllocBonds(Math.round(userAllocBonds * factor));
    setUserAllocIndexes(Math.round(userAllocIndexes * factor));
    setUserAllocRealEstate(Math.round(userAllocRealEstate * factor));
    setUserAllocCryptoGold(100 - (Math.round(userAllocStocks * factor) + Math.round(userAllocBonds * factor) + Math.round(userAllocIndexes * factor) + Math.round(userAllocRealEstate * factor)));
  };

  // Calculate live portfolio simulation metrics based on weights, capital and market scenario
  const getSimulatorMetrics = () => {
    const sumAlloc = userAllocStocks + userAllocBonds + userAllocIndexes + userAllocRealEstate + userAllocCryptoGold;
    const isBalanced = sumAlloc === 100;

    // Standard scenario return benchmarks (annualized)
    const baseReturns: Record<string, Record<string, number>> = {
      stocks: { alcista: 35, bajista: -30, estable: 5 },
      bonds: { alcista: -2, bajista: 8, estable: 4 },
      indexes: { alcista: 18, bajista: -20, estable: 7 },
      realestate: { alcista: 12, bajista: -5, estable: 9 },
      cryptogold: { alcista: 52, bajista: -40, estable: 8 }
    };

    // Standard Asset Volatilities (Beta weight markers)
    const volatilities: Record<string, number> = {
      stocks: 24.5,
      bonds: 4.2,
      indexes: 14.8,
      realestate: 10.5,
      cryptogold: 42.0
    };

    // Weighted average return calculations
    let expectedReturn = 0;
    let weightedVol = 0;

    const wStocks = userAllocStocks / 100;
    const wBonds = userAllocBonds / 100;
    const wIndexes = userAllocIndexes / 100;
    const wRealEstate = userAllocRealEstate / 100;
    const wCryptoGold = userAllocCryptoGold / 100;

    expectedReturn += wStocks * baseReturns.stocks[marketScenario];
    expectedReturn += wBonds * baseReturns.bonds[marketScenario];
    expectedReturn += wIndexes * baseReturns.indexes[marketScenario];
    expectedReturn += wRealEstate * baseReturns.realestate[marketScenario];
    expectedReturn += wCryptoGold * baseReturns.cryptogold[marketScenario];

    weightedVol += wStocks * volatilities.stocks;
    weightedVol += wBonds * volatilities.bonds;
    weightedVol += wIndexes * volatilities.indexes;
    weightedVol += wRealEstate * volatilities.realestate;
    weightedVol += wCryptoGold * volatilities.cryptogold;

    // Apply 12% diversification reduction score showing risk reduction!
    // Simply calculated: correlation benefit mitigates aggregate portfolio scale
    const portfolioVol = weightedVol * 0.88;

    // Value at Risk (VaR 1-Year 95%)
    // formula: Principal * (1.645 * Volatility - ExpectedReturn)
    const zScore = 1.645;
    const valAtRiskPercent = Math.max(1.5, (zScore * portfolioVol) - expectedReturn);
    const valAtRiskUSD = (capital * valAtRiskPercent) / 100;

    // Generate month-by-month projection values for SVG charting
    const monthsData: number[] = [];
    let cumulativeVal = capital;
    const monthlyRate = expectedReturn / 12 / 100;
    
    // Add noise based on volatility to render a beautiful wave
    for (let m = 0; m <= 12; m++) {
      if (m === 0) {
        monthsData.push(capital);
      } else {
        const trendEffect = cumulativeVal * monthlyRate;
        // Seeded pseudorandom wave fluctuations simulating assets performance
        const noiseFactor = Math.sin(m * 1.5) * (portfolioVol / 100 / 4) * cumulativeVal;
        cumulativeVal = cumulativeVal + trendEffect + noiseFactor;
        monthsData.push(Math.round(cumulativeVal));
      }
    }

    return {
      expectedReturn: Number(expectedReturn.toFixed(1)),
      portfolioVol: Number(portfolioVol.toFixed(1)),
      valAtRiskPercent: Number(valAtRiskPercent.toFixed(1)),
      valAtRiskUSD: Math.round(valAtRiskUSD),
      isBalanced,
      totalWeight: sumAlloc,
      projection: monthsData
    };
  };

  const currentMetrics = getSimulatorMetrics();

  // Natural Language Processing Animation Trigger
  const runNlpAnalysis = (newsId: string) => {
    setProcessingNlpNews(newsId);
    
    setTimeout(() => {
      const matched = MOCK_NEWS.find(n => n.id === newsId);
      if (matched) {
        setActiveNlpAnalysis(matched);
        setSelectedNews(newsId);
      }
      setProcessingNlpNews(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-full">

      {/* Segmented Interior Sub-navigation for dynamic portfolio system */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 self-start">
        <button
          onClick={() => setActiveSubTab("advisor")}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === "advisor" 
              ? "bg-zinc-800 text-[#00FF9D] border border-zinc-700/50" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <PieChart className="w-4 h-4" />
          1. Recomendador de Cartera IA
        </button>

        <button
          onClick={() => setActiveSubTab("simulator")}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === "simulator" 
              ? "bg-zinc-800 text-[#00FF9D] border border-zinc-700/50" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Sliders className="w-4 h-4" />
          2. Simulador Interactivo
        </button>

        <button
          onClick={() => setActiveSubTab("news")}
          className={`flex items-center gap-2 px-4 py-2 text-xs rounded-xl font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === "news" 
              ? "bg-zinc-800 text-[#00FF9D] border border-zinc-700/50" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          3. Noticias & Análisis PLN (EUR/USD)
        </button>
      </div>

      {/****************** TAB 1: ASSET ADVISOR RECOMENDADOR *******************/}
      {activeSubTab === "advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT COLUMN: PERSONALIZATION OPTIONS INPUT */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div className="space-y-5">
              
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800">
                <Brain className="w-4.5 h-4.5 text-[#00FF9D]" />
                <h3 className="font-display font-bold text-zinc-200 text-xs tracking-wider uppercase">
                  Parámetros de Recomendación IA
                </h3>
              </div>

              {/* Input for virtual capital */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase font-bold flex justify-between">
                  <span>Capital de Inversión Inicial (USD)</span>
                  <span className="text-[#00FF9D] font-bold">${capital.toLocaleString()} USD</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-zinc-500 font-bold font-mono text-sm">$</div>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Math.max(100, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-xs font-mono outline-none focus:border-[#00FF9D]"
                  />
                </div>
                <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full accent-[#00FF9D] h-1 rounded-lg bg-zinc-800 outline-none cursor-pointer mt-1"
              />
              </div>

              {/* Risk selector buttons */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase font-bold">
                  Perfil de Riesgo del Inversor
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Conservador", "Moderado", "Agresivo"] as const).map((r) => {
                    const active = r === risk;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRisk(r)}
                        className={`py-2 text-[11px] rounded-lg font-mono border transition-all cursor-pointer text-center font-bold ${
                          active
                            ? "bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {r.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target goal timeline selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase font-bold">
                  Objetivo Temporal de Inversión
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "corto", label: "Corto Plazo", detail: "< 1 año" },
                    { id: "mediano", label: "Mediano Plazo", detail: "1-5 años" },
                    { id: "largo", label: "Largo Plazo", detail: "> 5 años" }
                  ].map((g) => {
                    const active = g.id === goal;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id as any)}
                        className={`py-2 px-1 rounded-lg border transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                          active
                            ? "bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold uppercase">{g.label}</span>
                        <span className="text-[8px] opacity-60 font-mono mt-0.5">{g.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="mt-5 p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl text-[10px] text-zinc-500 font-mono leading-relaxed">
              <span className="text-[#00FF9D] font-bold block mb-1">PROCESAMIENTO ADEXA:</span>
              El motor combina regulaciones fiduciarias latentes en Colombia y EE.UU con redes neuronales Bayesianas de autovaloración de riesgo de activos.
            </div>

          </div>

          {/* RIGHT COLUMN: RECOMmENDED DIVERSIFICATION PLAN */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border border-zinc-800 bg-[#09090b]/40 overflow-hidden relative p-5 justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h4 className="font-display font-medium text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-[#00FF9D]" /> Autodiferenciación de Portafolio Sugerida
                </h4>
                <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                  Score de Seguridad: {risk === "Conservador" ? "Alto (1.2)" : risk === "Moderado" ? "Estándar (2.6)" : "Frecuente (4.8)"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                
                {/* SVG Visual Donut Diagram */}
                <div className="md:col-span-5 flex justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-36 h-36">
                    {(() => {
                      let currentAngle = 0;
                      return ASSET_CLASSES.map((asset) => {
                        const pct = recommendedAlloc[asset.id] || 0;
                        if (pct === 0) return null;
                        const radius = 38;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDash = (pct / 100) * circumference;
                        const strokeOffset = circumference - (currentAngle / 100) * circumference;
                        
                        currentAngle += pct;

                        return (
                          <circle
                            key={asset.id}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={asset.color}
                            strokeWidth="11"
                            strokeDasharray={`${strokeDash} ${circumference}`}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 50 50)"
                            className="transition-all duration-500 hover:opacity-80"
                          />
                        );
                      });
                    })()}
                    {/* Inner hole */}
                    <circle cx="50" cy="50" r="28" fill="#09090b" />
                    <text x="50" y="47" textAnchor="middle" fill="#888" fontSize="6" fontFamily="monospace">CARTERA</text>
                    <text x="50" y="58" textAnchor="middle" fill="#00FF9D" fontSize="8" fontFamily="monospace" fontWeight="bold">ADEXA</text>
                  </svg>
                </div>

                {/* Legend list of allocations */}
                <div className="md:col-span-7 space-y-2">
                  {ASSET_CLASSES.map((asset) => {
                    const pct = recommendedAlloc[asset.id] || 0;
                    if (pct === 0) return null;
                    const allocatedAmount = (capital * pct) / 100;
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 border border-zinc-850">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                          <span className="text-[10px] text-zinc-300 font-sans tracking-tight">{asset.name}</span>
                        </div>
                        <div className="text-right font-mono text-[10px]">
                          <span className="text-[#00FF9D] font-bold mr-2">{pct}%</span>
                          <span className="text-zinc-500 font-semibold">${allocatedAmount.toLocaleString()} USD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Qualitative analysis box */}
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-xs text-zinc-400">
                <span className="text-zinc-300 font-bold uppercase text-[10px] block mb-1">Fundamento Cuántico de la IA:</span>
                <p className="leading-relaxed font-sans">{aiRationale}</p>
              </div>

            </div>

            {/* Quick deployment actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800 justify-between items-center mt-4">
              <span className="text-[10px] text-zinc-500 font-mono tracking-wide">DavidHerreraproducciones S.A.S • NIT: 901906721-1</span>
              <button
                type="button"
                onClick={applyRecommendationToSimulator}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-black" />
                Transferir a Simulador Portafolios
              </button>
            </div>

          </div>

        </div>
      )}

      {/****************** TAB 2: PORTFOLIO SIMULATOR METRICS *******************/}
      {activeSubTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT COLUMN: CUSTOM ALLOCATIONS CONTROLS */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <h3 className="font-display font-bold text-zinc-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#00FF9D]" /> Ponderar Distribución
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                  currentMetrics.isBalanced ? "bg-[#00FF9D]/10 text-[#00FF9D]" : "bg-rose-500/10 text-rose-400 animate-pulse"
                }`}>
                  {currentMetrics.isBalanced ? "ESTABLE (100%)" : `DESALINEADO (${currentMetrics.totalWeight}%)`}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Modifica el peso de cada clase de activos en tu cartera. Para simular el rendimiento de manera precisa, el total debe sumar exactamente <strong>100%</strong>.
              </p>

              {/* Slider 1: Stocks */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">📊 Acciones (Apple, Tesla, etc.)</span>
                  <span className="text-blue-400 font-bold">{userAllocStocks}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userAllocStocks}
                  onChange={(e) => setUserAllocStocks(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1 rounded-lg bg-zinc-950 cursor-pointer"
                />
              </div>

              {/* Slider 2: Bonds */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">📈 Bonos Gubernamentales</span>
                  <span className="text-emerald-400 font-bold">{userAllocBonds}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userAllocBonds}
                  onChange={(e) => setUserAllocBonds(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1 rounded-lg bg-zinc-950 cursor-pointer"
                />
              </div>

              {/* Slider 3: Index Funds */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">✨ Fondos Indexados S&P500</span>
                  <span className="text-[#00FF9D] font-bold">{userAllocIndexes}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userAllocIndexes}
                  onChange={(e) => setUserAllocIndexes(Number(e.target.value))}
                  className="w-full accent-[#00FF9D] h-1 rounded-lg bg-zinc-950 cursor-pointer"
                />
              </div>

              {/* Slider 4: Real Estate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">🏢 Fideicomisos Inmobiliarios (REIT)</span>
                  <span className="text-amber-400 font-bold">{userAllocRealEstate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userAllocRealEstate}
                  onChange={(e) => setUserAllocRealEstate(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1 rounded-lg bg-zinc-950 cursor-pointer"
                />
              </div>

              {/* Slider 5: Crypto & Gold */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">🔮 Criptomonedas & Oro Spot</span>
                  <span className="text-purple-400 font-bold">{userAllocCryptoGold}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={userAllocCryptoGold}
                  onChange={(e) => setUserAllocCryptoGold(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 rounded-lg bg-zinc-950 cursor-pointer"
                />
              </div>

            </div>

            {/* Error alerts or Auto-Balance Button logic help */}
            <div className="mt-4">
              {!currentMetrics.isBalanced ? (
                <div className="p-3 bg-rose-950/20 border border-rose-500/25 rounded-2xl flex flex-col gap-2">
                  <p className="text-[10px] text-rose-200 font-mono flex items-center gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    Advertencia: La asignación total de activos actual suma {currentMetrics.totalWeight}%. Debe ser exactamente 100%.
                  </p>
                  <button
                    onClick={autoBalanceAllocations}
                    className="w-full py-1.5 bg-rose-500 text-white font-mono font-bold text-[10px] uppercase rounded-xl hover:bg-rose-600 transition-all cursor-pointer"
                  >
                    Auto-Ajustar a 100% Proporcional
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-950/15 border border-emerald-500/20 rounded-2xl text-[10px] text-emerald-400 font-mono flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-[#00FF9D]" />
                  <span>Distribución balanceada a las milésimas. Listo para simular.</span>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: PORTFOLIO PROJECTIONS & STRATEGICAL ANALYSIS VIEW */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border border-zinc-800 bg-[#09090b]/40 p-5 overflow-hidden justify-between">
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <h3 className="font-display font-semibold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-[#00FF9D]" /> Rendimiento & Valor en Riesgo (VaR)
                </h3>
                
                {/* Scenario tab Selector */}
                <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {([
                    { id: "alcista", label: "🐂 Alcista" },
                    { id: "estable", label: "⚖️ Estable" },
                    { id: "bajista", label: "🐻 Bajista" }
                  ] as const).map((sce) => (
                    <button
                      key={sce.id}
                      onClick={() => setMarketScenario(sce.id)}
                      className={`px-2.5 py-1 text-[9px] rounded-lg font-mono font-bold transition-all cursor-pointer uppercase ${
                        marketScenario === sce.id 
                          ? "bg-zinc-800 text-white" 
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {sce.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* THREE MAIN QUANTUM METRICS BLOCKS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Metric 1: expected annual returns */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl text-center flex flex-col justify-between">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide">Retorno Esperado (Anual)</span>
                  <p className={`font-mono text-xl font-bold mt-1.5 ${
                    currentMetrics.expectedReturn >= 0 ? "text-[#00FF9D]" : "text-rose-500"
                  }`}>
                    {currentMetrics.expectedReturn >= 0 ? "+" : ""}{currentMetrics.expectedReturn}%
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Simulación a 12 meses</p>
                </div>

                {/* Metric 2: portfolio volatility */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl text-center flex flex-col justify-between">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide">Volatilidad Promedio</span>
                  <p className="font-mono text-xl font-bold mt-1.5 text-zinc-300">
                    {currentMetrics.portfolioVol}%
                  </p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Con factor Diversificado</p>
                </div>

                {/* Metric 3: Value At Risk (VaR) */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl text-center flex flex-col justify-between relative overflow-hidden group">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide flex items-center justify-center gap-1">
                    Value-at-Risk (VaR 95%) <Info className="w-3 h-3 text-zinc-650 cursor-pointer" title="Máxima pérdida estimada anual con 95% de confianza" />
                  </span>
                  <p className="font-mono text-lg font-bold mt-1.5 text-rose-400">
                    -${currentMetrics.valAtRiskUSD.toLocaleString()} USD
                  </p>
                  <p className="text-[9px] text-rose-500/80 font-mono mt-1">({currentMetrics.valAtRiskPercent}% del principal)</p>
                </div>

              </div>

              {/* CHART: VISUAL 12 MONTH EQUITY CURVE LINE (dynamic SVG rendering) */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-mono uppercase flex items-center justify-between">
                  <span>Proyección del Capital de {capital.toLocaleString()} USD en Escenario {marketScenario.toUpperCase()}</span>
                  <span className="text-[#00FF9D] font-mono">Retorno Final Estimado: ${currentMetrics.projection[12].toLocaleString()} USD</span>
                </label>
                
                <div className="h-[140px] bg-zinc-950 border border-zinc-850 rounded-2xl relative px-4 py-2">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    
                    {/* Horizontal lines */}
                    {[10, 20].map((gl, gIdx) => (
                      <line 
                        key={gIdx}
                        x1="0" y1={gl} x2="100" y2={gl}
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth="0.25"
                      />
                    ))}

                    {/* Projections line polygon */}
                    {(() => {
                      const maxVal = Math.max(...currentMetrics.projection);
                      const minVal = Math.min(...currentMetrics.projection) * 0.95;
                      const rangeY = maxVal - minVal || 1;

                      const pointsList = currentMetrics.projection.map((val, idx) => {
                        const x = (idx / 12) * 100;
                        const y = 28 - ((val - minVal) / rangeY) * 23; 
                        return { x, y };
                      });

                      const dPath = pointsList.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
                      const fillAreaPath = `${dPath} L 100,30 L 0,30 Z`;

                      return (
                        <>
                          {/* Shaded Area area */}
                          <path 
                            d={fillAreaPath}
                            fill="url(#grad-equity-sim)"
                            className="opacity-20 transition-all duration-300"
                          />
                          {/* Stroke line path */}
                          <path 
                            d={dPath}
                            stroke="#00FF9D"
                            strokeWidth="1.25"
                            fill="none"
                            className="transition-all duration-300"
                          />
                        </>
                      );
                    })()}

                    <defs>
                      <linearGradient id="grad-equity-sim" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00FF9D" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Horizontal months tags footer inside chart area */}
                  <div className="absolute bottom-1 left-2.5 right-2.5 flex justify-between text-[8px] font-mono text-zinc-650">
                    <span>MES 0</span>
                    <span>MES 3</span>
                    <span>MES 6</span>
                    <span>MES 9</span>
                    <span>MES 12</span>
                  </div>
                </div>
              </div>

            </div>

            <p className="text-[9.5px] text-zinc-600 font-mono text-center leading-relaxed mt-4">
              ⚠️ Disclaimer: Los datos expuestos son simulaciones a partir de algoritmos basados en rendimientos históricos. No garantizan rendimientos futuros ni asumen caídas financieras imprevistas no contempladas.
            </p>

          </div>

        </div>
      )}

      {/****************** TAB 3: REAL-TIME NEWS & NLP COGNITIVE MODULE *******************/}
      {activeSubTab === "news" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* LEFT LIST: SCROLLING FINANCIAL NEWS BULLETINS */}
          <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="font-display font-semibold text-zinc-200 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Newspaper className="w-4.5 h-4.5 text-[#00FF9D]" /> Flujo de Noticias Relevantes
              </h3>
              <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500 uppercase tracking-wide">
                <Globe className="w-3.5 h-3.5" /> Terminal LIVE
              </div>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[380px] pr-1.5">
              {MOCK_NEWS.map((item) => {
                const isSelected = selectedNews === item.id;
                const isProcessing = processingNlpNews === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 ${
                      isSelected 
                        ? "bg-[#00FF9D]/10 border-[#00FF9D]" 
                        : "bg-zinc-950 border-zinc-850 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color: item.accent }}>{item.source}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">{item.date}</span>
                      </div>
                      <h4 className="font-display font-bold text-xs text-zinc-100 mt-1.5 leading-snug">{item.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{item.snippet}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1">
                      <span className="text-[8px] font-mono text-zinc-500">Filtrado por relevancia: 96%</span>
                      <button
                        onClick={() => runNlpAnalysis(item.id)}
                        disabled={isProcessing}
                        className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-[#00FF9D]/10 text-[#00FF9D] border border-transparent"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-[#00FF9D]" />
                            <span>Procesando PLN...</span>
                          </>
                        ) : isSelected ? (
                          <>
                            <Check className="w-3 h-3 text-[#00FF9D]" />
                            <span>Analizado</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-3 h-3 text-zinc-400" />
                            <span>Procesar PLN</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: PLN DETAILED ANALYZER OUTPUT */}
          <div className="lg:col-span-7 flex flex-col rounded-3xl border border-zinc-800 bg-[#09090b]/40 overflow-hidden relative p-5 justify-between">
            {activeNlpAnalysis ? (
              <div className="space-y-4 animate-fade-in">
                
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="font-display font-semibold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                    <Brain className="w-4.5 h-4.5 text-[#00FF9D]" /> Procesamiento Cognitivo (Análisis PLN)
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Detección de Tendencias (EUR/USD)</span>
                </div>

                <div className="space-y-4">
                  {/* Origin reference */}
                  <div>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                      Referente: {activeNlpAnalysis.source}
                    </span>
                    <h4 className="font-display font-bold text-white text-sm mt-3 leading-snug">{activeNlpAnalysis.title}</h4>
                  </div>

                  {/* Complete translation and nlp summary */}
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono tracking-wider uppercase mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#00FF9D]" /> Síntesis PLN Resumida (Español)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeNlpAnalysis.nlpSummary}</p>
                  </div>

                  {/* Impact projection tag */}
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono tracking-wider uppercase mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00FF9D]" /> Tendencia Económica Detectada
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-mono font-semibold">{activeNlpAnalysis.trend}</p>
                  </div>

                  {/* EUR/USD implications box */}
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono tracking-wider uppercase mb-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#00FF9D]" /> Impacto Cambiario de Tasas (EUR / USD)
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{activeNlpAnalysis.eurUsdImpact}</p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20 py-10 my-10 animate-pulse">
                <Brain className="w-10 h-10 text-zinc-800 mb-2" />
                <p className="text-xs text-zinc-500 font-mono text-center max-w-sm px-4">
                  Selecciona una noticia financiera del panel izquierdo y haz clic en <strong>Procesar PLN</strong> para generar un resumen inteligente del impacto en divisa EUR/US y carteras.
                </p>
              </div>
            )}

            <div className="text-[10px] text-zinc-650 font-mono border-t border-zinc-800 pt-3 mt-4 text-right">
              Procesador de lenguaje natural Adexa Neural.V2 • NIT: 901906721-1
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
