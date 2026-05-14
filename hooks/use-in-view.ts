"use client"
import { useEffect, useRef, useState } from "react"

interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean
}

export function useInView(options?: UseInViewOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const { once = true, ...observerOptions } = options ?? {}

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: 0.12, ...observerOptions }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  return { ref, inView }
}
