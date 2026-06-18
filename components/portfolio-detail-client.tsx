"use client"

import { useState } from "react"
import Header from "@/components/header"
import { navItems, footerLinks, socialLinks } from "@/lib/data"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { DynamicIcon } from "@/lib/dynamic-icon"
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react"
import PageTransition from "@/components/page-transition"

// Helper untuk convert Google Drive URL
interface CustomTab {
  id: string
  label: string
  items: Array<{
    title: string
    points: string[]
    icon?: string
  }>
}

interface CustomButton {
  text: string
  link: string
  color: string
  textColor: string
}

export default function PortfolioDetailClient({ slug }: { slug: string }) {
  const [homeData, setHomeData] = useState<any>({})
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({})

  const getValue = (key: string) => homeData[key] || "-"

  const parseSocialItems = () => {
    const items: Array<{ name: string; icon: string; link: string }> = []
    let index = 1

    while (index <= 20) {
      const name = homeData[`Social ${index} Name`]
      if (!name || name === "-") break

      items.push({
        name,
        icon: homeData[`Social ${index} Icon`] || name.toLowerCase(),
        link: homeData[`Social ${index} Link`] || "#",
      })
      index++
    }

    return items
  }

  const parseCustomTabs = (): CustomTab[] => {
    if (!portfolioData) return []
    const tabs: CustomTab[] = []
    let tabIndex = 1

    while (tabIndex <= 20) {
      const tabName = portfolioData[`Tab ${tabIndex} Name`]
      if (!tabName || tabName === "-") break

      const items: Array<{ title: string; points: string[]; icon?: string }> = []
      let itemIndex = 1

      while (itemIndex <= 50) {
        const itemText = portfolioData[`Tab ${tabIndex} Item ${itemIndex}`]
        if (!itemText || itemText === "-") break

        const itemIcon = portfolioData[`Tab ${tabIndex} Item ${itemIndex} Icon`]

        // Parse pipe-separated format: "Title | point 1 | point 2 | etc"
        const parts = itemText.split("|").map((part: string) => part.trim())
        const title = parts[0] || ""
        const points = parts.slice(1).filter((p: string) => p.length > 0)

        items.push({
          title,
          points,
          icon: itemIcon !== "-" ? itemIcon : undefined,
        })
        itemIndex++
      }

      if (items.length > 0) {
        tabs.push({
          id: `tab-${tabIndex}`,
          label: tabName,
          items,
        })
      }
      tabIndex++
    }

    return tabs
  }

  const parseCustomButtons = (): CustomButton[] => {
    if (!portfolioData) return []
    const buttons: CustomButton[] = []
    let btnIndex = 1

    while (btnIndex <= 10) {
      const btnText = portfolioData[`Button ${btnIndex} Text`]
      if (!btnText || btnText === "-") break

      buttons.push({
        text: btnText,
        link: portfolioData[`Button ${btnIndex} Link`] || "/contact",
        color: portfolioData[`Button ${btnIndex} Color`] || portfolioData["Button Color"] || getValue("Header Button Color"),
        textColor: portfolioData[`Button ${btnIndex} Text Color`] || "#ffffff",
      })
      btnIndex++
    }

    return buttons
  }

  const toggleExpand = (tabId: string, itemIndex: number) => {
    const key = `${tabId}-${itemIndex}`
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  // Portfolio tidak ditemukan
  if (!portfolioData) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header
          navItems={navItems}
          ctaText="Hubungi Kami"
          ctaHref="/contact"
        />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <PageTransition>
            <div className="text-center p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Portfolio Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">Portfolio "{slug}" tidak ditemukan dalam sistem.</p>
              <Link href="/portfolio" className="text-orange-500 hover:underline">
                Kembali ke Portfolio
              </Link>
            </div>
          </PageTransition>
        </div>
        <Footer
          footerLinks={footerLinks}
          socialLinks={socialLinks}
        />
      </main>
    )
  }

  // Data portfolio
  const title = portfolioData["Title"] || slug.replace(/-/g, " ")
  const subtitle = portfolioData["Subtitle"] || ""
  const description = portfolioData["Description"] || ""
  const icon = portfolioData["Icon"] || "star"
  const imageUrl = portfolioData["Image URL"] || ""

  // Colors
  const bgColor = portfolioData["Background Color"] || "#ffffff"
  const titleColor = portfolioData["Title Color"] || "#313030"
  const textColor = portfolioData["Text Color"] || "#666666"
  const buttonColor = portfolioData["Button Color"] || getValue("Header Button Color") || "#ff914d"
  const cardColor = portfolioData["Card Color"] || "#f8f8f8"

  const customTabs = parseCustomTabs()
  const customButtons = parseCustomButtons()

  // Set active tab jika belum diset
  if (activeTab === "" && customTabs.length > 0) {
    setActiveTab(customTabs[0].id)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header
          navItems={navItems}
          ctaText="Hubungi Kami"
          ctaHref="/contact"
        />

      {/* Breadcrumb */}
      <section style={{ backgroundColor: bgColor }} className="pt-28 pb-4">
        <PageTransition>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm" style={{ color: `${titleColor}80` }}>
              <Link href="/" className="hover:opacity-70">
                Home
              </Link>
              <span>/</span>
              <Link href="/portfolio" className="hover:opacity-70">
                Portfolio
              </Link>
              <span>/</span>
              <span style={{ color: titleColor }} className="font-medium capitalize">
                {title}
              </span>
            </nav>
          </div>
        </PageTransition>
      </section>

      {/* Hero Section */}
      <section style={{ backgroundColor: bgColor }} className="py-8 md:py-16 flex-1 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="hidden md:block absolute top-20 right-20 w-32 h-32 opacity-5 animate-float-up" style={{ 
          backgroundColor: buttonColor,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        }}></div>
        <div className="hidden md:block absolute bottom-20 left-10 w-24 h-24 opacity-3 animate-float-up" style={{ 
          backgroundColor: buttonColor,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          animationDelay: '0.5s'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <PageTransition delay={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
              {/* Image with frame - shown first on mobile */}
              {imageUrl && (
                <div
                  className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden p-1 group order-first lg:order-last animate-in fade-in slide-in-from-top-8 lg:slide-in-from-right-8 duration-700 hover:shadow-2xl transition-all"
                  style={{ backgroundColor: buttonColor }}
                >
                  <div className="relative w-full h-full rounded-lg md:rounded-xl overflow-hidden">
                    <Image 
                      src={imageUrl || "/placeholder.svg"} 
                      alt={title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      unoptimized 
                    />
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="order-last lg:order-first animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-left-8 duration-700">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-3"
                    style={{ backgroundColor: `${buttonColor}15` }}
                  >
                    <DynamicIcon name={icon} color={buttonColor} size={28} className="md:hidden" />
                    <DynamicIcon name={icon} color={buttonColor} size={32} className="hidden md:block" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 md:mb-4 capitalize" style={{ color: titleColor }}>
                  {title}
                </h1>

                {subtitle && subtitle !== "-" && (
                  <p className="text-base md:text-xl mb-4 md:mb-6" style={{ color: buttonColor }}>
                    {subtitle}
                  </p>
                )}

                <p className="text-sm md:text-lg leading-relaxed mb-6 md:mb-8" style={{ color: textColor }}>
                  {description || `Detail portfolio ${title}.`}
                </p>

                {/* Custom Buttons - stacked on mobile */}
                {customButtons.length > 0 && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                    {customButtons.map((btn, index) => (
                      <Link
                        key={index}
                        href={btn.link !== "-" ? btn.link : "/contact"}
                        className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group text-sm md:text-base"
                        style={{
                          backgroundColor: btn.color !== "-" ? btn.color : buttonColor,
                          color: btn.textColor !== "-" ? btn.textColor : "#ffffff",
                        }}
                      >
                        <span>{btn.text}</span>
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </PageTransition>

          {/* Custom Tabs */}
          {customTabs.length > 0 && (
            <PageTransition delay={200}>
              <div className="mt-10 md:mt-16">
                {/* Tab Headers - scrollable on mobile */}
                <div className="flex overflow-x-auto gap-1 md:gap-2 border-b mb-6 md:mb-8 pb-0 scrollbar-hide" style={{ borderColor: `${titleColor}20` }}>
                  {customTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="px-4 md:px-6 py-2.5 md:py-3 font-medium transition-all duration-300 relative whitespace-nowrap text-sm md:text-base hover:bg-gray-50 rounded-t-lg"
                      style={{
                        color: activeTab === tab.id ? buttonColor : `${titleColor}80`,
                        backgroundColor: activeTab === tab.id ? `${buttonColor}08` : "transparent",
                      }}
                    >
                      {tab.label}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                        style={{ 
                          backgroundColor: buttonColor,
                          transform: activeTab === tab.id ? "scaleX(1)" : "scaleX(0)",
                          transformOrigin: "center"
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {customTabs.map((tab) => (
                  <div 
                    key={tab.id} 
                    className={`${activeTab === tab.id ? "block animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}`}
                  >
                    <div className="flex flex-col gap-2 md:gap-3">
                      {tab.items.map((item, index) => {
                        const isExpanded = expandedItems[`${tab.id}-${index}`]
                        const hasPoints = item.points.length > 0

                        return (
                          <div
                            key={index}
                            className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group"
                            style={{ 
                              backgroundColor: cardColor,
                              borderLeft: isExpanded ? `3px solid ${buttonColor}` : "3px solid transparent"
                            }}
                          >
                            {/* Dropdown Header */}
                            <button
                              onClick={() => hasPoints && toggleExpand(tab.id, index)}
                              className={`w-full flex items-center justify-between gap-3 md:gap-4 p-3 md:p-4 text-left ${hasPoints ? "cursor-pointer" : "cursor-default"} transition-all duration-300`}
                              style={{
                                backgroundColor: isExpanded ? `${buttonColor}05` : "transparent"
                              }}
                            >
                              <div className="flex items-center gap-3 md:gap-4">
                                <div
                                  className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                  style={{ backgroundColor: `${buttonColor}20` }}
                                >
                                  <DynamicIcon name={item.icon || "layers"} color={buttonColor} size={16} className="md:hidden" />
                                  <DynamicIcon name={item.icon || "layers"} color={buttonColor} size={18} className="hidden md:block" />
                                </div>
                                <span className="font-medium text-sm md:text-lg transition-all duration-300 group-hover:translate-x-1" style={{ color: titleColor }}>
                                  {item.title}
                                </span>
                              </div>
                              {hasPoints && (
                                <div 
                                  className="transition-transform duration-300"
                                  style={{ 
                                    color: buttonColor,
                                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                              )}
                            </button>

                            {/* Dropdown Content */}
                            {isExpanded && hasPoints && (
                              <div 
                                className="border-t transition-all duration-300 overflow-hidden"
                                style={{ borderColor: `${buttonColor}20` }}
                              >
                                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                                  {item.points.map((point, pointIndex) => (
                                    <div key={pointIndex} className="flex items-start gap-2 md:gap-3">
                                      <div 
                                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                        style={{ backgroundColor: buttonColor }}
                                      />
                                      <span className="text-sm md:text-base" style={{ color: textColor }}>
                                        {point}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </PageTransition>
          )}
        </div>
      </section>

      <Footer
          footerLinks={footerLinks}
          socialLinks={socialLinks}
        />
    </main>
  )
}
