import express from "express";
import path from "path";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import {
  getOrCreateUser,
  updateUserProfile,
  getTradeLogs,
  saveTradeLog,
  getChatMessages,
  saveChatMessage,
} from "./src/db/helpers.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chat will operate in backup/simulation mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });
};

// API routes FIRST

/**
 * 1. Synchronize or Register Authenticated User in PostgreSQL Database
 */
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    const email = req.user?.email || "anonimo@adexa.ia";
    
    if (!userUid) {
      return res.status(401).json({ error: "Falta UID de usuario en token." });
    }

    const userRecord = await getOrCreateUser(userUid, email);
    res.json({ status: "success", user: userRecord });
  } catch (error: any) {
    console.error("Error/Syncing auth user profile:", error);
    res.status(500).json({ error: error.message || "Error al sincronizar perfil en base de datos." });
  }
});

/**
 * 2. Get User Profile Parameters
 */
app.get("/api/user-profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const userRecord = await getOrCreateUser(userUid, req.user?.email || "anonimo@adexa.ia");
    res.json(userRecord);
  } catch (error: any) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ error: error.message || "Error al recuperar perfil." });
  }
});

/**
 * 3. Update User Profile Parameters (Capital, Plan, Risk, Strategy)
 */
app.put("/api/user-profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const { virtualCapital, currentPlan, riskLevel, activeStrategyId } = req.body;
    
    const updatedUser = await updateUserProfile(userUid, {
      virtualCapital,
      currentPlan,
      riskLevel,
      activeStrategyId,
    });

    res.json({ status: "success", user: updatedUser });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: error.message || "Error al actualizar perfil de usuario." });
  }
});

/**
 * 4. Get User's Trade Logs
 */
app.get("/api/trade-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const logs = await getTradeLogs(userUid);
    res.json(logs);
  } catch (error: any) {
    console.error("Error fetching trade logs:", error);
    res.status(500).json({ error: error.message || "Error al obtener historial de trading." });
  }
});

/**
 * 5. Add a New Trade Log Entry
 */
app.post("/api/trade-logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const { symbol, type, price, amount, total, strategy, status } = req.body;
    
    const newLog = await saveTradeLog(userUid, {
      id: "trd_" + randomUUID(),
      timestamp: new Date().toISOString(),
      symbol,
      type,
      price,
      amount,
      total,
      strategy,
      status,
    });

    res.json({ status: "success", trade: newLog });
  } catch (error: any) {
    console.error("Error registering trade log entry:", error);
    res.status(500).json({ error: error.message || "Error al guardar transacción." });
  }
});

/**
 * 6. Retrieve Chat Messages History
 */
app.get("/api/chat-messages", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const history = await getChatMessages(userUid);
    // Reverse it to return in chronological order for frontend
    res.json(history.reverse());
  } catch (error: any) {
    console.error("Error loading chat messages history:", error);
    res.status(500).json({ error: error.message || "Error al leer mensajes históricos." });
  }
});

/**
 * 7. Secure Chat Endpoint linked with Gemini and SQL Persistence
 */
app.post("/api/chat", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) return res.status(401).json({ error: "Autorización requerida." });

    const { message, strategy, riskLevel, capital } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }

    // Acknowledge custom prompt timestamp
    const timestamp = new Date().toISOString();

    // 1. Save user prompt message to PostgreSQL
    const userMsgId = "msg_user_" + randomUUID();
    await saveChatMessage(userUid, {
      id: userMsgId,
      role: "user",
      text: message,
      timestamp,
    });

    // 2. Fetch history from DB to pass to Gemini API (keeps context)
    const dbHistoryObjects = await getChatMessages(userUid);
    // We reverse to get historical order, limit to latest 14 messages for prompt window token optimization
    const historicalMessages = dbHistoryObjects.reverse().slice(-14);

    const ai = getGeminiClient();

    let replyText = "";
    let isMockNote = false;

    // If key is missing, provide a smart simulated financial analyst response
    if (!ai) {
      const simulatedResponses = [
        `[Soporte Adexa IA] Basado en tu perfil "${riskLevel || "Moderado"}" y capital simulado de $${capital || "15,000"} USD, la estrategia "${strategy || "Swing Trading"}" sugiere diversificar 60% en criptoactivos consolidados (BTC/sol) y 40% en acciones estables. El sentimiento del mercado indica solidez a medio plazo.`,
        `[Soporte Adexa IA] He analizado los parámetros de tu estrategia "${strategy || "Swing Trading"}". Se observa un soporte crítico en la media móvil exponencial de 50 períodos. Considera colocar alertas de compra selectivas.`,
        `[Soporte Adexa IA] Para un capital de $${capital || "15,000"} USD y nivel "${riskLevel || "Moderado"}", el simulador de portafolios de Adexa recomienda rebalancear un 10% hacia refugios financieros (por ejemplo, Oro en bolsa o bonos de deuda en divisa fuerte).`
      ];
      replyText = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      isMockNote = true;
    } else {
      // Prepare system instructions incorporating current strategy/risk context
      const systemInstruction = `Eres Adexa IA, la Inteligencia Artificial Universal de Inversiones definitiva para DavidHerreraproducciones S.A.S.
Diseñada para asesorar tanto a principiantes como a profesionales del trading de forma clara, precisa y altamente analítica.
Tus características:
- Tono: Futurista, sofisticado, tecnológico, pero amigable y pedagógico.
- Contexto de Usuario Actual: Estrategia seleccionada: "${strategy || "No especificada"}", Perfil de riesgo: "${riskLevel || "Moderado"}", Capital del portfolio: $${capital || "15,000"} USD.
- Temáticas soportadas: Criptomonedas (Bitcoin, Ethereum, Solana, etc.), Acciones globales (Apple, Tesla, Amazon, etc.), ETFs, Índices globales (S&P500), Commodities (Oro, Petróleo), análisis técnico, backtesting y gestión autónoma de riesgo (Trailing stop, Stop Loss, Take Profit).
- Limitación importante: Explica de forma clara que ofreces análisis predictivo e insights de machine learning, pero que el usuario asume la decisión final de inversión (descargo de responsabilidad regulatorio).
- Respuestas en idioma: Español.
Evita respuestas extremadamente largas; sé contundente, estructurado con viñetas elegantes y con enfoque en métricas financieras.`;

      // Format previous messages for Gemini
      const geminiHistory = historicalMessages.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      // Generate content using gemini-3.5-flash
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...geminiHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      replyText = response.text || "No obtuve una respuesta clara de mis redes neuronales. Intenta de nuevo.";
    }

    // 3. Save model reply to PostgreSQL
    const modelMsgId = "msg_model_" + randomUUID();
    await saveChatMessage(userUid, {
      id: modelMsgId,
      role: "model",
      text: replyText,
      timestamp: new Date().toISOString(),
    });

    res.json({
      text: replyText,
      id: modelMsgId,
      note: isMockNote ? "Nota: Esta respuesta fue autogenerada en modo de simulación porque la API Key de Gemini aún no está configurada." : undefined
    });

  } catch (error: any) {
    console.error("Error calling Gemini API / saving chat:", error);
    res.status(500).json({ 
      error: "Error interno procesando las redes neuronales de Adexa.", 
      details: error.message 
    });
  }
});

