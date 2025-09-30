"use client"



import { useState, useEffect, useRef } from "react"

import { Send, User, Phone, Bot, MessageCircle, ArrowLeft, Check, ExternalLink } from "lucide-react"
import Image from "next/image"



// 1. Definición de tipos para mensajes y respuestas

type OpcionPregunta = {

  letra: string

  text: string

  value: string | number

  area?: number

  action?: string

  data?: any

}



type Mensaje = {

  sender: "user" | "bot"

  text: string

  options?: OpcionPregunta[]

  timestamp: Date

  extraData?: any

}



type Responses = {

  lote?: string

  habitacion_principal?: string

  habitaciones_adicionales?: number

  espacios_adicionales?: string[]

  [key: string]: any

}



interface ChatbotCotizacionProps {

  onBack?: () => void

}



const ChatbotCotizacion = ({ onBack }: ChatbotCotizacionProps) => {

  const [messages, setMessages] = useState<Mensaje[]>([])

  const [currentInput, setCurrentInput] = useState("")

  const [step, setStep] = useState("greeting")

  const [userData, setUserData] = useState({

    nombre: "",

    telefono: "",

    correo: "",

  })

  const [responses, setResponses] = useState<Responses>({})

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const [additionalRooms, setAdditionalRooms] = useState(0)

  const [currentRoomQuestion, setCurrentRoomQuestion] = useState(0)

  const [isGenerating, setIsGenerating] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)

  const [isInitialized, setIsInitialized] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)



  // VALORES FIJOS POR M² (CORREGIDOS SEGÚN EXCEL)

  const valoresPorM2 = {

    disenoArquitectonico: 65141, // $65,141/m²

    disenoEstructural: 33987, // $33,987/m²

    disenoElectrico: 28322, // $28,322/m²

    disenoHidraulico: 25490, // $25,490/m²

    presupuestoObra: 12745, // $12,745/m²

    acompanamiento: 14161, // $14,161/m²

  }



  // 1. Definición de preguntas y opciones según el TXT

  const preguntas = [

    {

      id: "lote",

      text: "¿Tiene lote?",

      options: [

        { letra: "A", text: "Sí", value: "si" },

        { letra: "B", text: "No, estamos en proceso de compra", value: "no_proceso" },

      ],

    },

    {

      id: "habitacion_principal",

      text: "Habitación principal - ¿Qué tipo de cama le gustaría?",

      options: [

        { letra: "A", text: "Sencilla (99x191 cm) - Habitación 4.5x3 = 13.5 m²", value: "sencilla", area: 13.5 },

        { letra: "B", text: "Doble (137x191 cm) - Habitación 4.5x3.5 = 15.75 m²", value: "doble", area: 15.75 },

        { letra: "C", text: "Queen (152x203 cm) - Habitación 4.5x4 = 18 m²", value: "queen", area: 18 },

        { letra: "D", text: "King (193x203 cm) - Habitación 4.5x5.5 = 24.75 m²", value: "king", area: 24.75 },

        {

          letra: "E",

          text: "California King (183x213 cm) - Habitación 4.5x6 = 27 m²",

          value: "california_king",

          area: 27,

        },

        { letra: "F", text: "Habitación 4.5x6.5 = 29.25 m²", value: "f", area: 29.25 },

        { letra: "G", text: "Habitación 4.5x7 = 31.5 m²", value: "g", area: 31.5 },

      ],

    },

    {

      id: "habitaciones_adicionales",

      text: "Además de la habitación principal, ¿cuántas habitaciones adicionales desea?",

      options: [

        { letra: "A", text: "0", value: 0 },

        { letra: "B", text: "1", value: 1 },

        { letra: "C", text: "2", value: 2 },

        { letra: "D", text: "3", value: 3 },

      ],

    },

  ]



  const preguntasHabitacion = [

    {

      id: "tipo_cama",

      text: (num: number) => `Habitación ${num} - ¿Qué tipo de cama le gustaría?`,

      options: [

        { letra: "A", text: "Sencilla (99x191 cm) - Habitación 4.5x3 = 13.5 m²", value: "sencilla", area: 13.5 },

        { letra: "B", text: "Doble (137x191 cm) - Habitación 4.5x3.5 = 15.75 m²", value: "doble", area: 15.75 },

        { letra: "C", text: "Queen (152x203 cm) - Habitación 4.5x4 = 18 m²", value: "queen", area: 18 },

      ],

    },

    {

      id: "bano_propio",

      text: (num: number) => `Habitación ${num} - ¿Tiene baño propio?`,

      options: [

        { letra: "A", text: "Sí (+ 3.5 m²)", value: "si", area: 3.5 },

        { letra: "B", text: "No", value: "no", area: 0 },

      ],

    },

  ]



  // ESPACIOS ADICIONALES (CORREGIDOS)

  const espaciosAdicionales = [

    { letra: "A", text: "Estudio (14 m²)", value: "estudio", area: 14 },

    { letra: "B", text: "Sala de TV (14 m²)", value: "sala_tv", area: 14 },

    { letra: "C", text: "Habitación de servicio + baño (18 m²)", value: "hab_servicio", area: 18 },

    { letra: "D", text: "Depósito pequeño (9 m²)", value: "deposito_pequeno", area: 9 },

    { letra: "E", text: "Depósito mediano (9 m²)", value: "deposito_mediano", area: 9 },

    { letra: "F", text: "Depósito grande (16 m²)", value: "deposito_grande", area: 16 },

    { letra: "G", text: "Sauna (16 m²)", value: "sauna", area: 16 },

    { letra: "H", text: "Turco (24 m²)", value: "turco", area: 24 },

    { letra: "I", text: "Piscina pequeña (16 m²)", value: "piscina_pequena", area: 16 },

    { letra: "J", text: "Piscina mediana (24 m²)", value: "piscina_mediana", area: 24 },

    { letra: "K", text: "Piscina grande (32 m²)", value: "piscina_grande", area: 32 },

    { letra: "L", text: "Baño social exterior (4 m²)", value: "bano_social_ext", area: 4 },

    { letra: "M", text: "Ninguno", value: "ninguno", area: 0 },

  ]



  // Áreas base fijas

  const areasBase = {

    cocina: 11.5,

    sala: 13.5,

    comedor: 18,

    ropas: 8,

    bano_social: 2.5,

  }



  const handleUserInput = () => {

    if (!currentInput.trim()) return



    addMessage("user", currentInput)

    const inputValue = currentInput

    setCurrentInput("")



    if (step === "user_data_name") {

      setUserData((prev) => ({ ...prev, nombre: inputValue }))

      addMessage("bot", "Por favor, dime tu número de teléfono:")

      setStep("user_data_phone")

    } else if (step === "user_data_phone") {

      setUserData((prev) => ({ ...prev, telefono: inputValue }))

      addMessage("bot", "Por favor, dime tu correo electrónico:")

      setStep("user_data_email")

    } else if (step === "user_data_email") {

      setUserData((prev) => ({ ...prev, correo: inputValue }))

      addMessage("bot", "¡Perfecto! Ahora genero tu cotización personalizada...")



      setTimeout(() => {

        const cotizacionData = generateCotizacion()

        addMessage("bot", cotizacionData.cotizacionTexto)

        addMessage("bot", "¿Te gustaría descargar el documento oficial de cotización?", [

          {

            letra: "A",

            text: "📄 Sí, descargar documento PDF",

            value: "descargar",

            action: "download",

            data: cotizacionData,

          },

          { letra: "B", text: "📋 Solo conservar resumen", value: "resumen", action: "summary" },

        ])

        setStep("final")

      }, 1000)

    }

  }



  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

  }, [messages])



  useEffect(() => {

    // Solo agregar mensajes si no hay mensajes previos y estamos en greeting

    if (!isInitialized && step === "greeting") {

      // Marcar como inicializado inmediatamente para evitar re-ejecución

      setIsInitialized(true)

      

      addMessage(

        "bot",

        "¡Hola! 👋 Soy tu asistente virtual de SAAVE Arquitectos y estoy aquí para ayudarte a obtener una cotización detallada de tu proyecto arquitectónico.\n\n🏗️ **¿Qué vamos a hacer?**\n• Recopilaré información sobre tu proyecto\n• Calcularé las áreas y espacios necesarios\n• Te proporcionaré un presupuesto detallado\n• Generaré un documento profesional con tu cotización\n\nComencemos con las preguntas técnicas sobre tu proyecto:",

      )

      addMessage("bot", preguntas[0].text, preguntas[0].options)

      setStep("questions")

      setCurrentQuestion(0)

    }

  }, [isInitialized, step])



  const addMessage = (

    sender: "user" | "bot",

    text: string,

    options: OpcionPregunta[] | null = null,

    extraData: any = null,

  ) => {

    setMessages((prev) => {

      const lastMessage = prev[prev.length - 1]

      if (lastMessage && lastMessage.sender === sender && lastMessage.text === text) {

        return prev

      }

      return [...prev, { sender, text, options: options ?? undefined, timestamp: new Date(), extraData }]

    })

  }



  // Type guard para acceso a area

  const getArea = (op: any) => (typeof op === "object" && "area" in op ? op.area || 0 : 0)



  const calculateTotalArea = () => {

    let totalArea = 0

    // Áreas base

    totalArea += Object.values(areasBase).reduce((sum, area) => sum + area, 0)



    // Habitación principal

    if (responses.habitacion_principal) {

      const option = preguntas[1].options.find((opt) => opt.value === responses.habitacion_principal)

      totalArea += getArea(option)

    }



    // Habitaciones adicionales

    for (let i = 1; i <= additionalRooms; i++) {

      if (responses[`habitacion_${i}_cama`]) {

        const option = preguntasHabitacion[0].options.find((opt) => opt.value === responses[`habitacion_${i}_cama`])

        totalArea += getArea(option)

      }

      if (responses[`habitacion_${i}_bano`]) {

        const option = preguntasHabitacion[1].options.find((opt) => opt.value === responses[`habitacion_${i}_bano`])

        totalArea += getArea(option)

      }

    }



    // Espacios adicionales

    if (responses.espacios_adicionales && Array.isArray(responses.espacios_adicionales)) {

      responses.espacios_adicionales.forEach((espacio) => {

        const option = espaciosAdicionales.find((opt) => opt.value === espacio)

        totalArea += getArea(option)

      })

    }



    return totalArea

  }



  const formatearFechaCompleta = () => {

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



  // Función para convertir número a texto

  const numeroATexto = (numero: number): string => {

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



    // Millones

    if (numero >= 1000000) {

      const millones = Math.floor(numero / 1000000)

      if (millones === 1) {

        texto += "UN MILLÓN "

      } else {

        texto += convertirCientos(millones) + " MILLONES "

      }

      numero %= 1000000

    }



    // Miles

    if (numero >= 1000) {

      const miles = Math.floor(numero / 1000)

      if (miles === 1) {

        texto += "MIL "

      } else {

        texto += convertirCientos(miles) + " MIL "

      }

      numero %= 1000

    }



    // Centenas, decenas y unidades

    if (numero > 0) {

      texto += convertirCientos(numero)

    }



    return texto.trim() + " PESOS M/CTE"



    function convertirCientos(num: number): string {

      if (num === 0) return ""



      let resultado = ""



      if (num >= 100) {

        if (num === 100) {

          resultado += "CIEN "

        } else {

          resultado += centenas[Math.floor(num / 100)] + " "

        }

        num %= 100

      }



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



  // NUEVA FUNCIÓN DE COTIZACIÓN (SIMPLIFICADA Y CORRECTA)

  const generateCotizacion = () => {

    const totalArea = calculateTotalArea()



    // ETAPA 1

    const disenoArquitectonico = totalArea * valoresPorM2.disenoArquitectonico

    const disenoEstructural = totalArea * valoresPorM2.disenoEstructural

    const acompanamiento = totalArea * valoresPorM2.acompanamiento

    const subtotal1 = disenoArquitectonico + disenoEstructural + acompanamiento



    // ETAPA 2

    const disenoElectrico = totalArea * valoresPorM2.disenoElectrico

    const disenoHidraulico = totalArea * valoresPorM2.disenoHidraulico

    const presupuestoObra = totalArea * valoresPorM2.presupuestoObra

    const subtotal2 = disenoElectrico + disenoHidraulico + presupuestoObra



    const total = subtotal1 + subtotal2



    // TEXTO DE COTIZACIÓN CON FORMATO MEJORADO

    const cotizacionTexto = `🎉 COTIZACIÓN COMPLETA GENERADA



👤 Cliente: ${userData.nombre}

📧 Correo: ${userData.correo}

📱 Teléfono: ${userData.telefono}

📅 Fecha: ${formatearFechaCompleta()}



🏠 ÁREA TOTAL CONSTRUIDA: ${totalArea} m²



💰 PROPUESTA ECONÓMICA



📋 Etapa 1:

• Diseño Arquitectónico: ${totalArea} m² × ${valoresPorM2.disenoArquitectonico.toLocaleString("es-CO")} = ${disenoArquitectonico.toLocaleString("es-CO")}

• Diseño Estructural: ${totalArea} m² × ${valoresPorM2.disenoEstructural.toLocaleString("es-CO")} = ${disenoEstructural.toLocaleString("es-CO")}

• Acompañamiento Licencias: ${totalArea} m² × ${valoresPorM2.acompanamiento.toLocaleString("es-CO")} = ${acompanamiento.toLocaleString("es-CO")}



📍 SUBTOTAL I: ${subtotal1.toLocaleString("es-CO")}



📋 Etapa 2:

• Diseño Eléctrico: ${totalArea} m² × ${valoresPorM2.disenoElectrico.toLocaleString("es-CO")} = ${disenoElectrico.toLocaleString("es-CO")}

• Diseño Hidráulico: ${totalArea} m² × ${valoresPorM2.disenoHidraulico.toLocaleString("es-CO")} = ${disenoHidraulico.toLocaleString("es-CO")}

• Presupuesto del Proyecto: ${totalArea} m² × ${valoresPorM2.presupuestoObra.toLocaleString("es-CO")} = ${presupuestoObra.toLocaleString("es-CO")}



📍 SUBTOTAL II: ${subtotal2.toLocaleString("es-CO")}



🏆 TOTAL GENERAL: ${total.toLocaleString("es-CO")}



💵 ${numeroATexto(total)}



✅ Incluye IVA



💳 FORMA DE PAGO:

• Primer pago (40%): ${(total * 0.4).toLocaleString("es-CO")}

• Segundo pago (50%): ${(total * 0.5).toLocaleString("es-CO")}

• Tercer pago (10%): ${(total * 0.1).toLocaleString("es-CO")}



🎯 DESCUENTO ESPECIAL:

Si pagas el primer pago en los próximos 30 días calendario, obtienes un 10% de descuento.



💰 Primer pago con descuento: ${(total * 0.4 * 0.9).toLocaleString("es-CO")}

🏆 Total con descuento: ${(total * 0.9).toLocaleString("es-CO")}



⏱️ DURACIÓN DEL PROYECTO: 120 días calendario (4 meses)`



    return {

      formato: "pdf",

      area_total: totalArea,

      cotizacionTexto: cotizacionTexto,

      // Datos para el API

      Diseño_Ar: `$ ${disenoArquitectonico.toLocaleString("es-CO")}`,

      Diseño_Calcu: `$ ${disenoEstructural.toLocaleString("es-CO")}`,

      Acompañamie: `$ ${acompanamiento.toLocaleString("es-CO")}`,

      Subtotal_1: `$ ${subtotal1.toLocaleString("es-CO")}`,

      Diseño_Electrico: `$ ${disenoElectrico.toLocaleString("es-CO")}`,

      Diseño_Hidraulico: `$ ${disenoHidraulico.toLocaleString("es-CO")}`,

      Presupuesta: `$ ${presupuestoObra.toLocaleString("es-CO")}`,

      Subtotal_2: `$ ${subtotal2.toLocaleString("es-CO")}`,

      Total: `$ ${total.toLocaleString("es-CO")}`,

      fecha: formatearFechaCompleta(),

      nombre: userData.nombre,

      correo: userData.correo,

      telefono: userData.telefono,

      texto: numeroATexto(total),

    }

  }



  const sendToAPI = async (cotizacionData: any) => {

    try {

      setIsGenerating(true)

      console.log("Enviando datos a nueva API:", cotizacionData)



      const response = await fetch("https://service-pdf.onrender.com/generar-documento", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(cotizacionData),

      })



      if (!response.ok) {

        const error = await response.json()

        throw new Error(error.error || "Error al generar el documento")

      }



      const blob = await response.blob()

      const contentDisposition = response.headers.get("Content-Disposition")

      let filename = "cotizacion_" + cotizacionData.nombre.replace(/\s+/g, "_") + ".pdf"



      if (contentDisposition) {

        const match = contentDisposition.match(/filename="?([^";]+)"?/)

        if (match) filename = match[1]

      }



      // Crear y descargar el archivo

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")

      a.href = url

      a.download = filename

      document.body.appendChild(a)

      a.click()

      document.body.removeChild(a)

      window.URL.revokeObjectURL(url)



      // Mostrar animación de éxito

      setIsGenerating(false)

      setShowSuccess(true)



      // Ocultar animación de éxito después de 3 segundos

      setTimeout(() => {

        setShowSuccess(false)

        addMessage("bot", "✅ ¡Perfecto! Tu cotización en PDF ha sido generada y descargada exitosamente.")

      }, 3000)

    } catch (error: any) {

      console.error("Error completo:", error)

      setIsGenerating(false)

      addMessage("bot", `❌ Error al generar el documento: ${error.message}`)

    }

  }



  const handleOptionClick = (option: OpcionPregunta) => {

    addMessage("user", option.text)



    if (step === "questions") {

      if (currentQuestion === 0) {

        setResponses((prev) => ({ ...prev, lote: option.value as string }))

        addMessage("bot", preguntas[1].text, preguntas[1].options)

        setCurrentQuestion(1)

      } else if (currentQuestion === 1) {

        setResponses((prev) => ({ ...prev, habitacion_principal: option.value as string }))

        addMessage("bot", preguntas[2].text, preguntas[2].options)

        setCurrentQuestion(2)

      } else if (currentQuestion === 2) {

        setAdditionalRooms(Number(option.value))

        setResponses((prev) => ({ ...prev, habitaciones_adicionales: Number(option.value) }))



        if (Number(option.value) > 0) {

          addMessage("bot", preguntasHabitacion[0].text(1), preguntasHabitacion[0].options)

          setStep("room_questions")

          setCurrentRoomQuestion(0)

        } else {

          // Ir directamente a espacios adicionales

          addMessage(

            "bot",

            "Ahora vamos a personalizar tu vivienda con espacios adicionales. Estos espacios complementarán las áreas básicas (cocina, sala, comedor, zona de ropas y baño social).",

            espaciosAdicionales.slice(0, -1).concat([

              {

                letra: "M",

                text: "Ninguno - Solo espacios básicos",

                value: "ninguno",

                area: 0,

              },

            ]),

          )

          setStep("espacios_selection")

        }

      }

    } else if (step === "room_questions") {

      const roomNum = Math.floor(currentRoomQuestion / 2) + 1

      const questionType = currentRoomQuestion % 2



      if (questionType === 0) {

        setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_cama`]: option.value }))

        addMessage("bot", preguntasHabitacion[1].text(roomNum), preguntasHabitacion[1].options)

        setCurrentRoomQuestion((prev) => prev + 1)

      } else {

        setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_bano`]: option.value }))



        if (roomNum < additionalRooms) {

          addMessage("bot", preguntasHabitacion[0].text(roomNum + 1), preguntasHabitacion[0].options)

          setCurrentRoomQuestion((prev) => prev + 1)

        } else {

          // Si completó todas las habitaciones adicionales, ir a espacios adicionales

          addMessage(

            "bot",

            "Ahora vamos a personalizar tu vivienda con espacios adicionales. Estos espacios complementarán las áreas básicas (cocina, sala, comedor, zona de ropas y baño social).",

            espaciosAdicionales.slice(0, -1).concat([

              {

                letra: "M",

                text: "Ninguno - Solo espacios básicos",

                value: "ninguno",

                area: 0,

              },

            ]),

          )

          setStep("espacios_selection")

        }

      }

    } else if (step === "espacios_selection") {

      // Verificar si se seleccionó "terminar"

      if (option.value === "terminar") {

        addMessage("bot", "Perfecto, continuemos.")

        addMessage(

          "bot",

          "¡Excelente! Has completado la configuración de tu proyecto. Ahora necesito algunos datos para personalizar tu cotización.",

        )

        addMessage("bot", "Por favor, dime tu nombre completo:")

        setStep("user_data_name")

        return

      }



      // Manejar selección múltiple de espacios

      if (option.value === "ninguno") {

        setResponses((prev) => ({ ...prev, espacios_adicionales: [] }))

        addMessage("bot", "Perfecto, tu proyecto incluirá solo los espacios básicos.")

        addMessage(

          "bot",

          "¡Excelente! Has completado la configuración de tu proyecto. Ahora necesito algunos datos para personalizar tu cotización.",

        )

        addMessage("bot", "Por favor, dime tu nombre completo:")

        setStep("user_data_name")

      } else {

        // Agregar espacio seleccionado

        setResponses((prev) => {

          const espaciosActuales = prev.espacios_adicionales || []

          if (!espaciosActuales.includes(option.value as string)) {

            return { ...prev, espacios_adicionales: [...espaciosActuales, option.value as string] }

          }

          return prev

        })



        addMessage("bot", `Agregado: ${option.text}`)



        // Mostrar espacios restantes (excluyendo los ya seleccionados)

        const espaciosSeleccionados = [...(responses.espacios_adicionales || []), option.value as string]

        const espaciosRestantes = espaciosAdicionales.filter(

          (espacio) => !espaciosSeleccionados.includes(espacio.value) && espacio.value !== "ninguno",

        )



        if (espaciosRestantes.length > 0) {

          // Agregar opción para terminar

          const opcionesConTerminar = espaciosRestantes.concat([

            {

              letra: "Z",

              text: "✅ Ya no quiero más espacios - Continuar",

              value: "terminar",

              area: 0,

            },

          ])



          addMessage("bot", "¿Deseas agregar otro espacio adicional?", opcionesConTerminar)

          // Mantener en el mismo step para manejar tanto selección como terminar

        } else {

          // No hay más espacios, pedir datos del usuario

          addMessage(

            "bot",

            "¡Excelente! Has completado la configuración de tu proyecto. Ahora necesito algunos datos para personalizar tu cotización.",

          )

          addMessage("bot", "Por favor, dime tu nombre completo:")

          setStep("user_data_name")

        }

      }

    } else if (step === "final") {

      if (option.action === "download") {

        sendToAPI(option.data)

      } else {

        addMessage(

          "bot",

          "¡Gracias por usar nuestro sistema de cotización! Tu resumen queda guardado en esta conversación. Si necesitas el documento oficial más tarde, puedes contactarnos directamente.",

        )

      }

    }

  }



  const getInputIcon = () => {

    switch (step) {

      case "user_data_name":

        return <User className="w-4 h-4" />

      case "user_data_phone":

        return <Phone className="w-4 h-4" />

      case "user_data_email":

        return <MessageCircle className="w-4 h-4" />

      default:

        return <MessageCircle className="w-4 h-4" />

    }

  }



  const getInputPlaceholder = () => {

    switch (step) {

      case "user_data_name":

        return "Escribe tu nombre completo..."

      case "user_data_phone":

        return "Escribe tu número de teléfono..."

      case "user_data_email":

        return "Escribe tu correo electrónico..."

      default:

        return "Escribe tu mensaje..."

    }

  }



  return (

    <div

      className="flex flex-col h-screen bg-white relative"

      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}

    >

      {/* Overlay de Carga */}

      {isGenerating && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">

            <div className="mb-6">

              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>

            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generando tu cotización</h3>

            <p className="text-gray-600 text-sm">Estamos creando tu documento PDF personalizado...</p>

            <div className="mt-4 flex justify-center space-x-1">

              <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>

              <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>

              <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>

            </div>

          </div>

        </div>

      )}



      {/* Overlay de Éxito */}

      {showSuccess && (

        <div className="fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50">

          <div className="text-center text-white">

            <div className="mb-6">

              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto animate-pulse">

                <Check className="w-12 h-12 text-green-500 animate-bounce" />

              </div>

            </div>

            <h2 className="text-3xl font-bold mb-4">¡Descarga Exitosa!</h2>

            <p className="text-xl">Tu cotización PDF ha sido generada correctamente</p>

            <div className="mt-6 flex justify-center">

              <div className="flex space-x-2">

                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>

                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>

                <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Header */}

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="h-20 flex items-center justify-center">
            <div className="flex items-center gap-4 md:gap-5 px-4 md:px-5 py-2 bg-gradient-to-b from-white/50 to-gray-100/40 hover:from-white/60 hover:to-gray-100/50 backdrop-blur-2xl rounded-full shadow-xl ring-1 ring-gray-300/40 transition-colors">
              <div className="hidden sm:flex items-center gap-2 pr-4 mr-2 border-r border-gray-300/40">
                <Image src="/logo-2.png" alt="SAAVE Arquitectos" width={170} height={36} className="h-11 w-auto" />
              </div>
              <a
                href="https://www.saavearquitectos.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm md:text-base font-medium text-gray-900 bg-white/50 hover:bg-white/70 transition-colors shadow-sm ring-1 ring-gray-300/40"
              >
                Visítanos
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>



      {/* Messages Area */}

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

        <div className="max-w-4xl mx-auto space-y-4">

          {messages.map((message, index) => (

            <div key={index} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>

              {message.sender === "bot" && (

                <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">

                  <Bot className="w-4 h-4 text-white" />

                </div>

              )}

              <div className={`max-w-lg ${message.sender === "user" ? "order-first" : ""}`}>

                <div

                  className={`px-4 py-3 rounded-2xl ${

                    message.sender === "user"

                      ? "bg-black text-white rounded-br-md"

                      : "bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-md"

                  }`}

                >

                  <div className="whitespace-pre-line text-sm leading-relaxed">{message.text}</div>

                  {message.options && (

                    <div className="mt-3 space-y-2">

                      {message.options.map((option, optIndex) => (

                        <button

                          key={optIndex}

                          onClick={() => handleOptionClick(option)}

                          className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:text-black"

                        >

                          {option.text}

                        </button>

                      ))}

                    </div>

                  )}

                </div>

                <div className={`text-xs text-gray-500 mt-1 ${message.sender === "user" ? "text-right" : "text-left"}`}>

                  {message.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}

                </div>

              </div>

              {message.sender === "user" && (

                <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">

                  <User className="w-4 h-4 text-white" />

                </div>

              )}

            </div>

          ))}

          <div ref={messagesEndRef} />

        </div>

      </div>



      {/* Input Area */}

      {(step === "user_data_name" || step === "user_data_phone" || step === "user_data_email") && (

        <div className="bg-white border-t border-gray-200 p-4">

          <div className="max-w-4xl mx-auto">

            <div className="flex gap-3 items-end">

              <div className="flex-1 relative">

                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{getInputIcon()}</div>

                <input

                  type={step === "user_data_email" ? "email" : "text"}

                  value={currentInput}

                  onChange={(e) => setCurrentInput(e.target.value)}

                  onKeyPress={(e) => e.key === "Enter" && handleUserInput()}

                  placeholder={getInputPlaceholder()}

                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all duration-200"

                />

              </div>

              <button

                onClick={handleUserInput}

                disabled={!currentInput.trim()}

                className="w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:hover:shadow-lg"

              >

                <Send className="w-5 h-5" />

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}
export default ChatbotCotizacion;