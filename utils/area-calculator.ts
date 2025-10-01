import { BASE_AREAS } from "@/constants/pricing"
import { MAIN_QUESTIONS, ROOM_QUESTIONS, ADDITIONAL_SPACES } from "@/constants/questions"
import type { UserResponses, AreaBreakdown } from "@/types/chatbot"

/**
 * Type guard to safely access area property from options
 */
export const getAreaFromOption = (option: any): number => {
  return typeof option === "object" && "area" in option ? option.area || 0 : 0
}

/**
 * Calculate the total constructed area with detailed breakdown
 */
export const calculateAreaBreakdown = (responses: UserResponses, additionalRooms: number): AreaBreakdown => {
  const breakdown: AreaBreakdown = {
    baseAreas: { ...BASE_AREAS },
    principalRoom: 0,
    additionalRooms: {},
    extraSpaces: {},
    total: 0,
  }

  // Calculate base areas total
  const baseTotal = Object.values(BASE_AREAS).reduce((sum, area) => sum + area, 0)

  // Calculate principal room area
  if (responses.habitacion_principal) {
    const principalRoomOption = MAIN_QUESTIONS[1].options.find((opt) => opt.value === responses.habitacion_principal)
    breakdown.principalRoom = getAreaFromOption(principalRoomOption)
  }

  // Calculate additional rooms areas
  let additionalRoomsTotal = 0
  for (let i = 1; i <= additionalRooms; i++) {
    let roomTotal = 0

    // Room bed area
    if (responses[`habitacion_${i}_cama`]) {
      const bedOption = ROOM_QUESTIONS[0].options.find((opt) => opt.value === responses[`habitacion_${i}_cama`])
      const bedArea = getAreaFromOption(bedOption)
      roomTotal += bedArea
    }

    // Room bathroom area
    if (responses[`habitacion_${i}_bano`] === "si") {
      const bathroomOption = ROOM_QUESTIONS[1].options.find((opt) => opt.value === "si")
      const bathroomArea = getAreaFromOption(bathroomOption)
      roomTotal += bathroomArea
    }

    if (roomTotal > 0) {
      breakdown.additionalRooms[`habitacion_${i}`] = roomTotal
      additionalRoomsTotal += roomTotal
    }
  }

  // Calculate extra spaces areas
  let extraSpacesTotal = 0
  if (responses.espacios_adicionales && Array.isArray(responses.espacios_adicionales)) {
    responses.espacios_adicionales.forEach((spaceValue) => {
      const spaceOption = ADDITIONAL_SPACES.find((opt) => opt.value === spaceValue)
      if (spaceOption && spaceOption.value !== "ninguno") {
        const spaceArea = getAreaFromOption(spaceOption)
        breakdown.extraSpaces[spaceValue] = spaceArea
        extraSpacesTotal += spaceArea
      }
    })
  }

  // Calculate total
  breakdown.total = baseTotal + breakdown.principalRoom + additionalRoomsTotal + extraSpacesTotal

  return breakdown
}

/**
 * Generate a detailed text breakdown of the area calculation
 */
export const generateAreaBreakdownText = (breakdown: AreaBreakdown): string => {
  let text = "📐 DESGLOSE DETALLADO DEL ÁREA CONSTRUIDA\n\n"

  // Base areas section
  text += "🏠 ÁREAS BÁSICAS (incluidas en todos los proyectos):\n"
  Object.entries(breakdown.baseAreas).forEach(([key, area]) => {
    const displayName = getAreaDisplayName(key)
    text += `• ${displayName}: ${area} m²\n`
  })
  const baseTotal = Object.values(breakdown.baseAreas).reduce((sum, area) => sum + area, 0)
  text += `📍 Subtotal áreas básicas: ${baseTotal} m²\n\n`

  // Principal room section
  if (breakdown.principalRoom > 0) {
    text += "🛏️ HABITACIÓN PRINCIPAL:\n"
    text += `• Habitación principal: ${breakdown.principalRoom} m²\n`
    text += `📍 Subtotal habitación principal: ${breakdown.principalRoom} m²\n\n`
  }

  // Additional rooms section
  if (Object.keys(breakdown.additionalRooms).length > 0) {
    text += "🏠 HABITACIONES ADICIONALES:\n"
    let additionalRoomsTotal = 0
    Object.entries(breakdown.additionalRooms).forEach(([roomKey, area]) => {
      const roomNumber = roomKey.replace("habitacion_", "")
      text += `• Habitación ${roomNumber} (incluye baño si aplica): ${area} m²\n`
      additionalRoomsTotal += area
    })
    text += `📍 Subtotal habitaciones adicionales: ${additionalRoomsTotal} m²\n\n`
  }

  // Extra spaces section
  if (Object.keys(breakdown.extraSpaces).length > 0) {
    text += "✨ ESPACIOS ADICIONALES:\n"
    let extraSpacesTotal = 0
    Object.entries(breakdown.extraSpaces).forEach(([spaceKey, area]) => {
      const displayName = getSpaceDisplayName(spaceKey)
      text += `• ${displayName}: ${area} m²\n`
      extraSpacesTotal += area
    })
    text += `📍 Subtotal espacios adicionales: ${extraSpacesTotal} m²\n\n`
  }

  // Concise Total calculation
  const equationParts = []
  if (baseTotal > 0) equationParts.push(baseTotal)
  if (breakdown.principalRoom > 0) equationParts.push(breakdown.principalRoom)
  const additionalRoomsSum = Object.values(breakdown.additionalRooms).reduce((sum, area) => sum + area, 0)
  if (additionalRoomsSum > 0) equationParts.push(additionalRoomsSum)
  const extraSpacesSum = Object.values(breakdown.extraSpaces).reduce((sum, area) => sum + area, 0)
  if (extraSpacesSum > 0) equationParts.push(extraSpacesSum)

  const equationString = equationParts.join(" + ")

  text += `🏆 CÁLCULO TOTAL: ${equationString} = ${breakdown.total} m²\n\n`

  return text
}

/**
 * Get display name for base areas
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
 * Get display name for extra spaces
 */
const getSpaceDisplayName = (key: string): string => {
  const spaceOption = ADDITIONAL_SPACES.find((space) => space.value === key)
  return spaceOption ? spaceOption.text.split(" (")[0] : key
}
