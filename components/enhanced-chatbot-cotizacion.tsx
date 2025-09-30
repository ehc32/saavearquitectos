"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Phone, Bot, MessageCircle, ArrowLeft, Check, ExternalLink, Loader2 } from "lucide-react" // Added Loader2
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Import types and constants
import type { ChatMessage, QuestionOption, UserData, UserResponses, ChatbotProps } from "@/types/chatbot"
import { MAIN_QUESTIONS, ROOM_QUESTIONS, ADDITIONAL_SPACES, MATERIAL_LINE_QUESTION } from "@/constants/questions"

// Import utilities
import { generateCompleteQuotation } from "@/utils/quotation-generator"
import QuotationCard from "@/components/quotation-card"
import { generatePDFDocument } from "@/utils/api-client"
import { saveQuotationDataToLocalStorage, clearQuotationDataFromLocalStorage } from "@/utils/storage"

/**
 * Enhanced Chatbot Component for Architectural Quotations
 *
 * This component provides an interactive chatbot interface for collecting
 * project requirements and generating detailed architectural quotations.
 *
 * Features:
 * - Step-by-step project configuration
 * - Detailed area calculations with breakdowns
 * - Real-time quotation generation
 * - PDF document generation
 * - Responsive design with loading states
 * - Saves user responses to local storage
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
  const [isInitialized, setIsInitialized] = useState(false)
  const hasBootstrappedRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ==================== INITIALIZATION ====================

  /**
   * Initialize chatbot with greeting message and first question
   */
  useEffect(() => {
    if (hasBootstrappedRef.current) return
    if (!isInitialized && step === "greeting") {
      hasBootstrappedRef.current = true
      setIsInitialized(true)
      addMessage(
        "bot",
        "¡Hola! 👋 Soy tu asistente virtual de SAAVE Arquitectos y estoy aquí para ayudarte a obtener una cotización detallada de tu proyecto arquitectónico.\n\n🏗️ ¿Qué vamos a hacer?\n• Recopilaré información sobre tu proyecto\n• Calcularé las áreas y espacios necesarios\n• Te proporcionaré un presupuesto detallado con desglose completo\n• Generaré un documento profesional con tu cotización\n\nComencemos con las preguntas técnicas sobre tu proyecto:",
      )
      addMessage("bot", MAIN_QUESTIONS[0].text, MAIN_QUESTIONS[0].options)
      setStep("questions")
      setCurrentQuestion(0)
    }
  }, [isInitialized, step])

  /**
   * Auto-scroll to latest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Add a new message to the chat
   * Prevents duplicate consecutive messages from the same sender
   */
  const addMessage = (
    sender: "user" | "bot",
    text: string,
    options: QuestionOption[] | null = null,
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

        // Generate quotation after a brief delay
        setTimeout(() => {
          const finalUserData = { ...userData, correo: inputValue }
          const quotationData = generateCompleteQuotation(finalUserData, responses, additionalRooms)

          // Save user data and responses to local storage, including the economic proposal
          saveQuotationDataToLocalStorage(finalUserData, responses, quotationData.economicProposalJSON)

          addMessage("bot", "[CARD]", null, { quotationData })
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
      // Lot question
      setResponses((prev) => ({ ...prev, lote: option.value as string }))
      addMessage("bot", MAIN_QUESTIONS[1].text, MAIN_QUESTIONS[1].options)
      setCurrentQuestion(1)
    } else if (currentQuestion === 1) {
      // Principal room question
      setResponses((prev) => ({ ...prev, habitacion_principal: option.value as string }))
      addMessage("bot", MAIN_QUESTIONS[2].text, MAIN_QUESTIONS[2].options)
      setCurrentQuestion(2)
    } else if (currentQuestion === 2) {
      // Additional rooms question
      const roomCount = Number(option.value)
      setAdditionalRooms(roomCount)
      setResponses((prev) => ({ ...prev, habitaciones_adicionales: roomCount }))

      if (roomCount > 0) {
        // Start additional room configuration
        addMessage("bot", ROOM_QUESTIONS[0].text(1), ROOM_QUESTIONS[0].options)
        setStep("room_questions")
        setCurrentRoomQuestion(0)
      } else {
        // Skip to additional spaces
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
      // Bed type question
      setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_cama`]: option.value }))
      addMessage("bot", ROOM_QUESTIONS[1].text(roomNum), ROOM_QUESTIONS[1].options)
      setCurrentRoomQuestion((prev) => prev + 1)
    } else {
      // Bathroom question
      setResponses((prev) => ({ ...prev, [`habitacion_${roomNum}_bano`]: option.value }))

      if (roomNum < additionalRooms) {
        // Continue with next room
        addMessage("bot", ROOM_QUESTIONS[0].text(roomNum + 1), ROOM_QUESTIONS[0].options)
        setCurrentRoomQuestion((prev) => prev + 1)
      } else {
        // All rooms configured, move to additional spaces
        showAdditionalSpacesOptions()
      }
    }
  }

  /**
   * Handle additional space selection
   */
  const handleSpaceSelection = (option: QuestionOption) => {
    if (option.value === "terminar") {
      // User finished selecting spaces, now ask about material line
      showMaterialLineQuestion()
      return
    }

    if (option.value === "ninguno") {
      // No additional spaces selected
      setResponses((prev) => ({ ...prev, espacios_adicionales: [] }))
      addMessage("bot", "Perfecto, tu proyecto incluirá solo los espacios básicos.")
      showMaterialLineQuestion()
    } else {
      // Add selected space
      setResponses((prev) => {
        const currentSpaces = prev.espacios_adicionales || []
        if (!currentSpaces.includes(option.value as string)) {
          return { ...prev, espacios_adicionales: [...currentSpaces, option.value as string] }
        }
        return prev
      })

      addMessage("bot", `Agregado: ${option.text}`)

      // Show remaining spaces
      const selectedSpaces = [...(responses.espacios_adicionales || []), option.value as string]
      const remainingSpaces = ADDITIONAL_SPACES.filter(
        (space) => !selectedSpaces.includes(space.value as string) && space.value !== "ninguno",
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
    setResponses((prev) => ({ ...prev, linea_materiales: option.value as string }))
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
        addMessage("bot", "Resumen guardado en esta conversación. ¿Deseas iniciar una nueva cotización?")
        addMessage("bot", "Elige una opción:", [
          { letra: "A", text: "🔄 Iniciar nueva cotización", value: "new_quotation", action: "reset" },
          { letra: "B", text: "✅ Finalizar", value: "finish", action: "finish" },
        ])
        break
      case "reset":
        startNewQuotation()
        break
      case "finish":
        addMessage("bot", "Gracias por usar nuestro sistema de cotización. ¡Hasta pronto!")
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
    setIsInitialized(false)
    hasBootstrappedRef.current = false
    setUserData({
      nombre: "",
      telefono: "",
      correo: "",
    })
    setResponses({})
    setCurrentQuestion(0)
    setAdditionalRooms(0)
    setCurrentRoomQuestion(0)
    clearQuotationDataFromLocalStorage() // Clear previous data from local storage
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

      // Show success animation
      setIsGenerating(false)
      setShowSuccess(true)

      // Hide success animation after 3 seconds
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

  /**
   * Get appropriate icon for current input step
   */
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

  /**
   * Get appropriate placeholder text for current input step
   */
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

  /**
   * Check if input should be shown for current step
   */
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center shadow-2xl ring-1 ring-black/5">
            <div className="mb-5 flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gray-900 progress-indeterminate" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Generando tu cotización…</h3>
            <p className="text-gray-600 text-sm">Preparando PDF y activos. Esto puede tardar unos segundos.</p>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center shadow-2xl ring-1 ring-black/5">
            <div className="mb-4">
              <Check className="w-12 h-12 text-green-600 mx-auto" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">¡Descarga exitosa!</h2>
            <p className="text-gray-600 text-sm">Tu cotización PDF ha sido generada correctamente.</p>
            <div className="confetti" aria-hidden>
              <span style={{left:'10%', background:'#16a34a', animationDelay:'0ms'}}></span>
              <span style={{left:'30%', background:'#22c55e', animationDelay:'100ms'}}></span>
              <span style={{left:'50%', background:'#84cc16', animationDelay:'200ms'}}></span>
              <span style={{left:'70%', background:'#16a34a', animationDelay:'300ms'}}></span>
              <span style={{left:'90%', background:'#4ade80', animationDelay:'400ms'}}></span>
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
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              {message.sender === "bot" && (
                <div className="flex-shrink-0 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-xl ${message.sender === "user" ? "order-first" : ""}`}>
                {message.extraData && message.extraData.quotationData ? (
                  <div className="py-2">
                    <QuotationCard data={message.extraData.quotationData} />
                  </div>
                ) : (
                  <div
                    className={`px-5 py-3.5 rounded-3xl ${
                      message.sender === "user"
                        ? "bg-black text-white rounded-br-md shadow-lg"
                        : "bg-white text-gray-800 shadow-md/10 border border-gray-200/70 rounded-bl-md"
                    }`}
                  >
                    <div className="whitespace-pre-line text-[15px] leading-relaxed">{message.text}</div>
                    {message.options && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            onClick={() => handleOptionClick(option)}
                            className="block w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all duration-200 border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:text-black"
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
        <div className="bg-white/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur fixed bottom-0 left-0 right-0 border-t border-gray-200 py-3">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{getInputIcon()}</div>
                <input
                  type={step === "user_data_email" ? "email" : "text"}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUserInput()}
                  placeholder={getInputPlaceholder()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all duration-200 shadow-sm"
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
