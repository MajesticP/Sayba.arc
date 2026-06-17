"use client"

import { useI18n, type Lang } from "@/lib/i18n"

export default function LangToggle() {
  const { lang, setLang } = useI18n()

  const toggle = () => setLang(lang === "id" ? "en" : "id")

  return (
    <button
      onClick={toggle}
      aria-label={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
      className="
        relative inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide
        border border-black/10 bg-white/60 hover:bg-white/90
        backdrop-blur-sm transition-all duration-200
        select-none cursor-pointer
      "
    >
      <span className={lang === "id" ? "opacity-100" : "opacity-40"}>ID</span>
      <span className="text-black/20">|</span>
      <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
    </button>
  )
}
