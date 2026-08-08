"use client"

import { useState } from "react"
import { Cpu, ClipboardList } from "lucide-react"

interface Props {
  technologies: string[]
  process: string[]
  specifications: string[]
  accent: string
}

export default function ProductFeatureTabs({ technologies, process, specifications, accent }: Props) {
  const tabs = [
    ...(technologies.length > 0 ? [{ id: "tech", label: "Teknologi" }] : []),
    ...(process.length > 0 ? [{ id: "process", label: "Proses" }] : []),
    ...(specifications.length > 0 ? [{ id: "spec", label: "Spesifikasi" }] : []),
  ]

  const [active, setActive] = useState(tabs[0]?.id ?? "tech")

  if (tabs.length === 0) return null

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex gap-0 border-b border-black/8 mb-5 md:mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="px-4 md:px-6 py-2.5 md:py-3 font-semibold text-[12.5px] md:text-sm relative transition-colors duration-200 whitespace-nowrap flex-shrink-0"
            style={{ color: active === tab.id ? accent : "rgba(0,0,0,0.4)" }}
          >
            {tab.label}
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 rounded-t"
              style={{
                backgroundColor: accent,
                transform: active === tab.id ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
              }}
            />
          </button>
        ))}
      </div>

      {/* Teknologi */}
      {active === "tech" && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {technologies.map((tech, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] md:text-sm font-medium"
              style={{ backgroundColor: `${accent}12`, color: accent }}
            >
              <Cpu size={13} />
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Proses */}
      {active === "process" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {process.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg md:rounded-xl px-3 md:px-5 py-3 md:py-4 bg-black/[0.025] hover:bg-black/[0.04] transition-colors duration-150"
            >
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] md:text-xs font-bold"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                {i + 1}
              </div>
              <span className="text-black/75 font-medium text-xs md:text-sm">{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* Spesifikasi */}
      {active === "spec" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {specifications.map((spec, i) => {
            const idx = spec.indexOf(":")
            const label = idx > -1 ? spec.slice(0, idx).trim() : null
            const value = idx > -1 ? spec.slice(idx + 1).trim() : spec.trim()
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg md:rounded-xl px-3 md:px-5 py-3 md:py-4 bg-black/[0.025] hover:bg-black/[0.04] transition-colors duration-150"
              >
                <div
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${accent}18` }}
                >
                  <ClipboardList size={14} style={{ color: accent }} />
                </div>
                {label ? (
                  <span className="text-xs md:text-sm">
                    <span className="text-black/45 font-medium">{label}:</span>{" "}
                    <span className="text-black/80 font-semibold">{value}</span>
                  </span>
                ) : (
                  <span className="text-black/75 font-medium text-xs md:text-sm">{value}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
