"use client"

import { useState, useEffect } from "react"
import EnhancedChatbotCotizacion from "@/components/enhanced-chatbot-cotizacion"
import { ArrowRight, MessageSquare, Sparkles, Clock, ExternalLink } from "lucide-react"
import Image from "next/image"
import ScrollAnimation, { TextReveal, NumberReveal } from "@/components/scroll-animation"

export default function Home() {
  const [showChatbot, setShowChatbot] = useState(false)

  if (showChatbot) {
    return <EnhancedChatbotCotizacion onBack={() => setShowChatbot(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimalista */}
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

      <main>
        {/* Hero Section - Espacios amplios y tipografía elegante */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 rounded-b-[80px] bg-white overflow-hidden border-b border-border/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-border/30">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* Contenido principal */}
                <ScrollAnimation animation="fadeLeft" className="mb-12 lg:mb-0">
                  <div className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground mb-8">
                    <span className="w-8 h-px bg-accent"></span>
                    ASISTENTE INTELIGENTE
                  </div>

                  <h1 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl font-light tracking-tight text-foreground mb-8 leading-[0.85] text-balance">
                    <TextReveal text="Cotización" className="block" />
                    <TextReveal text="Arquitectónica" className="block font-normal" delay={200} />
                    <TextReveal text="Inteligente" className="block text-muted-foreground" delay={400} />
                  </h1>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-16">
                    Inicia una conversación con nuestro asistente especializado para obtener una estimación detallada y
                    personalizada de tu proyecto arquitectónico.
                  </p>

                  <button
                    onClick={() => setShowChatbot(true)}
                    className="group inline-flex items-center gap-3 btn-black px-8 py-5 rounded-full text-sm tracking-wide font-medium hover-lift"
                  >
                    INICIAR CONVERSACIÓN
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </ScrollAnimation>

                {/* Imagen fija en lugar del carrusel */}
                <ScrollAnimation animation="fadeRight" delay={300}>
                  <div className="relative w-full h-full">
                    <div className="relative bg-white overflow-hidden border border-transparent h-[380px] sm:h-[520px] lg:h-[620px]">
                      <Image src="/imagen.png" alt="Cotización Inteligente" fill className="object-cover" priority />
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* Características - Grid minimalista */}
         <section className="py-24 lg:py-32 bg-muted/30 rounded-b-[80px] overflow-hidden border-b border-border/20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <ScrollAnimation animation="stagger" className="grid md:grid-cols-3 gap-16 lg:gap-24">
                <div className="space-y-6 hover-lift">
                  <div className="w-12 h-12 flex items-center justify-center bg-background border border-border gentle-pulse">
                    <MessageSquare className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-3 text-foreground tracking-tight">Conversación Natural</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Describe tu proyecto en tus propias palabras. Nuestro asistente comprende tus necesidades y te
                      guía paso a paso.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 hover-lift">
                  <div className="w-12 h-12 flex items-center justify-center bg-background border border-border gentle-pulse">
                    <Sparkles className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-3 text-foreground tracking-tight">Estimación Precisa</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Cálculos detallados basados en especificaciones técnicas, materiales y complejidad del diseño
                      arquitectónico.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 hover-lift">
                  <div className="w-12 h-12 flex items-center justify-center bg-background border border-border gentle-pulse">
                    <Clock className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-3 text-foreground tracking-tight">Respuesta Inmediata</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Obtén tu cotización en minutos. Sin esperas, sin formularios complejos, solo una conversación
                      eficiente.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Proceso - Diseño numerado minimalista */}
         <section className="py-24 lg:py-32 rounded-t-[80px] rounded-b-[80px] bg-white overflow-hidden border-b border-border/20 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-border/30">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <ScrollAnimation animation="fadeUp" className="mb-20">
                <div className="inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground mb-6">
                  <span className="w-8 h-px bg-accent"></span>
                  PROCESO
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
                  <TextReveal text="Cómo funciona" />
                </h2>
              </ScrollAnimation>

              <ScrollAnimation animation="stagger" className="space-y-12">
                <div className="grid md:grid-cols-[120px_1fr] gap-8 items-start hover-lift rounded-2xl">
                  <div className="text-7xl font-light text-muted-foreground/30">
                    <NumberReveal end={1} start={1} padToDigits={2} />
                  </div>
                  <div className="space-y-3 pt-1">
                    <h3 className="text-2xl font-medium text-foreground">Inicia la conversación</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      Haz clic en "Iniciar Conversación" y comienza a describir tu proyecto. El asistente te hará
                      preguntas específicas para entender tus necesidades.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-[120px_1fr] gap-8 items-start hover-lift rounded-2xl">
                  <div className="text-7xl font-light text-muted-foreground/30">
                    <NumberReveal end={2} start={2} padToDigits={2} />
                  </div>
                  <div className="space-y-3 pt-1">
                    <h3 className="text-2xl font-medium text-foreground">Proporciona detalles</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      Comparte información sobre dimensiones, materiales preferidos, estilo arquitectónico y cualquier
                      requisito especial de tu proyecto.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-[120px_1fr] gap-8 items-start hover-lift rounded-2xl">
                  <div className="text-7xl font-light text-muted-foreground/30">
                    <NumberReveal end={3} start={3} padToDigits={2} />
                  </div>
                  <div className="space-y-3 pt-1">
                    <h3 className="text-2xl font-medium text-foreground">Recibe tu cotización</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      Obtén una estimación detallada con desglose de costos, tiempos de ejecución y recomendaciones
                      personalizadas para tu proyecto.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* CTA Final - Minimalista y elegante */}
         <section className="py-32 lg:py-40 cta-custom rounded-3xl rounded-b-[80px] mx-6 lg:mx-12 mb-12 overflow-hidden border-b border-white/20">
          <div className="container mx-auto px-6 lg:px-12">
            <ScrollAnimation animation="scale" className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 text-balance">
                <TextReveal text="Materializa tus ideas" className="block" />
                <br />
                <TextReveal text="con precisión" className="block font-normal" delay={300} />
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Comienza ahora y descubre cómo podemos transformar tu visión en un proyecto arquitectónico excepcional.
              </p>
              <button
                onClick={() => setShowChatbot(true)}
                className="group inline-flex items-center gap-3 btn-black-outline px-8 py-5 rounded-full text-sm tracking-wide font-medium hover-lift"
              >
                COMENZAR AHORA
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollAnimation>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-black py-16 rounded-t-[80px] overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="stagger" className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="hover-lift">
                <div className="mb-6">
                  <Image
                    src="/logo-saave.png"
                    alt="SAAVE Arquitectos"
                    width={200}
                    height={60}
                    className="h-28 w-auto brightness-0 invert"
                  />
                </div>
                <p className="text-background/70 leading-relaxed max-w-md">
                  Arquitectos especializados en materializar sueños a través de soluciones que agregan valor a tu
                  inversión.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="hover-lift">
                  <h4 className="text-sm tracking-widest mb-4 text-background/70">NAVEGACIÓN</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <a
                        href="https://www.saavearquitectos.com/proyectos/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-background/70 transition-colors"
                      >
                        Proyectos
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.saavearquitectos.com/servicios/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-background/70 transition-colors"
                      >
                        Servicios
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.saavearquitectos.com/reservas/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-background/70 transition-colors"
                      >
                        ¡Agenda Tú Cita!
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="hover-lift">
                  <h4 className="text-sm tracking-widest mb-4 text-background/70">CONTACTO</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="text-background/70">mailto:saavearquitectos@gmail.com</li>
                    <li className="text-background/70">+57 320 2085561</li>
                  </ul>
                </div>
              </div>
            </ScrollAnimation>
            <ScrollAnimation
              animation="fadeUp"
              className="pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50"
            >
              <p>© 2024 SAAVE Arquitectos. All rights reserved.              </p>
              <p>Desarrollado por Cobalus Empresarial</p>
            </ScrollAnimation>
          </div>
        </div>
      </footer>
    </div>
  )
}
