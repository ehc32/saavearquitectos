"use client"

import { ReactNode, useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface ScrollAnimationProps {
  children: ReactNode
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale' | 'rotate' | 'stagger'
  delay?: number
  duration?: number
  className?: string
}

export default function ScrollAnimation({ 
  children, 
  animation = 'fadeUp', 
  delay = 0,
  className = '' 
}: ScrollAnimationProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true
  })

  const getAnimationClass = () => {
    const baseClass = isVisible ? 'visible' : ''
    
    switch (animation) {
      case 'fadeUp':
        return `scroll-reveal ${baseClass}`
      case 'fadeLeft':
        return `scroll-reveal-left ${baseClass}`
      case 'fadeRight':
        return `scroll-reveal-right ${baseClass}`
      case 'scale':
        return `scroll-reveal-scale ${baseClass}`
      case 'rotate':
        return `scroll-reveal-rotate ${baseClass}`
      case 'stagger':
        return `stagger-children ${baseClass}`
      default:
        return `scroll-reveal ${baseClass}`
    }
  }

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={`${getAnimationClass()} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: '0.8s'
      }}
    >
      {children}
    </div>
  )
}

// Componente para animación de texto letra por letra
interface TextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={`text-reveal ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {text.split('').map((char, index) => (
        <span 
          key={index}
          style={{ 
            transitionDelay: `${delay + (index * 50)}ms` 
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  )
}

// Componente para animación de números
interface NumberRevealProps {
  end: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  start?: number
  padToDigits?: number
}

export function NumberReveal({ 
  end, 
  duration = 2000, 
  className = '', 
  prefix = '', 
  suffix = '', 
  start = 0,
  padToDigits = 0 
}: NumberRevealProps) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  })

  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isVisible || isAnimating) return

    setIsAnimating(true)
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const value = Math.floor(start + easeOutQuart * (end - start))
      setCount(value)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, isVisible, isAnimating])

  const formatted = padToDigits > 0
    ? String(count).padStart(padToDigits, '0')
    : count.toLocaleString()

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`number-reveal ${className}`}>
      {prefix}{formatted}{suffix}
    </div>
  )
}
