"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react"
import CuttingBoardBackground from "@/components/cutting-board-bg"
import ProcessFlow from "@/components/process-flow"
import type { ContentBlock, Layanan } from "@/lib/database.types"

/** Link Google Drive → proxy gambar lokal */
function gdriveToImg(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

interface Props {
  service: Layanan
  deptLabel: string
  others: Pick<Layanan, "id" | "title" | "slug" | "description" | "image_url" | "dept">[]
}

export default function ServiceDetailClient({ service, deptLabel, others }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const heroImg = gdriveToImg(service.image_url)
  const gallery = (service.gallery ?? []).map(gdriveToImg).filter((u): u is string => !!u)
  const blocks = service.content_blocks ?? []
  const faqs = service.faqs ?? []
  const waText = encodeURIComponent(
    `Halo SAYBA ARC, saya ingin mendiskusikan layanan "${service.title}".\n\nLingkup yang saya butuhkan: `
  )

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative bg-carbon overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-12 md:pt-32 md:pb-16">
          <nav className="flex items-center gap-1.5 text-[12px] text-steel mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-platinum transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <Link href="/services" className="hover:text-platinum transition-colors">Layanan</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-powder truncate max-w-[240px]">{service.title}</span>
          </nav>

          <p className="text-[12px] font-medium text-steel mb-3">{deptLabel}</p>

          <h1 className="text-[24px] leading-[1.18] md:text-[36px] font-bold text-platinum tracking-tight mb-4">
            {service.title}
          </h1>

          {service.description && (
            <p className="text-[14px] md:text-[17px] text-steel leading-relaxed max-w-2xl mb-7">
              {service.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/6287721916495?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-powder text-carbon text-[14px] font-semibold hover:bg-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Diskusikan Layanan Ini
            </a>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-platinum text-[14px] font-semibold hover:bg-white/[0.06] transition-colors"
            >
              Layanan Lain
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ISI ══ */}
      <section className="relative z-10 -mt-6 md:-mt-10 rounded-t-[28px] md:rounded-t-[40px] bg-platinum pb-14 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">

          {/* Gambar utama — hanya bila ada */}
          {heroImg && (
            <figure className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-platinum-line bg-platinum-dim mb-10 md:mb-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </figure>
          )}

          {/* ── Diagram alir proses kerja ── */}
          <ProcessFlow steps={service.process_steps ?? undefined} />

          {/* ── Isi yang disusun admin ── */}
          {blocks.length > 0 && (
            <div className="mt-12 md:mt-16">
              {blocks.map((block, i) => (
                <ContentBlockView key={i} block={block} />
              ))}
            </div>
          )}

          {/* ── Galeri ── */}
          {gallery.length > 0 && (
            <section className="mt-12 md:mt-16">
              <h2 className="text-[18px] md:text-2xl font-bold text-carbon mb-1.5">
                Contoh Hasil Pekerjaan
              </h2>
              <p className="text-[14px] text-slate-brand mb-6">
                Cuplikan keluaran dari layanan ini.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {gallery.map((url, i) => (
                  <figure
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-platinum-line bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Contoh hasil pekerjaan ${service.title} ${i + 1}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* ── FAQ ── */}
          {faqs.length > 0 && (
            <section className="mt-12 md:mt-16">
              <h2 className="text-[18px] md:text-2xl font-bold text-carbon mb-1.5">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-[14px] text-slate-brand mb-6 max-w-2xl">
                Hal yang paling sering ditanyakan klien tentang layanan ini.
              </p>

              <div className="space-y-2.5 max-w-3xl">
                {faqs.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border transition-colors ${
                        isOpen ? "border-steel bg-white" : "border-platinum-line bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="w-full p-4 text-left flex items-start justify-between gap-4"
                      >
                        <span className="text-[14px] font-semibold text-carbon leading-snug">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                            isOpen ? "rotate-180 text-slate-brand" : "text-slate-brand/75"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 -mt-1 text-[14px] text-slate-brand leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Ajakan ── */}
          <div className="mt-12 md:mt-16 relative bg-carbon rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-9">
            <CuttingBoardBackground tone="dark" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="max-w-xl">
                <h2 className="text-[18px] md:text-2xl font-bold text-platinum mb-2">
                  Siap mendiskusikan layanan ini?
                </h2>
                <p className="text-steel text-[14px] md:text-[15px] leading-relaxed">
                  Kirimkan lingkup pekerjaan Anda. Kami balas dengan langkah teknis dan kebutuhan data
                  yang perlu disiapkan.
                </p>
              </div>
              <a
                href={`https://wa.me/6287721916495?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-powder text-carbon text-[14px] font-semibold hover:bg-white transition-colors"
              >
                Hubungi via WhatsApp
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* ── Layanan lain di departemen sama ── */}
          {others.length > 0 && (
            <section className="mt-12 md:mt-16">
              <h2 className="text-[18px] md:text-2xl font-bold text-carbon mb-5">
                Layanan Lain di {deptLabel}
              </h2>
              <div className="space-y-3">
                {others.map((o) => {
                  const img = gdriveToImg(o.image_url)
                  return (
                    <Link
                      key={o.id}
                      href={`/services/${o.slug}`}
                      className="group flex items-center gap-4 bg-white rounded-xl border border-platinum-line p-4 hover:border-steel transition-colors"
                    >
                      <span className="relative w-14 h-14 rounded-lg overflow-hidden bg-platinum-dim shrink-0">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-carbon group-hover:text-slate-brand transition-colors truncate">
                          {o.title}
                        </span>
                        {o.description && (
                          <span className="block text-[13px] text-slate-brand line-clamp-1 mt-0.5">
                            {o.description}
                          </span>
                        )}
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-slate-brand/75 group-hover:text-carbon group-hover:translate-x-1 transition-all shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  )
}

/* ── Render satu blok isi dari admin ───────────────────────────────────── */
function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-[18px] md:text-2xl font-bold text-carbon mt-10 mb-4 pb-2.5 border-b border-platinum-line leading-snug first:mt-0">
        {block.text}
      </h2>
    )
  }

  if (block.type === "image") {
    const src = gdriveToImg(block.image_url ?? null)
    if (!src) return null
    return (
      <figure className="my-7">
        <span className="relative block w-full aspect-[16/9] rounded-xl overflow-hidden border border-platinum-line bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={block.caption ?? ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        </span>
        {block.caption && (
          <figcaption className="text-[13px] text-slate-brand mt-2 text-center">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === "list") {
    const items = (block.text ?? "").split("\n").map((s) => s.trim()).filter(Boolean)
    return (
      <ul className="my-5 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] md:text-[15px] text-slate-brand leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-steel shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  // paragraph
  return (
    <p className="text-[14px] md:text-[16px] text-slate-brand leading-[1.85] my-4 whitespace-pre-line">
      {block.text}
    </p>
  )
}
