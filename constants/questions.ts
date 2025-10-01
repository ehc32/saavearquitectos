import type { QuestionOption } from "@/types/chatbot"

export const MAIN_QUESTIONS = [
  {
    id: "lote",
    text: "¿Tiene lote?",
    options: [
      { letra: "A", text: "Sí", value: "si" },
      { letra: "B", text: "No, estamos en proceso de compra", value: "no_proceso" },
    ] as QuestionOption[],
  },
  {
    id: "habitacion_principal",
    text: "Habitación principal - ¿Qué tipo de cama le gustaría?",
    options: [
      { letra: "A", text: "Doble (137x191 cm)", value: "doble", area: 25 },
      { letra: "B", text: "Queen (152x203 cm)", value: "queen", area: 27 },
      { letra: "C", text: "King (193x203 cm)", value: "king", area: 30 },
      { letra: "D", text: "California King (183x213 cm)", value: "california_king", area: 32 },
    ] as QuestionOption[],
  },
  {
    id: "habitaciones_adicionales",
    text: "Además de la habitación principal, ¿cuántas habitaciones adicionales desea?",
    options: [
      { letra: "A", text: "0", value: 0 },
      { letra: "B", text: "1", value: 1 },
      { letra: "C", text: "2", value: 2 },
      { letra: "D", text: "3", value: 3 },
      { letra: "E", text: "4", value: 4 },
    ] as QuestionOption[],
  },
] as const

export const ROOM_QUESTIONS = [
  {
    id: "tipo_cama",
    text: (num: number) => `Habitación ${num} - ¿Qué tipo de cama le gustaría?`,
    options: [
      { letra: "A", text: "Sencilla (99x191 cm)", value: "sencilla", area: 14 },
      { letra: "B", text: "Doble (137x191 cm)", value: "doble", area: 16 },
      { letra: "C", text: "Queen (152x203 cm)", value: "queen", area: 18 },
    ] as QuestionOption[],
  },
  {
    id: "bano_propio",
    text: (num: number) => `Habitación ${num} - ¿Tiene baño propio?`,
    options: [
      { letra: "A", text: "Sí, con baño", value: "si", area: 3.5 },
      { letra: "B", text: "No, sin baño", value: "no", area: 0 },
    ] as QuestionOption[],
  },
] as const

export const ADDITIONAL_SPACES = [
  { letra: "A", text: "Estudio", value: "estudio", area: 18 },
  { letra: "B", text: "Sala de TV", value: "sala_tv", area: 14 },
  { letra: "C", text: "Habitación de servicio + baño", value: "hab_servicio", area: 14 },
  { letra: "D", text: "Depósito pequeño", value: "deposito_pequeno", area: 4 },
  { letra: "E", text: "Depósito mediano", value: "deposito_mediano", area: 6 },
  { letra: "F", text: "Depósito grande", value: "deposito_grande", area: 9 },
  { letra: "G", text: "Sauna", value: "sauna", area: 9 },
  { letra: "H", text: "Turco", value: "turco", area: 9 },
  { letra: "I", text: "Piscina pequeña", value: "piscina_pequena", area: 16 },
  { letra: "J", text: "Piscina mediana", value: "piscina_mediana", area: 24 },
  { letra: "K", text: "Piscina grande", value: "piscina_grande", area: 32 },
  { letra: "L", text: "Baño social exterior", value: "bano_social_ext", area: 4 },
  { letra: "M", text: "Ninguno", value: "ninguno", area: 0 },
] as QuestionOption[]

export const MATERIAL_LINE_QUESTION = {
  id: "linea_materiales",
  text: "Para la construcción del proyecto, escoja la 'línea' o 'gama' de los materiales:",
  options: [
    { letra: "A", text: "Básica: COP $1'500.000", value: "basica", cost: 1500000 },
    { letra: "B", text: "Media: COP $2'000.000", value: "media", cost: 2000000 },
    { letra: "C", text: "Alta: COP $2'500.000", value: "alta", cost: 2500000 },
  ] as QuestionOption[],
} as const
