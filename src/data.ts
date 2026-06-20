/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TickerData, InvestmentStrategy, TeamMember, ProjectPhase, MembershipPlan } from "./types";

export const INITIAL_TICKERS: TickerData[] = [
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 67425.80,
    change: 1420.50,
    changePercent: 2.15,
    type: "crypto",
    sparkline: [66000, 66200, 65900, 66300, 66800, 67200, 67425]
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
    price: 3485.20,
    change: -45.10,
    changePercent: -1.28,
    type: "crypto",
    sparkline: [3550, 3540, 3510, 3490, 3470, 3465, 3485]
  },
  {
    symbol: "SOL/USD",
    name: "Solana",
    price: 148.65,
    change: 5.45,
    changePercent: 3.81,
    type: "crypto",
    sparkline: [142, 141, 144, 143, 146, 147, 148.65]
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 182.30,
    change: 2.10,
    changePercent: 1.17,
    type: "stock",
    sparkline: [180.1, 180.5, 179.9, 181.2, 181.8, 181.5, 182.3]
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 177.40,
    change: -5.80,
    changePercent: -3.17,
    type: "stock",
    sparkline: [183.2, 181.4, 182.0, 180.5, 178.1, 176.9, 177.4]
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 185.15,
    change: 3.40,
    changePercent: 1.87,
    type: "stock",
    sparkline: [181.5, 182.2, 183.1, 182.8, 184.0, 184.5, 185.15]
  },
  {
    symbol: "SPX",
    name: "S&P 500 Index",
    price: 5214.20,
    change: 41.50,
    changePercent: 0.80,
    type: "index",
    sparkline: [5172, 5180, 5175, 5192, 5205, 5201, 5214.2]
  },
  {
    symbol: "GOLD",
    name: "Oro Spot",
    price: 2342.10,
    change: 24.50,
    changePercent: 1.06,
    type: "commodity",
    sparkline: [2315, 2320, 2318, 2325, 2332, 2330, 2342.1]
  },
  {
    symbol: "OIL",
    name: "Crudo Brent",
    price: 82.45,
    change: -0.95,
    changePercent: -1.14,
    type: "commodity",
    sparkline: [83.4, 83.2, 82.8, 83.1, 82.5, 82.2, 82.45]
  }
];

export const STRATEGIES: InvestmentStrategy[] = [
  {
    id: "scalping-auto",
    name: "Adexa Micro-Scalping HFT",
    description: "Algoritmo ultra-veloz de alta frecuencia. Captura micro-tendencias y diferenciales de precios en marcos de tiempo de 1m a 5m. Ideal para explotar volatilidad intradiaria.",
    type: "Scalping",
    recommendedRisk: "Agresivo",
    winRateSimulated: 78.4,
    expectedAnnualReturn: 42.5
  },
  {
    id: "swing-neural",
    name: "Impulso Neuronal Swing-Trading",
    description: "Analiza indicadores macro, medias móviles exponenciales y noticias con procesamiento de lenguaje natural (NLP). Ejecuta órdenes para capitalizar movimientos en rango de 1 a 7 días.",
    type: "Swing Trading",
    recommendedRisk: "Moderado",
    winRateSimulated: 72.1,
    expectedAnnualReturn: 28.2
  },
  {
    id: "portfolio-rebalance",
    name: "Rebalanceo Universal Largo Plazo",
    description: "Gestión autónoma de portafolio para conservación de capital. Rebalancea automáticamente ponderaciones entre criptos de baja volatilidad, ETFs globales, índices y metales de cobertura.",
    type: "Largo plazo automatizado",
    recommendedRisk: "Conservador",
    winRateSimulated: 89.6,
    expectedAnnualReturn: 16.8
  }
];

