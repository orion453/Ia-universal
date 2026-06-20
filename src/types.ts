/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "crypto" | "stock" | "index" | "commodity";
  sparkline: number[];
}

export type RiskLevel = "Conservador" | "Moderado" | "Agresivo";

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  type: "Scalping" | "Swing Trading" | "Largo plazo automatizado";
  recommendedRisk: RiskLevel;
  winRateSimulated: number;
  expectedAnnualReturn: number;
}

export interface TradeLog {
  id: string;
  timestamp: string;
  symbol: string;
  type: "COMPRA" | "VENTA";
  price: number;
  amount: number;
  total: number;
  strategy: string;
  status: "COMPLETADO" | "PENDIENTE" | "S TOP-LOSS" | "TAKE-PROFIT";
}

export interface TeamMember {
  id: number;
  role: string;
  responsibilities: string[];
  deliverables: string[];
  seniority: "Junior" | "Mid" | "Senior" | "Lead";
}

export interface ProjectPhase {
  phase: number;
  title: string;
  description: string;
  status: "completed" | "active" | "planned";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface MembershipPlan {
  name: string;
  price: number;
  recommendedCapital: string;
  includes: string[];
  limits: string[];
}
