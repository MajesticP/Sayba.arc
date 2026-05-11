"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { FAQSection } from "@/lib/faq-types"

interface FAQSectionProps {
  faq: FAQSection
}

export default function FAQSection({ faq }: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="w-full py-10 md:py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Title dan Description - Centered */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4 text-balance">
            {faq.title}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground text-pretty">
            {faq.description}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-2 md:space-y-4">
          {faq.items.map((item, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden transition-all">
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-background hover:bg-muted transition-colors text-left"
              >
                <h3 className="font-semibold text-foreground text-sm md:text-base text-balance">
                  {item.question}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0 ml-3 transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer - Collapsible */}
              {expandedIndex === index && (
                <div className="px-4 md:px-6 py-3 md:py-4 bg-muted border-t border-border">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