export const PLANS: MembershipPlan[] = [
  {
    name: "Membresía Básica",
    price: 19,
    recommendedCapital: "Menos de $2,000 USD",
    includes: [
      "Acceso a señales básicas (Compra/Venta)",
      "IA con análisis diario (No en tiempo real)",
      "1 estrategia automática simple",
      "Backtesting limitado (pruebas históricas simples)",
      "Soporte por chat nivel básico",
      "Conexión a un solo Exchange/Broker",
      "Riesgo controlado muy conservador",
      "Panel simple y amigable"
    ],
    limits: [
      "No incluye análisis en tiempo real segundo a segundo",
      "No incluye estrategias avanzadas ni multiactivos",
      "Sin datos macro globales integrados",
      "Sin soporte de trading de alta frecuencia"
    ]
  },
  {
    name: "Membresía PRO",
    price: 49,
    recommendedCapital: "$2,000 - $20,000 USD",
    includes: [
      "Todo lo de la membresía básica",
      "Análisis neuronal recurrente cada 10-60 minutos",
      "Hasta 5 estrategias automáticas configurables",
      "Backtesting avanzado con múltiples escenarios",
      "Datos on-chain completos (Crypto) + Datos de Bolsa",
      "Conexión simultánea a 3 Exchanges/Brokers",
      "Soporte preferente",
      "Notificaciones avanzadas de volumen y rebotes",
      "Ajuste automático de riesgo según volatilidad externa"
    ],
    limits: [
      "No incluye análisis en tiempo real segundo a segundo",
      "No accede a la IA en modo de 'predicción macro avanzada'",
      "Estrategias Premium exclusivas bloqueadas"
    ]
  },
  {
    name: "Membresía PREMIUM",
    price: 119,
    recommendedCapital: "Más de $20,000 USD / Fondos",
    includes: [
      "Todo lo de la membresía PRO",
      "IA en tiempo real ultra-rápida (1-5 segundos)",
      "Predicción avanzada multiactivo integral",
      "Estrategias avanzadas ilimitadas",
      "Ajuste de riesgo, Stop Loss y Take Profit dinámicos",
      "Integración directa con TradingView webhooks",
      "Conexión ilimitada a Exchanges/Brokers internacionales",
      "Soporte humano dedicado 24/7",
      "Hedge automático para protección contra crash de mercado",
      "IA multi-indicadores globales (Tasas, Inflación, Oro, S&P)"
    ],
    limits: [
      "Ninguna limitación. Acceso total de nivel institucional y Hedge Fund regulado."
    ]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    role: "Product Manager / Líder de Proyecto",
    seniority: "Lead",
    responsibilities: [
      "Define la visión completa del producto (IA + plataforma)",
      "Coordinar a los 11 miembros del equipo para trabajar alineados",
      "Supervisar tiempos, calidad, metas y el presupuesto del roadmap"
    ],
    deliverables: [
      "Documento de Requerimientos del Producto (PRD)",
      "Roadmap estratégico de 12 meses",
      "Sprint planning, daily follow-ups e informes de avance semanal"
    ]
  },
  {
    id: 2,
    role: "Backend Senior Engineer",
    seniority: "Senior",
    responsibilities: [
      "Es la columna vertebral del sistema. Diseña la API REST y GraphQL principal",
      "Conecta: IA, Usuarios, Wallets, y Brokers (Binance, Alpaca, IBKR)",
      "Crea arquitecturas seguras y modulares basadas en microservicios"
    ],
    deliverables: [
      "API REST / GraphQL completamente documentadas",
      "Integración de brokers vía API Keys segura",
      "Sistemas criptográficos para pasarelas de pago (Stripe, Paypal, Wompi, MercadoPago)"
    ]
  },
  {
    id: 3,
    role: "Backend Mid Engineer",
    seniority: "Mid",
    responsibilities: [
      "Construye los módulos secundarios del sistema",
      "Gestión de alertas y de historiales de trading automatizados",
      "Diseña tareas automatizadas en segundo plano (cronjobs, worker bots)"
    ],
    deliverables: [
      "Módulos listos de Notificaciones, Auditorías de operaciones y perfiles",
      "Ficheros de scripts de automatización estables",
      "Documentación técnica de endpoints secundarios"
    ]
  },
  {
    id: 4,
    role: "Frontend Senior Engineer (Web + App)",
    seniority: "Senior",
    responsibilities: [
      "Construye la interfaz visual universal con React (web) y React Native (móvil)",
      "Programa tableros interactivos en tiempo real para precios, señales y ganancias",
      "Optimiza la UI cyberpunk futurista, transiciones suaves y fluidez"
    ],
    deliverables: [
      "Web modular futurista responsiva",
      "Panel de usuario interactivo e intuitivo para novatos",
      "Repositorio de componentes visuales altamente reutilizables"
    ]
  },
  {
    id: 5,
    role: "Frontend Mid Engineer",
    seniority: "Mid",
    responsibilities: [
      "Desarrolla las pantallas secundarias y flujos auxiliares",
      "Garantizar la correcta visualización de secciones (perfil, ajustes, soporte)",
      "Realiza pruebas de usabilidad y feedback de UI/UX"
    ],
    deliverables: [
      "Vistas completas de perfil, ajustes de seguridad, chat de soporte",
      "Pruebas de interfaz exitosas",
      "Ajustes pixel-perfect"
    ]
  },
  {
    id: 6,
    role: "Ingeniero de IA Senior (ML + Real-Time)",
    seniority: "Senior",
    responsibilities: [
      "Cerebro del producto. Construye la IA Universal para predecir precios y noticias",
      "Diseña modelos de aprendizaje profundo (LSTM, Transformers finetuned, RL)",
      "Crea algoritmos que ajustan Stop Loss y Take Profit sin intervención humana"
    ],
    deliverables: [
      "Modelo IA entrenado con datos históricos globales",
      "Motor inferencial de señales predictivas en tiempo real",
      "API autónoma de gestión de riesgos integrada"
    ]
  },
  {
    id: 7,
    role: "Quant Analyst / Data Scientist",
    seniority: "Senior",
    responsibilities: [
      "Define y valida matemáticamente las estrategias de trading de Adexa",
      "Prueba la estabilidad histórica de los modelos (Backtesting estricto)",
      "Desarrolla indicadores avanzados de liquidez, volatilidad y correlaciones de activos"
    ],
    deliverables: [
      "Reportes estadísticos de backtests y curvas de rentabilidad completas",
      "Presets matemáticos para optimización de algoritmos de trading",
      "Estrategias optimizadas listas para codificación"
    ]
  },
  {
    id: 8,
    role: "Diseñador UI/UX Futurista",
    seniority: "Senior",
    responsibilities: [
      "Crea la identidad visual premium futurista (conceptos oscuros, neón, holografías)",
      "Diseña un onboarding fluido que democratiza inversiones para principiantes",
      "Define paleta de colores, tipografías del espacio cibernético"
    ],
    deliverables: [
      "Figma interactivo navegable para web y apps",
      "Manual estructurado de identidad visual y guías de animación",
      "Assets finales y SVGs ultraligeros optimizados"
    ]
  },
  {
    id: 9,
    role: "DevOps / Cloud Engineer",
    seniority: "Senior",
    responsibilities: [
      "Construye y supervisa la infraestructura cloud robusta (AWS/GCP)",
      "Implementa pipelines automáticos de CI/CD para despliegues rápidos en contenedores",
      "Garantiza el procesamiento sin caídas y latencias ultra-bajas para flujos continuos"
    ],
    deliverables: [
      "Arquitectura en Kubernetes escalable en USA/Europa",
      "Monitor de latencia, fallas y carga activo 24/7",
      "Firewalls, backups automáticos y configuraciones de seguridad HTTPS"
    ]
  },
  {
    id: 10,
    role: "Legal / Abogado Fintech + RegTech",
    seniority: "Lead",
    responsibilities: [
      "Estructura el marco legal global para operar en LATAM, USA y Europa",
      "Asegura el estricto cumplimiento financiero (AML, KYC, Protección de Datos)",
      "Redacta términos y condiciones que limitan responsabilidades directas de la IA"
    ],
    deliverables: [
      "Documentación legal completa de la plataforma",
      "Sistema de verificación KYC integrado teóricamente",
      "Contratos de vinculación con brokers internacionales aprobados"
    ]
  },
  {
    id: 11,
    role: "QA Automatizador / QA Engineer",
    seniority: "Mid",
    responsibilities: [
      "Diseña e implementa suites de pruebas automáticas para Frontend y Backend",
      "Valida la estabilidad de integraciones con pasarelas de pago y brokers",
      "Documenta casos de prueba complejos para evitar regressions"
    ],
    deliverables: [
      "Scripts de test automáticos funcionales para endpoints",
      "Reportes semanales de issues y auditorías de código",
      "Certificación de calidad estable para cada nueva versión de Adexa"
    ]
  }
];

