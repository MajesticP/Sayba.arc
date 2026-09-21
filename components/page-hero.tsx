"use client";

import type React from "react";
import PageTransition from "@/components/page-transition";
import ThreeParticlesBg from "@/components/three-particles-bg";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: PageHeroProps) {
  return (
    <section className={`relative bg-black overflow-hidden min-h-[200px] md:min-h-[420px] flex items-center ${className}`}>
      {/* 3D Particle Background */}
      <ThreeParticlesBg />
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 md:from-black/70 md:via-black/40 md:to-black/85" />
      
      {/* Orange glow accent */}
      <div className="absolute -top-16 right-1/4 w-72 h-72 rounded-full bg-[#ea580c] opacity-[0.08] blur-3xl pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ 
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", 
        backgroundSize: "60px 60px" 
      }} />

      <div className="relative z-10 w-full pt-[80px] pb-5 md:pt-32 md:pb-20">
        <PageTransition>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {eyebrow && (
              <span
                className="inline-block text-[10px] font-bold text-[#ea580c] uppercase tracking-widest mb-1.5 md:mb-2"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {eyebrow}
              </span>
            )}
            <h1
              className="text-[22px] md:text-5xl lg:text-6xl font-extrabold text-white mb-2 md:mb-3 leading-tight tracking-tight"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-white/70 md:text-white/55 text-[13px] md:text-lg max-w-3xl mx-auto leading-relaxed"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
              >
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </PageTransition>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ea580c]/60 to-transparent" />
    </section>
  );
}