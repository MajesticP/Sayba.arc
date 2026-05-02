"use client"

import { useEffect, useState, type ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  delay?: number
}

export default function PageTransition({ children, delay = 0 }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-[1500ms] ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
      }`}
    >
      {children}
    </div>
  )
}
