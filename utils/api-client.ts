import { supabase } from "./supabase"

const SUPABASE_TABLE = process.env.NEXT_PUBLIC_SUPABASE_TABLE || "cotizaciones"

function mapToSupabaseRow(quotationData: any) {
  const userData = quotationData?.userData || {}
  // Soporta estructura con economicProposal o directamente en raíz
  const econSource = quotationData?.economicProposal || quotationData || {}
  const etapa1 = econSource?.Etapa1 || {}
  const etapa2 = econSource?.Etapa2 || {}
  const etapa3 = econSource?.Etapa3_Construccion || {}

  // Compat: algunos proyectos pueden tener nombre/telefono/correo al nivel raíz
  const nombre = userData.nombre || quotationData?.nombre || null
  const telefono = userData.telefono || quotationData?.telefono || null
  const correo = userData.correo || quotationData?.correo || null

  return {
    nombre,
    telefono,
    correo,
    diseno_arquitectonico: etapa1["Diseño_Arquitectonico"] ?? null,
    diseno_estructural: etapa1["Diseño_Estructural"] ?? null,
    acompanamiento_licencias: etapa1["Acompañamiento_Licencias"] ?? null,
    subtotal_etapa_1: etapa1["Subtotal_Etapa_I"] ?? null,
    diseno_electrico: etapa2["Diseño_Electrico"] ?? null,
    diseno_hidraulico: etapa2["Diseño_Hidraulico"] ?? null,
    presupuesto_proyecto: etapa2["Presupuesto_Proyecto"] ?? null,
    subtotal_etapa_2: etapa2["Subtotal_Etapa_II"] ?? null,
    total_diseno_licencias: econSource["Total_Diseño_Licencias"] ?? null,
    subtotal_sin_iva: econSource["Subtotal_Sin_IVA"] ?? null,
    iva_19_porcentaje: econSource["IVA_19_Porciento"] ?? null,
    total_general: econSource["Total_General"] ?? null,
    total_general_texto: econSource["Total_General_Texto"] ?? null,
    costo_construccion: etapa3["Costo"] ?? null,
    linea_materiales: etapa3["Linea_Materiales"] ?? null,
    costo_por_m2: etapa3["Costo_Por_M2"] ?? null,
    nota: etapa3["Nota"] ?? null,
    timestamp: quotationData?.timestamp || new Date().toISOString(),
  }
}

function buildSupabasePayload(quotationData: any) {
  // Usar la estructura real del JSON que llega
  const econJSON = quotationData?.economicProposalJSON || {}
  const etapa3 = econJSON?.Etapa3_Construccion || {}

  // Extraer valores numéricos de strings con formato
  const parseAmount = (value: any) => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) || null
    }
    return value || null
  }

  const payload = {
    nombre: quotationData?.nombre || null,
    telefono: quotationData?.telefono || null,
    correo: quotationData?.correo || null,
    fecha: quotationData?.fecha || new Date().toISOString(),
    area_total: quotationData?.area_total || null,
    subtotal_sin_iva: parseAmount(quotationData?.subtotal_sin_iva) || econJSON?.Subtotal_Sin_IVA || null,
    iva_amount: parseAmount(quotationData?.iva_amount) || econJSON?.IVA_19_Porciento || null,
    total_general: parseAmount(quotationData?.total_general) || econJSON?.Total_General || null,
    costo_por_m2: etapa3?.Costo_Por_M2 || null,
    costo_construccion: etapa3?.Costo || null,
    created_at: new Date().toISOString()
  }

  return payload
}

export const generatePDFDocument = async (quotationData: any): Promise<void> => {
  const response = await fetch("https://service-pdf.onrender.com/generar-documento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotationData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al generar el documento")
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get("Content-Disposition")
  let filename = "cotizacion_" + quotationData.nombre.replace(/\s+/g, "_") + ".pdf"

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/)
    if (match) filename = match[1]
  }

  // Create and download the file
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)

  // Guardar en Supabase DESPUÉS de descargar el PDF (no bloquea la UX)
  ;(async () => {
    try {
      console.log("Guardando datos en Supabase...")
      const payload = buildSupabasePayload(quotationData)
      console.log("Payload a Supabase:", JSON.stringify(payload))
      const { error } = await supabase.from(SUPABASE_TABLE).insert([payload])
      if (error) {
        console.error("Error al guardar en Supabase:", error)
      } else {
        console.log("Datos guardados en Supabase correctamente.")
      }
    } catch (e) {
      console.error("Excepción al guardar en Supabase:", e)
    }
  })()
}
