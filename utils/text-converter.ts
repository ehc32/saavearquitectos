export const convertNumberToSpanishText = (numero: number): string => {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"]
  const decenas = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"]
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ]

  if (numero === 0) return "CERO"
  if (numero >= 1000000000) return "MÁS DE MIL MILLONES"

  let texto = ""

  // Process millions
  if (numero >= 1000000) {
    const millones = Math.floor(numero / 1000000)
    if (millones === 1) {
      texto += "UN MILLÓN "
    } else {
      texto += convertHundreds(millones) + " MILLONES "
    }
    numero %= 1000000
  }

  // Process thousands
  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000)
    if (miles === 1) {
      texto += "MIL "
    } else {
      texto += convertHundreds(miles) + " MIL "
    }
    numero %= 1000
  }

  // Process hundreds, tens, and units
  if (numero > 0) {
    texto += convertHundreds(numero)
  }

  return texto.trim() + " PESOS M/CTE"

  /**
   * Convert numbers less than 1000 to text
   */
  function convertHundreds(num: number): string {
    if (num === 0) return ""

    let resultado = ""

    // Process hundreds
    if (num >= 100) {
      if (num === 100) {
        resultado += "CIEN "
      } else {
        resultado += centenas[Math.floor(num / 100)] + " "
      }
      num %= 100
    }

    // Process tens and units
    if (num >= 20) {
      resultado += decenas[Math.floor(num / 10)]
      if (num % 10 > 0) {
        resultado += " Y " + unidades[num % 10]
      }
    } else if (num >= 10) {
      const especiales = [
        "DIEZ",
        "ONCE",
        "DOCE",
        "TRECE",
        "CATORCE",
        "QUINCE",
        "DIECISÉIS",
        "DIECISIETE",
        "DIECIOCHO",
        "DIECINUEVE",
      ]
      resultado += especiales[num - 10]
    } else if (num > 0) {
      resultado += unidades[num]
    }

    return resultado.trim()
  }
}

/**
 * Format date to Spanish format
 */
export const formatDateToSpanish = (): string => {
  const fecha = new Date()
  const dia = fecha.getDate().toString().padStart(2, "0")
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]
  const mes = meses[fecha.getMonth()]
  const año = fecha.getFullYear()
  return `Neiva, ${dia} de ${mes} de ${año}`
}
