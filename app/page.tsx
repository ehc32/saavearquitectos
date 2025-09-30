"use client"

import { useState } from "react"
import EnhancedChatbotCotizacion from "@/components/enhanced-chatbot-cotizacion"
import { ArrowRight, Building2, Calculator, Users } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false)

  if (showChatbot) {
    return <EnhancedChatbotCotizacion onBack={() => setShowChatbot(false)} />
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main>
        {/* HERO - compacto y centrado */}
        <section className="relative py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-serif mb-3 leading-tight">
                <span className="text-black">SAAVE</span>
                <br />
                <span className="text-black">Arquitectos</span>
              </h1>

              <p className="text-lg md:text-xl text-black mb-2 max-w-2xl mx-auto leading-snug">
                <span className="font-semibold">MATERIALIZAR TUS SUEÑOS</span> a través de{" "}
                <span className="font-semibold">SOLUCIONES</span> que{" "}
                <span className="font-semibold">AGREGUEN VALOR A TU INVERSIÓN</span>
              </p>

              <p className="text-sm text-gray-600 mb-4 max-w-xl mx-auto">
                Obtén una cotización detallada y personalizada para tu proyecto arquitectónico con nuestro sistema inteligente de estimación de costos.
              </p>

              <button
                onClick={() => setShowChatbot(true)}
                className="inline-flex items-center gap-2 bg-[#B22222] text-white px-6 py-3 rounded-full text-base font-semibold hover:bg-[#8b1a1a] transition-all duration-150"
              >
                Iniciar Cotización
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES - compactas y en la misma vista */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="text-center p-4 compact-card">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calculator className="h-6 w-6 text-gray-800" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-black">Cotización Inteligente</h3>
                <p className="text-sm text-gray-600">
                  Sistema automatizado que calcula costos precisos basados en especificaciones detalladas de tu proyecto.
                </p>
              </div>

              <div className="text-center p-4 compact-card">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-gray-800" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-black">Diseño Personalizado</h3>
                <p className="text-sm text-gray-600">
                  Soluciones arquitectónicas únicas adaptadas a tus necesidades, presupuesto y estilo de vida.
                </p>
              </div>

              <div className="text-center p-4 compact-card">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-gray-800" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-black">Acompañamiento Integral</h3>
                <p className="text-sm text-gray-600">
                  Te acompañamos desde la conceptualización hasta la entrega final de tu proyecto.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - compacto, centrado, logo y nombre */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-3">
          <Image
  src="/logo-2.png"
  alt="SAAVE Arquitectos Logo"
  width={500}
  height={500}
  className="object-contain h-24 w-24 md:h-[150px] md:w-[150px]"
/>


            <span className="text-2xl font-bold font-serif text-black tracking-wide text-center">
              SAAVE Arquitectos
            </span>

            <p className="text-gray-600 text-center text-sm">
              © {new Date().getFullYear()} SAAVE Arquitectos · Materializando sueños arquitectónicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
