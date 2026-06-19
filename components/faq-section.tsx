"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { FAQSection } from "@/lib/faq-types"

export default function FAQSection({ faq }: { faq: FAQSection }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section className="w-full py-7 md:py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-5 md:mb-12">
          <h2 className="text-[20px] md:text-4xl font-bold text-foreground mb-1.5 md:mb-4 text-balance">{faq.title}</h2>
          <p className="text-[13px] md:text-lg text-muted-foreground text-pretty">{faq.description}</p>
        </div>

        <div className="space-y-2 md:space-y-4">
          {faq.items.map((item, index) => (
            <div key={index} className="border border-border rounded-xl overflow-hidden transition-all">
              <button onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-4 py-3 md:py-4 flex items-center justify-between bg-background hover:bg-muted transition-colors text-left gap-3">
                <h3 className="font-semibold text-foreground text-[13px] md:text-base text-balance leading-snug">{item.question}</h3>
                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${expandedIndex === index ? "rotate-180" : ""}`} />
              </button>
              {expandedIndex === index && (
                <div className="px-4 py-3 md:py-4 bg-muted border-t border-border">
                  <p className="text-muted-foreground text-[12px] md:text-sm leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
