import {
  PRICING_PER_M2,
  PAYMENT_STRUCTURE,
  PROJECT_DURATION_DAYS,
  MATERIAL_LINE_COSTS,
  IVA_RATE,
} from "@/constants/pricing"
import { calculateAreaBreakdown, generateAreaBreakdownText } from "./area-calculator"
import { convertNumberToSpanishText, formatDateToSpanish } from "./text-converter"
import { ADDITIONAL_SPACES, MAIN_QUESTIONS, ROOM_QUESTIONS } from "@/constants/questions"
import type { UserData, UserResponses, QuotationData, AreaBreakdown } from "@/types/chatbot"

/**
 * Generate complete quotation with detailed area breakdown
 */
export const generateCompleteQuotation = (
  userData: UserData,
  responses: UserResponses,
  additionalRooms: number,
): QuotationData => {
  // Calculate area breakdown
  const areaBreakdown = calculateAreaBreakdown(responses, additionalRooms)
  const totalArea = areaBreakdown.total

  // Calculate pricing stages
  const stage1Costs = calculateStage1Costs(totalArea)
  const stage2Costs = calculateStage2Costs(totalArea)

  // Calculate total design and licensing cost (sum of Etapa 1 and Etapa 2)
  const totalDesignAndLicensingCost = stage1Costs.subtotal + stage2Costs.subtotal

  // Subtotal sin IVA es ahora SOLO el diseño (Etapa 1 + Etapa 2)
  const subtotalSinIva = totalDesignAndLicensingCost
  const ivaAmount = subtotalSinIva * IVA_RATE
  // Total General es ahora SOLO diseño + IVA (NO incluye construcción)
  const totalCost = subtotalSinIva + ivaAmount

  const materialLineCost = getMaterialLineCost(responses.linea_materiales || "media")
  const costoConstruccion = totalArea * materialLineCost

  // Generate payment breakdown (basado en el costo de diseño únicamente)
  const paymentBreakdown = calculatePaymentBreakdown(totalCost)

  // Generate area breakdown text
  const areaBreakdownText = generateAreaBreakdownText(areaBreakdown)

  // Generate new summary strings for API payload
  const areasBasicasSummary = generateBaseAreasSummary(areaBreakdown)
  const habitacionPrincipalSummary = generatePrincipalRoomSummary(responses)
  const habitacionesAdicionalesSummary = generateAdditionalRoomsSummary(responses, additionalRooms)
  const espaciosAdicionalesSummary = generateExtraSpacesSummary(responses)
  const lineaMaterialesSummary = generateMaterialLineSummary(responses)
  const m2Formatted = `${totalArea.toLocaleString("es-CO", { maximumFractionDigits: 2 })} m²`

  // Generate complete quotation text
  const quotationText = generateQuotationText(
    userData,
    totalArea,
    areaBreakdownText,
    stage1Costs,
    stage2Costs,
    totalDesignAndLicensingCost,
    costoConstruccion,
    subtotalSinIva,
    ivaAmount,
    totalCost,
    paymentBreakdown,
    responses.linea_materiales || "media",
    materialLineCost,
  )

  const economicProposalJSON = {
    Etapa1: {
      Diseño_Arquitectonico: stage1Costs.disenoArquitectonico,
      Diseño_Estructural: stage1Costs.disenoEstructural,
      Acompañamiento_Licencias: stage1Costs.acompanamiento,
      Subtotal_Etapa_I: stage1Costs.subtotal,
    },
    Etapa2: {
      Diseño_Electrico: stage2Costs.disenoElectrico,
      Diseño_Hidraulico: stage2Costs.disenoHidraulico,
      Presupuesto_Proyecto: stage2Costs.presupuestoObra,
      Subtotal_Etapa_II: stage2Costs.subtotal,
    },
    Total_Diseño_Licencias: totalDesignAndLicensingCost,
    Subtotal_Sin_IVA: subtotalSinIva,
    IVA_19_Porciento: ivaAmount,
    Total_General: totalCost, // Ahora SOLO diseño (Etapa 1 + 2 + IVA)
    Total_General_Texto: convertNumberToSpanishText(totalCost),
    Etapa3_Construccion: {
      Costo: costoConstruccion,
      Linea_Materiales: responses.linea_materiales || "media",
      Costo_Por_M2: materialLineCost,
      Nota: "Valor estimativo, independiente a los costos de diseño",
    },
  }

  console.log("PROPUESTA ECONÓMICA (JSON):", JSON.stringify(economicProposalJSON, null, 2))

  return {
    formato: "pdf",
    area_total: totalArea,
    cotizacionTexto: quotationText,
    areaBreakdown,
    economicProposalJSON,
    // New fields for technical summary in API payload
    areas_basicas_summary: areasBasicasSummary,
    habitacion_principal_summary: habitacionPrincipalSummary,
    habitaciones_adicionales_summary: habitacionesAdicionalesSummary,
    espacios_adicionales_summary: espaciosAdicionalesSummary,
    linea_materiales_summary: lineaMaterialesSummary,
    m2_formatted: m2Formatted,

    // API data fields - now matching Python backend's expected keys (lowercase, snake_case)
    nombre: userData.nombre,
    telefono: userData.telefono,
    correo: userData.correo,
    diseno_arquitectonico: stage1Costs.disenoArquitectonico.toLocaleString("es-CO"),
    diseno_estructural: stage1Costs.disenoEstructural.toLocaleString("es-CO"),
    acompanamiento_licencias: stage1Costs.acompanamiento.toLocaleString("es-CO"),
    subtotal_etapa_1: stage1Costs.subtotal.toLocaleString("es-CO"),
    diseno_electrico: stage2Costs.disenoElectrico.toLocaleString("es-CO"),
    diseno_hidraulico: stage2Costs.disenoHidraulico.toLocaleString("es-CO"),
    presupuesto_proyecto: stage2Costs.presupuestoObra.toLocaleString("es-CO"),
    subtotal_etapa_2: stage2Costs.subtotal.toLocaleString("es-CO"),
    costo: costoConstruccion.toLocaleString("es-CO"),
    subtotal_sin_iva: subtotalSinIva.toLocaleString("es-CO"),
    iva_amount: ivaAmount.toLocaleString("es-CO"),
    total_general: totalCost.toLocaleString("es-CO"),
    total_general_texto: convertNumberToSpanishText(totalCost),
    linea_materiales: responses.linea_materiales || "media",
    fecha: formatDateToSpanish(),
  }
}

