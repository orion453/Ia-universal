import { pgTable, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

// Define the 'users' table using Firebase Auth UID as the primary key
export const users = pgTable("users", {
  uid: text("uid").primaryKey().notNull(), // Firebase Auth UID
  email: text("email").notNull(),
  virtualCapital: integer("virtual_capital").default(15000).notNull(),
  currentPlan: text("current_plan").default("Membresía PRO").notNull(),
  riskLevel: text("risk_level").default("Moderado").notNull(),
  activeStrategyId: text("active_strategy_id").default("swing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define the 'trade_logs' table with foreign key reference to 'users'
export const tradeLogs = pgTable("trade_logs", {
  id: text("id").primaryKey().notNull(),
  userUid: text("user_uid")
    .references(() => users.uid, { onDelete: "cascade" })
    .notNull(),
  timestamp: text("timestamp").notNull(),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // "COMPRA" | "VENTA"
  price: doublePrecision("price").notNull(),
  amount: doublePrecision("amount").notNull(),
  total: doublePrecision("total").notNull(),
  strategy: text("strategy").notNull(),
  status: text("status").notNull(), // "COMPLETADO" | "PENDIENTE" | "STOP-LOSS" | "TAKE-PROFIT"
});

// Define the 'chat_messages' table with foreign key reference to 'users' to persist chats
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().notNull(),
  userUid: text("user_uid")
    .references(() => users.uid, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(), // "user" | "model"
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
});