/**
 * 8. API route for News Sentiment and Signal Auto-Generation (NLP)
 */
app.post("/api/news-sentiment", async (req: express.Request, res) => {
  try {
    const { asset } = req.body;
    if (!asset) {
      return res.status(400).json({ error: "El activo es requerido." });
    }

    const ai = getGeminiClient();
    let score = Math.floor(Math.random() * 25) + 65; // default Bullish 65-90
    let label = "Alza Moderada (Bullish)";
    let analysis = "";
    
    const mockPrices: Record<string, number> = {
      BTC: 67340.50,
      SOL: 148.20,
      AAPL: 182.50,
      TSLA: 174.10
    };
    const currentPrice = mockPrices[asset] || 100.00;

    if (!ai) {
      analysis = `[Modo Simulación] El análisis semántico en tiempo real de múltiples canales para ${asset} revela una fuerte concentración de compras marginales en el soporte técnico semanal de 15 periodos. Las ballenas e inversores minoristas están aumentando su exposición e ingresos.`;
    } else {
      const prompt = `Analiza el sentimiento de mercado actual y las noticias financieras para el activo "${asset}". 
Produce un reporte en español que incluya análisis semántico breve, análisis técnico y una conclusión de sentimiento.
Luego provee la respuesta en formato JSON con la siguiente estructura exacta:
{
  "analysis": "Una explicación de 3-4 líneas en español sobre las noticias relevantes, si sugieren alza o baja, y soportes de volumen",
  "score": un número entero entre 15 y 95 representing general bullish strength (15 is deep panic, 95 is extreme greed),
  "label": "Una etiqueta corta en español, ej 'Alza Explosiva', 'Baja Técnica', 'Consolidación'",
  "type": "COMPRA" o "VENTA" basado en el análisis posterior,
  "confidence": un entero porcentaje, similar al score
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.5,
            responseMimeType: "application/json"
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        analysis = parsed.analysis || `Análisis consolidado para la tendencia macro de ${asset}.`;
        score = parsed.score || score;
        label = parsed.label || label;
      } catch (jsonErr) {
        console.warn("JSON structured parsing failed, using procedurally assisted format:", jsonErr);
        analysis = `El activo ${asset} muestra un impulso técnico sostenido. Los flujos de capital institucional indican una acumulación superior al promedio de 30 días, impulsado por novedades en su ecosistema y coberturas macroeconómicas globales favorables.`;
      }
    }

    // Prepare signal
    const isBullish = score >= 50;
    const signalType = isBullish ? "COMPRA" : "VENTA";
    const percentMovement = (score / 1500) + 0.03; // e.g., 3% to 8% target
    
    const targetPrice = isBullish 
      ? Number((currentPrice * (1 + percentMovement)).toFixed(2))
      : Number((currentPrice * (1 - percentMovement)).toFixed(2));
      
    const stopPrice = isBullish
      ? Number((currentPrice * (1 - percentMovement * 0.5)).toFixed(2))
      : Number((currentPrice * (1 + percentMovement * 0.5)).toFixed(2));

    const total = 1200; // virtual capital slice amount
    const amount = Number((total / currentPrice).toFixed(3));

    res.json({
      analysis,
      score,
      label,
      signal: {
        symbol: asset,
        type: signalType,
        price: currentPrice,
        amount,
        takeProfit: targetPrice,
        stopLoss: stopPrice,
        total,
        confidence: score
      }
    });

  } catch (error: any) {
    console.error("Error in /api/news-sentiment:", error);
    res.status(500).json({ error: "Fallo al escanear los indicadores NLP de Adexa IA." });
  }
});

// Configure Vite middleware in development, and serve static build in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adexa IA Server loaded successfully at http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to bootstrap Adexa IA Server:", err);
});
