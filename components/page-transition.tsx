"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "blur"
  className?: string
}

export default function PageTransition({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hiddenStyles: Record<string, string> = {
    up: "opacity-0 translate-y-10",
    down: "opacity-0 -translate-y-10",
    left: "opacity-0 -translate-x-10",
    right: "opacity-0 translate-x-10",
    blur: "opacity-0 blur-sm scale-[0.98]",
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0 translate-x-0 blur-0 scale-100" : hiddenStyles[direction]
      } ${className}`}
    >
      {children}
    </div>
  )
}
