// ============================================================
// SAYBA ARC — i18n (Language Context)
//
// Usage:
//   import { useContent } from "@/lib/i18n"
//   const c = useContent()
//   <h1>{c.hero.title}</h1>
//
// Language is stored in localStorage under "sayba_lang".
// Default: "id" (Indonesian).
// ============================================================

"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import * as ID from "@/lib/data"
import * as EN from "@/lib/data.en"

export type Lang = "id" | "en"
export type SiteContent = typeof ID

const STORAGE_KEY = "sayba_lang"

// ── Context ────────────────────────────────────────────────

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  content: SiteContent
}

const I18nContext = createContext<I18nCtx>({
  lang: "id",
  setLang: () => {},
  content: ID,
})

// ── Provider ───────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }): JSX.Element {
  const [lang, setLangState] = useState<Lang>("id")

  // Hydrate from localStorage (client-only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === "en" || stored === "id") setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }

  const content: SiteContent = lang === "en" ? (EN as SiteContent) : ID

  return (
    <I18nContext.Provider value={{ lang, setLang, content }}>
      {children}
    </I18nContext.Provider>
  )
}

// ── Hooks ──────────────────────────────────────────────────

/** Returns the full content object in the active language. */
export function useContent(): SiteContent {
  return useContext(I18nContext).content
}

/** Returns lang, setLang, and content. */
export function useI18n(): I18nCtx {
  return useContext(I18nContext)
}
