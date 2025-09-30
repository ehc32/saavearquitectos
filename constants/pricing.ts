export const PRICING_PER_M2 = {
  disenoArquitectonico: 46000,
  disenoEstructural: 32000,
  disenoElectrico: 20000,
  disenoHidraulico: 18000,
  presupuestoObra: 9000,
  acompanamiento: 10000,
  // costoConstruccion: 1800000, // This will be dynamic based on material line selection
} as const;

export const MATERIAL_LINE_COSTS = {
  basica: 1500000,
  media: 2000000,
  alta: 2500000,
} as const

export const IVA_RATE = 0.19 // 19% IVA

// Fixed base areas for all projects
export const BASE_AREAS = {
  cocina: 11.5,
  sala: 13.5,
  comedor: 18,
  ropas: 8,
  bano_social: 2.5,
} as const

// Payment structure percentages
export const PAYMENT_STRUCTURE = {
  firstPayment: 0.4, // 40%
  secondPayment: 0.5, // 50%
  thirdPayment: 0.1, // 10%
  earlyPaymentDiscount: 0.1, // 10% discount
} as const

// Project duration in days
export const PROJECT_DURATION_DAYS = 120