const getMaterialLineCost = (lineaMateriales: string): number => {
  return MATERIAL_LINE_COSTS[lineaMateriales as keyof typeof MATERIAL_LINE_COSTS] || MATERIAL_LINE_COSTS.media
}

/**
 * Calculate Stage 1 costs (Architectural, Structural, Licensing)
 */
const calculateStage1Costs = (totalArea: number) => {
  const disenoArquitectonico = totalArea * PRICING_PER_M2.disenoArquitectonico
  const disenoEstructural = totalArea * PRICING_PER_M2.disenoEstructural
  const acompanamiento = totalArea * PRICING_PER_M2.acompanamiento

  return {
    disenoArquitectonico,
    disenoEstructural,
    acompanamiento,
    subtotal: disenoArquitectonico + disenoEstructural + acompanamiento,
  }
}

/**
 * Calculate Stage 2 costs (Electrical, Hydraulic, Budget)
 */
const calculateStage2Costs = (totalArea: number) => {
  const disenoElectrico = totalArea * PRICING_PER_M2.disenoElectrico
  const disenoHidraulico = totalArea * PRICING_PER_M2.disenoHidraulico
  const presupuestoObra = totalArea * PRICING_PER_M2.presupuestoObra

  return {
    disenoElectrico,
    disenoHidraulico,
    presupuestoObra,
    subtotal: disenoElectrico + disenoHidraulico + presupuestoObra,
  }
}

/**
 * Calculate payment breakdown with discount options
 */
const calculatePaymentBreakdown = (totalCost: number) => {
  const firstPayment = totalCost * PAYMENT_STRUCTURE.firstPayment
  const secondPayment = totalCost * PAYMENT_STRUCTURE.secondPayment
  const thirdPayment = totalCost * PAYMENT_STRUCTURE.thirdPayment

  const discountedFirstPayment = firstPayment * (1 - PAYMENT_STRUCTURE.earlyPaymentDiscount)
  const totalWithDiscount = totalCost * (1 - PAYMENT_STRUCTURE.earlyPaymentDiscount)

  return {
    firstPayment,
    secondPayment,
    thirdPayment,
    discountedFirstPayment,
    totalWithDiscount,
  }
}

/**
 * Generate the complete quotation text
 */