export const PROJECT_PHASES: ProjectPhase[] = [
  {
    phase: 1,
    title: "Diseño General + Identidad Futurista",
    description: "Creación de la identidad visual premium, paleta cyberpunk (azul neón, púrpura) y pantallas iniciales interactivas.",
    status: "completed"
  },
  {
    phase: 2,
    title: "IA versión inicial + Análisis de Mercado",
    description: "Entrenamiento del modelo predictivo básico de IA con series de tiempo de mercados financieros y criptográficos históricos.",
    status: "completed"
  },
  {
    phase: 3,
    title: "Plataforma Frontend + Dashboards",
    description: "Consolidación de la plataforma visual en React/Vite. Integración del panel de trading interactivo y gráficos descriptivos.",
    status: "active"
  },
  {
    phase: 4,
    title: "Desarrollo del Backend + API Trading",
    description: "Creación de APIs para gestión segura de credenciales de usuario, cifrado AES-256 de llaves API y endpoints financieros.",
    status: "planned"
  },
  {
    phase: 5,
    title: "Conectar Brokers Internacionales",
    description: "Despliegue de conectores webhooks con Binance, Alpaca, Bybit e Interactive Brokers sin manejo directo de fondos.",
    status: "planned"
  },
  {
    phase: 6,
    title: "Motor de Trading Automatizado",
    description: "Integración autónoma del motor analítico para colocar órdenes relámpago con Stop Loss y Take Profit dinámicos.",
    status: "planned"
  },
  {
    phase: 7,
    title: "Pruebas con Usuarios Reales",
    description: "Lanzamiento alfa cerrado con portafolios reducidos para verificar latencia de red, exactitud de predicciones e interfaz.",
    status: "planned"
  },
  {
    phase: 8,
    title: "Lanzamiento Internacional",
    description: "Despliegue a producción de la plataforma web y mobile. Apertura de suscripciones mensuales y pasarelas de pago global.",
    status: "planned"
  },
  {
    phase: 9,
    title: "Optimización + Expansión Global",
    description: "Ajuste de modelos neuronales por aprendizaje con refuerzo basadas en éxitos de usuarios. Campañas regionales LATAM/USA.",
    status: "planned"
  },
  {
    phase: 10,
    title: "Adexa Avanzada (Voz + Macro)",
    description: "Versión de la IA integrada con habla bidireccional mediante síntesis de voz, noticias globales en tiempo real e impactos macro.",
    status: "planned"
  }
];
