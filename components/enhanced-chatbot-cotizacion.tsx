"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Phone, Bot, MessageCircle, ArrowLeft, Check, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Import types and constants
import type { ChatMessage, QuestionOption, UserData, UserResponses, ChatbotProps } from "@/types/chatbot"
import { MAIN_QUESTIONS, ROOM_QUESTIONS, ADDITIONAL_SPACES, MATERIAL_LINE_QUESTION } from "@/constants/questions"

// Import utilities
import { generateCompleteQuotation } from "@/utils/quotation-generator"
import { generatePDFDocument } from "@/utils/api-client"
import { saveQuotationDataToLocalStorage, clearQuotationDataFromLocalStorage } from "@/utils/storage"

/**
 * Enhanced Chatbot Component for Architectural Quotations
 */
const EnhancedChatbotCotizacion = ({ onBack }: ChatbotProps) => {
  // ==================== STATE MANAGEMENT ====================

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [step, setStep] = useState("greeting")

  // User data state
  const [userData, setUserData] = useState<UserData>({
    nombre: "",
    telefono: "",
    correo: "",
  })

  // Project configuration state
  const [responses, setResponses] = useState<UserResponses>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [additionalRooms, setAdditionalRooms] = useState(0)
  const [currentRoomQuestion, setCurrentRoomQuestion] = useState(0)

  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false) // Use ref instead of state

  // ==================== INITIALIZATION ====================

  /**
   * Initialize chatbot with greeting message and first question
   */
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      
      addMessage(
        "bot",
        "¡Hola! 👋 Soy tu asistente virtual de SAAVE Arquitectos y estoy aquí para ayudarte a obtener una cotización detallada de tu proyecto arquitectónico.\n\n🏗️ ¿Qué vamos a hacer?\n• Recopilaré información sobre tu proyecto\n• Calcularé las áreas y espacios necesarios\n• Te proporcionaré un presupuesto detallado con desglose completo\n• Generaré un documento profesional con tu cotización\n\nComencemos con las preguntas técnicas sobre tu proyecto:",
      )
      addMessage("bot", MAIN_QUESTIONS[0].text, MAIN_QUESTIONS[0].options)
      setStep("questions")
      setCurrentQuestion(0)
    }
  }, []) // Empty dependency array - only runs once

  /**
   * Auto-scroll to latest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Add a new message to the chat
   */
  const addMessage = (
    sender: "user" | "bot",
    text: string,
    options: QuestionOption[] | null = null,
    extraData: any = null,
  ) => {
    setMessages((prev) => [
      ...prev,
      { sender, text, options: options ?? undefined, timestamp: new Date(), extraData }
    ])
  }

  // ==================== USER INPUT HANDLING ====================

  /**
   * Handle text input from user (for name, phone, email)
   */
  const handleUserInput = () => {
    if (!currentInput.trim()) return

    addMessage("user", currentInput)
    const inputValue = currentInput
    setCurrentInput("")

    switch (step) {
      case "user_data_name":
        setUserData((prev) => ({ ...prev, nombre: inputValue }))
        addMessage("bot", "Por favor, dime tu número de teléfono:")
        setStep("user_data_phone")
        break

      case "user_data_phone":
        setUserData((prev) => ({ ...prev, telefono: inputValue }))
        addMessage("bot", "Por favor, dime tu correo electrónico:")
        setStep("user_data_email")
        break

      case "user_data_email":
        setUserData((prev) => ({ ...prev, correo: inputValue }))
        addMessage("bot", "¡Perfecto! Ahora genero tu cotización personalizada con desglose detallado...")

        setTimeout(() => {
          const finalUserData = { ...userData, correo: inputValue }
          const quotationData = generateCompleteQuotation(finalUserData, responses, additionalRooms)

          saveQuotationDataToLocalStorage(finalUserData, responses, quotationData.economicProposalJSON)

          addMessage("bot", quotationData.cotizacionTexto)
          addMessage("bot", "¿Te gustaría descargar el documento oficial de cotización?", [
            {
              letra: "A",
              text: "📄 Sí, descargar documento PDF",
              value: "descargar",
              action: "download",
              data: quotationData,
            },
            { letra: "B", text: "📋 Solo conservar resumen", value: "resumen", action: "summary" },
            { letra: "C", text: "🔄 Iniciar nueva cotización", value: "new_quotation", action: "reset" },
          ])
          setStep("final")
        }, 1000)
        break
    }
  }

  // ==================== OPTION SELECTION HANDLING ====================

  /**
   * Handle option button clicks throughout the conversation flow
   */
  const handleOptionClick = (option: QuestionOption) => {
    addMessage("user", option.text)

    switch (step) {
      case "questions":
        handleMainQuestions(option)
        break
      case "room_questions":
        handleRoomQuestions(option)
        break
      case "espacios_selection":
        handleSpaceSelection(option)
        break
      case "material_line_selection":
        handleMaterialLineSelection(option)
        break
      case "final":
        handleFinalActions(option)
        break
    }
  }

  /**
   * Handle main project questions (lot, principal room, additional rooms)
   */
  const handleMainQuestions = (option: QuestionOption) => {
    if (currentQuestion === 0) {
      setResponses((prev) => ({ ...prev, lote: String(option.value) }))
      addMessage("bot", MAIN_QUESTIONS[1].text, MAIN_QUESTIONS[1].options)
      setCurrentQuestion(1)
    } else if (currentQuestion === 1) {
      setResponses((prev) => ({ ...prev, habitacion_principal: String(option.value) }))
      addMessage("bot", MAIN_QUESTIONS[2].text, MAIN_QUESTIONS[2].options)
      setCurrentQuestion(2)
    } else if (currentQuestion === 2) {
      const roomCount = Number(option.value)
      setAdditionalRooms(roomCount)
      setResponses((prev) => ({ ...prev, habitaciones_adicionales: roomCount }))

      if (roomCount > 0) {
        addMessage("bot", ROOM_QUESTIONS[0].text(1), ROOM_QUESTIONS[0].options)
        setStep("room_questions")
        setCurrentRoomQuestion(0)
      } else {
        showAdditionalSpacesOptions()
      }
    }
  }

  /**
   * Handle additional room configuration questions
   */
  const handleRoomQuestions = (option: QuestionOption) => {
    const roomNum = Math.floor(currentRoomQuestion / 2) + 1
    const questionType = currentRoomQuestion % 2

    if (questionType === 0) {
      setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_cama`]: String(option.value) }))
      addMessage("bot", ROOM_QUESTIONS[1].text(roomNum), ROOM_QUESTIONS[1].options)
      setCurrentRoomQuestion((prev) => prev + 1)
    } else {
      setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_bano`]: String(option.value) }))

      if (roomNum < additionalRooms) {
        addMessage("bot", ROOM_QUESTIONS[0].text(roomNum + 1), ROOM_QUESTIONS[0].options)
        setCurrentRoomQuestion((prev) => prev + 1)
      } else {
        showAdditionalSpacesOptions()
      }
    }
  }

  /**
   * Handle additional space selection
   */
  const handleSpaceSelection = (option: QuestionOption) => {
    if (option.value === "terminar") {
      showMaterialLineQuestion()
      return
    }

    if (option.value === "ninguno") {
      setResponses((prev) => ({ ...prev, espacios_adicionales: [] }))
      addMessage("bot", "Perfecto, tu proyecto incluirá solo los espacios básicos.")
      showMaterialLineQuestion()
    } else {
      setResponses((prev) => {
        const currentSpaces = prev.espacios_adicionales || []
        const newValue = String(option.value)
        if (!currentSpaces.includes(newValue)) {
          return { ...prev, espacios_adicionales: [...currentSpaces, newValue] }
        }
        return prev
      })

      addMessage("bot", `Agregado: ${option.text}`)

      const selectedSpaces = [...(responses.espacios_adicionales || []), String(option.value)]
      const remainingSpaces = ADDITIONAL_SPACES.filter(
        (space) => !selectedSpaces.includes(String(space.value)) && space.value !== "ninguno",
      )

      if (remainingSpaces.length > 0) {
        const optionsWithFinish = remainingSpaces.concat([
          {
            letra: "Z",
            text: "✅ Ya no quiero más espacios - Continuar",
            value: "terminar",
            area: 0,
          },
        ])
        addMessage("bot", "¿Deseas agregar otro espacio adicional?", optionsWithFinish)
      } else {
        showMaterialLineQuestion()
      }
    }
  }

  /**
   * Handle material line selection
   */
  const handleMaterialLineSelection = (option: QuestionOption) => {
    setResponses((prev) => ({ ...prev, linea_materiales: String(option.value) }))
    addMessage("bot", `Seleccionaste: ${option.text}`)
    proceedToUserDataCollection()
  }

  /**
   * Handle final actions (download PDF, summary, reset)
   */
  const handleFinalActions = (option: QuestionOption) => {
    switch (option.action) {
      case "download":
        handlePDFGeneration(option.data)
        break
      case "summary":
        addMessage("bot", "Aquí tienes un resumen de tu cotización:")
        break
      case "reset":
        startNewQuotation()
        break
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Resets the chatbot state to start a new quotation.
   */
  const startNewQuotation = () => {
    setMessages([])
    setCurrentInput("")
    setStep("greeting")
    hasInitialized.current = false
    setUserData({
      nombre: "",
      telefono: "",
      correo: "",
    })
    setResponses({})
    setCurrentQuestion(0)
    setAdditionalRooms(0)
    setCurrentRoomQuestion(0)
    clearQuotationDataFromLocalStorage()
  }

  /**
   * Show additional spaces selection options
   */
  const showAdditionalSpacesOptions = () => {
    addMessage(
      "bot",
      "Ahora vamos a personalizar tu vivienda con espacios adicionales. Estos espacios complementarán las áreas básicas (cocina, sala, comedor, zona de ropas y baño social).",
      ADDITIONAL_SPACES.slice(0, -1).concat([
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

  /**
   * Show material line selection question
   */
  const showMaterialLineQuestion = () => {
    addMessage(
      "bot",
      "Ahora necesito saber sobre la calidad de los materiales para tu proyecto. Esto influirá directamente en los costos de construcción.",
      MATERIAL_LINE_QUESTION.options,
    )
    setStep("material_line_selection")
  }

  /**
   * Proceed to user data collection phase
   */
  const proceedToUserDataCollection = () => {
    addMessage(
      "bot",
      "¡Excelente! Has completado la configuración de tu proyecto. Ahora necesito algunos datos para personalizar tu cotización.",
    )
    addMessage("bot", "Por favor, dime tu nombre completo:")
    setStep("user_data_name")
  }

  /**
   * Handle PDF document generation
   */
  const handlePDFGeneration = async (quotationData: any) => {
    try {
      setIsGenerating(true)
      console.log("Generating PDF document:", quotationData)

      await generatePDFDocument(quotationData)

      setIsGenerating(false)
      setShowSuccess(true)

      setTimeout(() => {
        setShowSuccess(false)
        addMessage("bot", "✅ ¡Perfecto! Tu cotización en PDF ha sido generada y descargada exitosamente.")
      }, 3000)
    } catch (error: any) {
      console.error("PDF generation error:", error)
      setIsGenerating(false)
      addMessage("bot", `❌ Error al generar el documento: ${error.message}`)
    }
  }

  // ==================== UI HELPER FUNCTIONS ====================

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

  const shouldShowInput = () => {
    return ["user_data_name", "user_data_phone", "user_data_email"].includes(step)
  }

  // ==================== RENDER ====================

  return (
    <div
      className="flex flex-col h-screen bg-white relative"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full mx-4 text-center shadow-2xl">
            <div className="mb-4">
              <Loader2 className="w-12 h-12 text-gray-800 animate-spin mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Generando tu cotización</h3>
            <p className="text-gray-600 text-sm">Estamos creando tu documento PDF...</p>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-green-600 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full mx-4 text-center shadow-2xl">
            <div className="mb-4">
              <Check className="w-12 h-12 text-green-600 mx-auto animate-bounce" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">¡Descarga Exitosa!</h2>
            <p className="text-gray-600 text-sm">Tu cotización PDF ha sido generada correctamente.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="bg-white text-gray-900 px-6 py-5 shadow-xl border-b border-gray-200" aria-label="Main navigation">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105 group"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5 group-hover:text-gray-700" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 p-2.5 rounded-full shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">SAAVE Arquitectos</h1>
                <p className="text-gray-600 text-sm font-light">Sistema inteligente de cotizaciones</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => window.open("https://www.saavearquitectos.com/", "_blank")}
              aria-label="Visitar nuestro sitio web"
            >
              <span className="text-sm font-medium">Visitar Sitio</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

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
      {shouldShowInput() && (
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
                  aria-label={getInputPlaceholder()}
                />
              </div>
              <button
                onClick={handleUserInput}
                disabled={!currentInput.trim()}
                className="w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                aria-label="Enviar mensaje"
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

export default EnhancedChatbotCotizacion