const generateQuotationText = (
  userData: UserData,
  totalArea: number,
  areaBreakdownText: string,
  stage1Costs: any,
  stage2Costs: any,
  totalDesignAndLicensingCost: number,
  costoConstruccion: number,
  subtotalSinIva: number,
  ivaAmount: number,
  totalCost: number,
  paymentBreakdown: any,
  lineaMateriales: string,
  materialLineCost: number,
): string => {
  const materialLineDisplay = lineaMateriales.charAt(0).toUpperCase() + lineaMateriales.slice(1)

  return `🎉 COTIZACIÓN COMPLETA GENERADA

👤 Cliente: ${userData.nombre}
📧 Correo: ${userData.correo}
📱 Teléfono: ${userData.telefono}
📅 Fecha: ${formatDateToSpanish()}

🏠 ÁREA TOTAL CONSTRUIDA: ${totalArea.toLocaleString("es-CO", { maximumFractionDigits: 2 })} m²

💵 PROPUESTA ECONÓMICA DISEÑO
• Subtotal (sin IVA): $${subtotalSinIva.toLocaleString("es-CO")}
• IVA (19%): $${ivaAmount.toLocaleString("es-CO")}
• TOTAL: $${totalCost.toLocaleString("es-CO")}

💳 FORMA DE PAGO:
• Primer pago (40%): $${paymentBreakdown.firstPayment.toLocaleString("es-CO")}
• Segundo pago (50%): $${paymentBreakdown.secondPayment.toLocaleString("es-CO")}
• Tercer pago (10%): $${paymentBreakdown.thirdPayment.toLocaleString("es-CO")}

⏱️ DURACIÓN DEL PROYECTO: ${PROJECT_DURATION_DAYS} días calendario (4 meses)

🎯 DESCUENTO ESPECIAL:
Si hace el PRIMER pago en los siguientes 30 días calendario, tendrá un descuento del **10%**.
_____________________________________________________

📋 Inversión de Construcción:
• Línea de materiales: ${materialLineDisplay}
• Costo por m²: $${materialLineCost.toLocaleString("es-CO")}
• Total construcción: ${totalArea.toLocaleString("es-CO", { maximumFractionDigits: 2 })} m² × $${materialLineCost.toLocaleString("es-CO")} = $${costoConstruccion.toLocaleString("es-CO")}

NOTA: Es un valor estimativo y es independiente a los costos de los diseños.`
}

/**
 * Helper to get display name for base areas
 */
const getAreaDisplayName = (key: string): string => {
  const displayNames: { [key: string]: string } = {
    cocina: "Cocina",
    sala: "Sala",
    comedor: "Comedor",
    ropas: "Zona de ropas",
    bano_social: "Baño social",
  }
  return displayNames[key] || key
}

/**
 * Helper to get display name for extra spaces
 */
const getSpaceDisplayName = (key: string): string => {
  const spaceOption = ADDITIONAL_SPACES.find((space) => space.value === key)
  return spaceOption ? spaceOption.text.split(" (")[0] : key
}

/**
 * Generate a concise summary of base areas.
 */
const generateBaseAreasSummary = (areaBreakdown: AreaBreakdown): string => {
  const baseAreaNames = Object.keys(areaBreakdown.baseAreas).map(getAreaDisplayName)
  return baseAreaNames.join(", ")
}

/**
 * Generate a concise summary of the principal room.
 */
const generatePrincipalRoomSummary = (responses: UserResponses): string => {
  let summary = ""

  if (responses.habitacion_principal) {
    const principalRoomOption = MAIN_QUESTIONS[1].options.find((opt) => opt.value === responses.habitacion_principal)
    if (principalRoomOption) {
      summary = `Habitación principal (${principalRoomOption.text.split(" (")[0]})`
    }
  } else {
    summary = "No seleccionada"
  }

  if (responses.linea_materiales) {
    const materialLineCost = getMaterialLineCost(responses.linea_materiales)
    const lineDisplay = responses.linea_materiales.charAt(0).toUpperCase() + responses.linea_materiales.slice(1)
    summary += ` - Línea o gama de "${lineDisplay}: COP $${materialLineCost.toLocaleString("es-CO")}"`
  }

  return summary
}

/**
 * Generate a concise summary of additional bedrooms.
 */
const generateAdditionalRoomsSummary = (responses: UserResponses, additionalRoomsCount: number): string => {
  const roomSummaries: string[] = []
  for (let i = 1; i <= additionalRoomsCount; i++) {
    let roomDetails = `Habitación ${i}`
    if (responses[`habitacion_${i}_cama`]) {
      const bedOption = ROOM_QUESTIONS[0].options.find((opt) => opt.value === responses[`habitacion_${i}_cama`])
      if (bedOption) roomDetails += ` (${bedOption.text.split(" (")[0]})`
    }
    if (responses[`habitacion_${i}_bano`] === "si") {
      roomDetails += " con baño"
    } else {
      roomDetails += " sin baño"
    }
    roomSummaries.push(roomDetails)
  }
  return roomSummaries.length > 0 ? roomSummaries.join(", ") : "Ninguna"
}

/**
 * Generate a concise summary of other additional spaces.
 */
const generateExtraSpacesSummary = (responses: UserResponses): string => {
  if (responses.espacios_adicionales && Array.isArray(responses.espacios_adicionales)) {
    const selectedSpaces = responses.espacios_adicionales.filter((space) => space !== "ninguno")
    if (selectedSpaces.length > 0) {
      const spaceNames = selectedSpaces.map(getSpaceDisplayName)
      return spaceNames.join(", ")
    }
  }
  return "Ninguno"
}

/**
 * Generate a concise summary of material line selection.
 */
const generateMaterialLineSummary = (responses: UserResponses): string => {
  if (responses.linea_materiales) {
    const materialLineCost = getMaterialLineCost(responses.linea_materiales)
    const lineDisplay = responses.linea_materiales.charAt(0).toUpperCase() + responses.linea_materiales.slice(1)
    return `${lineDisplay} ($${materialLineCost.toLocaleString("es-CO")}/m²)`
  }
  return "Media ($2'000.000/m²)"
}