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
}
