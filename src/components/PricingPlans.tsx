/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Check, ShieldCheck, CornerRightDown, Gem, Star, ShieldAlert } from "lucide-react";
import { MembershipPlan } from "../types";
import { PLANS } from "../data";

interface PricingPlansProps {
  currentPlan: string;
  setCurrentPlan: (planName: string) => void;
  setVirtualCapital: (capital: number) => void;
  setRiskLevel: (risk: "Conservador" | "Moderado" | "Agresivo") => void;
}

export default function PricingPlans({
  currentPlan,
  setCurrentPlan,
  setVirtualCapital,
  setRiskLevel
}: PricingPlansProps) {

  const handleSelectPlan = (plan: MembershipPlan) => {
    setCurrentPlan(plan.name);
    
    // Automatically preset reasonable mock numbers based on subscription level limits for better UX
    if (plan.name === "Membresía Básica") {
      setVirtualCapital(1500);
      setRiskLevel("Conservador");
    } else if (plan.name === "Membresía PRO") {
      setVirtualCapital(15000);
      setRiskLevel("Moderado");
    } else if (plan.name === "Membresía PREMIUM") {
      setVirtualCapital(75000);
      setRiskLevel("Agresivo");
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-medium text-white text-base uppercase tracking-wider">Opciones de Membresía de Adexa</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Actualmente operando bajo la suscripción: <span className="text-[#00FF9D] font-bold">{currentPlan}</span></p>
        </div>
        <div className="text-[10px] bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20 px-3.5 py-1.5 rounded-full font-mono font-bold flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" /> PLANES DE OPERACIÓN GLOBAL
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 lg:items-stretch">
        {PLANS.map((plan) => {
          const isSelected = plan.name === currentPlan;
          
          return (
            <div
              key={plan.name}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                isSelected
                  ? "bg-zinc-950 border-[#00FF9D] shadow-[0_0_35px_rgba(0,255,157,0.12)]"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Highlight Ribbon for active plan */}
              {isSelected && (
                <span className="absolute -top-2.5 right-4 bg-[#00FF9D] text-black font-mono text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Suscrito Activo
                </span>
              )}

              {/* Header Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-zinc-200 text-sm tracking-wide">{plan.name}</span>
                  {plan.name === "Membresía PREMIUM" ? (
                    <Gem className="w-4 h-4 text-[#00FF9D]" />
                  ) : plan.name === "Membresía PRO" ? (
                    <Star className="w-4 h-4 text-[#00FF9D]" />
                  ) : null}
                </div>
                
                <div className="flex items-baseline gap-1 mt-2 mb-1.5">
                  <span className="font-mono text-2xl font-bold text-white">${plan.price}</span>
                  <span className="text-zinc-500 text-xs font-mono">/ USD mes</span>
                </div>
                
                <p className="text-[10px] font-mono text-[#00FF9D] uppercase bg-zinc-950 py-1.5 px-3 rounded-xl border border-zinc-850 inline-block font-semibold tracking-wide">
                  Capital: {plan.recommendedCapital}
                </p>

                {/* Benefits List */}
                <h4 className="text-[11px] font-mono text-zinc-350 border-b border-zinc-800 pb-2 mt-5 mb-3 flex items-center gap-1 uppercase tracking-wider">
                  Beneficios Incluidos <Check className="w-3.5 h-3.5 text-[#00FF9D]" />
                </h4>
                
                <ul className="space-y-2">
                  {plan.includes.map((benefit, bIdx) => (
                    <li key={bIdx} className="text-[11px] text-zinc-350 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-[#00FF9D] font-bold shrink-0">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations section (Except for full service Premium) */}
                <h4 className="text-[11px] font-mono text-zinc-500 border-b border-zinc-850 pb-2 mt-5 mb-3 flex items-center gap-1 uppercase tracking-wider">
                  Limitaciones <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
                </h4>
                
                <ul className="space-y-1.5">
                  {plan.limits.map((limit, lIdx) => (
                    <li key={lIdx} className="text-[10px] text-zinc-500 leading-relaxed italic flex items-start gap-1.5">
                      <span className="text-rose-500/60 shrink-0">✕</span>
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 mt-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] cursor-default font-extrabold"
                    : "bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                }`}
              >
                {isSelected ? "Plan Activo en Cuentas" : "Simular Activación"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
