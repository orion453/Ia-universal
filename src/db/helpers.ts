import { db } from "./index.ts";
import { users, tradeLogs, chatMessages } from "./schema.ts";
import { eq, desc } from "drizzle-orm";

/**
 * Get or register a user during authentication
 * Uses Drizzle's upsert capability to manage concurrent race-conditions.
 */
export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        virtualCapital: 15000,
        currentPlan: "Membresía PRO",
        riskLevel: "Moderado",
        activeStrategyId: "swing",
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email }, // update email or do nothing
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database Error on getOrCreateUser:", error);
    throw new Error("Error en base de datos al sincronizar usuario.", { cause: error });
  }
}

/**
 * Update user parameters such as Capital, Plan, Risk level, and active strategy
 */
export async function updateUserProfile(
  uid: string,
  params: {
    virtualCapital?: number;
    currentPlan?: string;
    riskLevel?: string;
    activeStrategyId?: string;
  }
) {
  try {
    const result = await db.update(users)
      .set(params)
      .where(eq(users.uid, uid))
      .returning();
    
    return result[0];
  } catch (error) {
    console.error("Database Error on updateUserProfile:", error);
    throw new Error("Error en base de datos al actualizar perfil de usuario.", { cause: error });
  }
}

/**
 * Get trade logs for a user
 */
export async function getTradeLogs(userUid: string) {
  try {
    return await db.select()
      .from(tradeLogs)
      .where(eq(tradeLogs.userUid, userUid))
      .orderBy(desc(tradeLogs.timestamp));
  } catch (error) {
    console.error("Database Error on getTradeLogs:", error);
    throw new Error("Error en base de datos al recuperar bitácora de transacciones.", { cause: error });
  }
}

/**
 * Save a new trade log entry
 */
export async function saveTradeLog(
  userUid: string,
  trade: {
    id: string;
    timestamp: string;
    symbol: string;
    type: string;
    price: number;
    amount: number;
    total: number;
    strategy: string;
    status: string;
  }
) {
  try {
    const result = await db.insert(tradeLogs)
      .values({
        id: trade.id,
        userUid,
        timestamp: trade.timestamp,
        symbol: trade.symbol,
        type: trade.type,
        price: trade.price,
        amount: trade.amount,
        total: trade.total,
        strategy: trade.strategy,
        status: trade.status,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database Error on saveTradeLog:", error);
    throw new Error("Error en base de datos al registrar transacciones.", { cause: error });
  }
}

/**
 * Get persisted chat messages for a user
 */
export async function getChatMessages(userUid: string) {
  try {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userUid, userUid))
      .orderBy(desc(chatMessages.timestamp));
  } catch (error) {
    console.error("Database Error on getChatMessages:", error);
    throw new Error("Error en base de datos al recuperar mensajes.", { cause: error });
  }
}

/**
 * Save a new chat message
 */
export async function saveChatMessage(
  userUid: string,
  msg: {
    id: string;
    role: string;
    text: string;
    timestamp: string;
  }
) {
  try {
    const result = await db.insert(chatMessages)
      .values({
        id: msg.id,
        userUid,
        role: msg.role,
        text: msg.text,
        timestamp: msg.timestamp,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database Error on saveChatMessage:", error);
    throw new Error("Error en base de datos al guardar mensaje.", { cause: error });
  }
}
