export interface QuestionOption {
  letra: string
  text: string
  value: string | number
  area?: number
  action?: string
  data?: any
}

export interface ChatMessage {
  sender: "user" | "bot"
  text: string
  options?: QuestionOption[]
  timestamp: Date
  extraData?: any
}

export interface UserResponses {
  lote?: string
  habitacion_principal?: string
  habitaciones_adicionales?: number
  espacios_adicionales?: string[]
  linea_materiales?: string
  [key: string]: any
}

export interface UserData {
  nombre: string
  telefono: string
  correo: string
}

export interface AreaBreakdown {
  baseAreas: { [key: string]: number }
  principalRoom: number
  additionalRooms: { [key: string]: number }
  extraSpaces: { [key: string]: number }
  total: number
}

export interface QuotationData {
  formato: string
  area_total: number
  cotizacionTexto: string
  areaBreakdown: AreaBreakdown
  economicProposalJSON: any
  // New fields for technical summary in API payload
  areas_basicas_summary: string
  habitacion_principal_summary: string
  habitaciones_adicionales_summary: string
  espacios_adicionales_summary: string
  m2_formatted: string
  linea_materiales_summary: string

  // API data fields - updated to match Python backend expectations (lowercase, snake_case)
  nombre: string
  telefono: string
  correo: string
  diseno_arquitectonico: string
  diseno_estructural: string
  acompanamiento_licencias: string
  subtotal_etapa_1: string
  diseno_electrico: string
  diseno_hidraulico: string
  presupuesto_proyecto: string
  subtotal_etapa_2: string
  costo: string // Changed from costo_construccion to costo
  total_general: string
  total_general_texto: string
  fecha: string
  subtotal_sin_iva: string
  iva_amount: string
  linea_materiales: string
  [key: string]: any // Allow other properties if needed
}

export interface ChatbotProps {
  onBack?: () => void
}
