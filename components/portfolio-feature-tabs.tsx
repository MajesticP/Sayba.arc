"use client"

import { useState } from "react"
import { CheckCircle2, Cpu } from "lucide-react"

interface Props {
  features: string[]
  techStack: string[]
  accent: string
}

export default function FeatureTabs({ features, techStack, accent }: Props) {
  const tabs = [
    ...(features.length > 0 ? [{ id: "features", label: "Fitur" }] : []),
    ...(techStack.length > 0 ? [{ id: "tech", label: "Teknologi" }] : []),
  ]

  const [active, setActive] = useState(tabs[0]?.id ?? "features")

  if (tabs.length === 0) return null

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex gap-0 border-b border-black/8 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className="px-6 py-3 font-semibold text-sm relative transition-colors duration-200"
            style={{
              color: active === tab.id ? accent : "rgba(0,0,0,0.4)",
            }}
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

      {/* Features Tab */}
      {active === "features" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg md:rounded-xl px-3 md:px-5 py-3 md:py-4 bg-black/[0.025] hover:bg-black/[0.04] transition-colors duration-150 group"
            >
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accent}18` }}
              >
                <CheckCircle2 size={14} style={{ color: accent }} />
              </div>
              <span className="text-black/75 font-medium text-xs md:text-sm">{feat}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tech Stack Tab */}
      {active === "tech" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {techStack.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg md:rounded-xl px-3 md:px-5 py-3 md:py-4 bg-black/[0.025] hover:bg-black/[0.04] transition-colors duration-150 group"
            >
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accent}18` }}
              >
                <Cpu size={14} style={{ color: accent }} />
              </div>
              <span className="text-black/75 font-medium text-xs md:text-sm">{tech}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
