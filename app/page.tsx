"use client"
import { useState } from "react"
import EnhancedChatbotCotizacion from "@/components/enhanced-chatbot-cotizacion"
import { ArrowRight, Building2, Calculator, Users } from "lucide-react"

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false)

  if (showChatbot) {
    return <EnhancedChatbotCotizacion onBack={() => setShowChatbot(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black font-sans"> {/* Fondo gris + letras negras */}
      <header className="border-b border-gray-300 bg-gray-100"></header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center rounded-full border border-gray-400 bg-gray-200 px-3 py-1 text-sm text-black mb-8 shadow-sm">
                <span className="mr-2 h-2 w-2 rounded-full bg-black"></span>
                Sistema de cotización inteligente disponible
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 text-black">
                SAAVE
                <br />
                <span className="text-black">Arquitectos</span>
              </h1>

              <p className="text-xl md:text-2xl text-black mb-4 max-w-3xl mx-auto leading-relaxed">
                <span className="font-semibold">MATERIALIZAR TUS SUEÑOS</span> a través de{" "}
                <span className="font-semibold">SOLUCIONES</span> que{" "}
                <span className="font-semibold">AGREGUEN VALOR A TU INVERSIÓN</span>
              </p>

              <p className="text-lg text-black mb-12 max-w-2xl mx-auto">
                Obtén una cotización detallada y personalizada para tu proyecto arquitectónico con nuestro sistema
                inteligente de estimación de costos.
              </p>

              <button
                onClick={() => setShowChatbot(true)}
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                Iniciar Cotización
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Cotización Inteligente</h3>
                <p className="text-black">
                  Sistema automatizado que calcula costos precisos basados en especificaciones detalladas de tu proyecto.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Diseño Personalizado</h3>
                <p className="text-black">
                  Soluciones arquitectónicas únicas adaptadas a tus necesidades, presupuesto y estilo de vida.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Acompañamiento Integral</h3>
                <p className="text-black">
                  Te acompañamos desde la conceptualización hasta la entrega final de tu proyecto.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-400 bg-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-black" />
              <span className="text-xl font-bold font-serif text-black">SAAVE Arquitectos</span>
            </div>
            <p className="text-black text-center md:text-right">
              © 2025 SAAVE Arquitectos. Materializando sueños arquitectónicos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
