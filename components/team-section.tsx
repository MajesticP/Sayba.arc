"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

function gdriveToImg(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.includes("drive.google.com/uc")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`
  return url
}

export type DeptKey = "lingkungan" | "it" | "kelautan" | null

export interface TimMember {
  id: string
  name: string
  role: string
  bio: string | null
  photo_url: string | null
  github_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  dept: DeptKey
  order_num: number
  status: string
}

const DEPT: Record<string, { label: string; specialty: string; color: string; bg: string }> = {
  lingkungan: { label: "Teknik Lingkungan", specialty: "Pemetaan ArcGIS & Analisis Spasial", color: "#16a34a", bg: "#f0fdf4" },
  it:         { label: "IT & Digital",       specialty: "Web, Mobile, ML & Data Science",    color: "#2563eb", bg: "#eff6ff" },
  kelautan:   { label: "Teknik Kelautan",    specialty: "Desain & Gambar Teknik Kapal",      color: "#0891b2", bg: "#ecfeff" },
  other:      { label: "Lainnya",            specialty: "",                                  color: "#ff914d", bg: "#fff7ed" },
}
const DEPT_ORDER = ["lingkungan", "it", "kelautan"]

const ALL_DEPTS = [
  { key: "lingkungan", label: "Teknik Lingkungan" },
  { key: "it",         label: "IT & Digital" },
  { key: "kelautan",   label: "Teknik Kelautan" },
]

function Avatar({ name, color, size }: { name: string; color: string; size: number }) {
  const initials = name.split(" ").filter((w: string) => !["Tim","dan","&","dan"].includes(w)).slice(0,2).map((w: string) => w[0].toUpperCase()).join("")
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#fff",
      letterSpacing: "-0.5px", userSelect: "none",
    }}>
      {initials}
    </div>
  )
}

function GithubIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> }
function LinkedinIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> }
function InstagramIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> }

// ── Profile Modal — bottom sheet on mobile, centered on desktop ───────────
function ProfileModal({ member, color, onClose }: { member: TimMember; color: string; onClose: () => void }) {
  const photoSrc = gdriveToImg(member.photo_url)
  const hasSocials = member.github_url || member.linkedin_url || member.instagram_url
  const deptCfg = DEPT[member.dept ?? "other"] ?? DEPT.other

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = "" }
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)",
      animation: "mfade .18s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff",
        borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 460,
        overflow: "hidden",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        animation: "mup .26s cubic-bezier(.16,1,.3,1)",
        maxHeight: "92dvh", overflowY: "auto",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 2 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#ddd" }} />
        </div>

        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}66)` }} />

        <div style={{ padding: "24px 24px 18px", textAlign: "center", position: "relative" }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16, width: 32, height: 32,
            borderRadius: "50%", background: "rgba(0,0,0,0.07)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div style={{
            width: 84, height: 84, borderRadius: "50%", overflow: "hidden", position: "relative",
            border: `3px solid ${color}`, margin: "0 auto",
            boxShadow: `0 0 0 6px ${color}18`, background: "#f0f0f0",
          }}>
            {photoSrc
              ? <Image src={photoSrc} alt={member.name} fill className="object-cover" sizes="84px" unoptimized />
              : <Avatar name={member.name} color={color} size={84} />
            }
          </div>

          <div style={{
            display: "inline-block", marginTop: 12,
            padding: "3px 12px", borderRadius: 50,
            background: `${color}12`, border: `1px solid ${color}30`,
            fontSize: 11, fontWeight: 700, color, letterSpacing: "0.05em", textTransform: "uppercase" as const,
          }}>
            {deptCfg.label}
          </div>

          <h3 style={{ margin: "10px 0 3px", fontSize: 19, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.4px" }}>
            {member.name}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "#777", fontWeight: 500 }}>{member.role}</p>
        </div>

        <div style={{ height: 1, background: "#f0f0f0", margin: "0 24px" }} />

        <div style={{ padding: "18px 24px 32px" }}>
          {member.bio
            ? <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.75, color: "#555" }}>{member.bio}</p>
            : <p style={{ margin: "0 0 18px", fontSize: 13, color: "#bbb", fontStyle: "italic" }}>Tidak ada bio tersedia.</p>
          }
          {hasSocials && (
            <div style={{ display: "flex", gap: 8 }}>
              {member.github_url && (
                <a href={member.github_url} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 14px", borderRadius: 12, background: "#111", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <GithubIcon /> GitHub
                </a>
              )}
              {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 14px", borderRadius: 12, background: "#0077B5", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <LinkedinIcon /> LinkedIn
                </a>
              )}
              {member.instagram_url && (
                <a href={member.instagram_url} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <InstagramIcon /> Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes mfade { from{opacity:0} to{opacity:1} }
        @keyframes mup { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  )
}

// ── MOBILE: compact tap card ───────────────────────────────────────────────
function MobileCard({ member, color, onClick }: { member: TimMember; color: string; onClick: () => void }) {
  const photoSrc = gdriveToImg(member.photo_url)
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff", border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 16, padding: "14px 10px",
        cursor: "pointer", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        width: "100%", minHeight: 130,
        WebkitTapHighlightColor: "transparent",
        transition: "transform .12s, box-shadow .12s",
        userSelect: "none",
      }}
      onPointerDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
      onPointerUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)" }}
      onPointerLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)" }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: "50%", overflow: "hidden",
        position: "relative", background: "#f0f0f0",
        border: `2px solid ${color}35`, marginBottom: 8, flexShrink: 0,
      }}>
        {photoSrc
          ? <Image src={photoSrc} alt={member.name} fill className="object-cover" sizes="54px" unoptimized />
          : <Avatar name={member.name} color={color} size={54} />
        }
      </div>
      <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
        {member.name}
      </p>
      <p style={{ margin: 0, fontSize: 10, color: "#999", fontWeight: 500, lineHeight: 1.3 }}>
        {member.role}
      </p>
      {(member.github_url || member.linkedin_url || member.instagram_url) && (
        <div style={{ display: "flex", gap: 3, marginTop: 6, color: "#ccc" }}>
          {member.github_url    && <GithubIcon />}
          {member.linkedin_url  && <LinkedinIcon />}
          {member.instagram_url && <InstagramIcon />}
        </div>
      )}
    </button>
  )
}

// ── MOBILE: dept tabs + 2-col grid ────────────────────────────────────────
function MobileTeam({ grouped, keys, onSelect }: {
  grouped: Record<string, TimMember[]>
  keys: string[]
  onSelect: (m: TimMember) => void
}) {
  const [activeKey, setActiveKey] = useState(keys[0] ?? "")
  const activeCfg = DEPT[activeKey] ?? DEPT.other
  const members = [...(grouped[activeKey] ?? [])].sort((a, b) => a.order_num - b.order_num)

  return (
    <div>
      {/* Scrollable dept tabs */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2,
        marginBottom: 18, scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        {keys.map(k => {
          const cfg = DEPT[k] ?? DEPT.other
          const isActive = k === activeKey
          return (
            <button
              key={k}
              onClick={() => setActiveKey(k)}
              style={{
                flexShrink: 0, padding: "8px 15px", borderRadius: 50,
                border: `1.5px solid ${isActive ? cfg.color : "rgba(0,0,0,0.1)"}`,
                background: isActive ? cfg.color : "#fff",
                color: isActive ? "#fff" : "#666",
                fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap" as const,
                transition: "all .15s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {cfg.label}
              <span style={{
                marginLeft: 5, fontSize: 10.5,
                background: isActive ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.08)",
                borderRadius: 50, padding: "1px 6px", fontWeight: 600,
              }}>
                {grouped[k]?.length ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {activeCfg.specialty && (
        <p style={{ fontSize: 12, color: "#aaa", marginBottom: 12, textAlign: "center", margin: "0 0 12px" }}>
          {activeCfg.specialty}
        </p>
      )}

      {/* 2-col card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {members.map(m => (
          <MobileCard key={m.id} member={m} color={activeCfg.color} onClick={() => onSelect(m)} />
        ))}
      </div>

      <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#ccc", fontWeight: 600 }}>
        Ketuk kartu untuk profil lengkap
      </p>
    </div>
  )
}

// ── DESKTOP org card ───────────────────────────────────────────────────────
function OrgCard({
  member, color, size = "md", onClick
}: {
  member: TimMember; color: string; size?: "lg" | "md" | "sm"; onClick: () => void
}) {
  const photoSrc = gdriveToImg(member.photo_url)
  const avatarSize = size === "lg" ? 72 : size === "md" ? 56 : 48
  const cardW = size === "lg" ? 200 : size === "md" ? 176 : 160

  return (
    <button
      onClick={onClick}
      style={{
        width: cardW, background: "#fff",
        border: `1px solid rgba(0,0,0,0.08)`,
        borderRadius: 16, padding: size === "lg" ? "20px 16px 16px" : "16px 12px 14px",
        cursor: "pointer", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        transition: "transform .22s cubic-bezier(.16,1,.3,1), box-shadow .22s, border-color .22s",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.1), 0 0 0 1.5px ${color}40`
        e.currentTarget.style.borderColor = `${color}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color, marginBottom: 10, lineHeight: 1 }}>
        {member.role}
      </div>
      <div style={{
        width: avatarSize, height: avatarSize, borderRadius: "50%", overflow: "hidden",
        position: "relative", background: "#f0f0f0",
        border: `2.5px solid ${color}40`, boxShadow: `0 0 0 4px ${color}10`,
        marginBottom: 10, flexShrink: 0,
      }}>
        {photoSrc
          ? <Image src={photoSrc} alt={member.name} fill className="object-cover" sizes={`${avatarSize}px`} unoptimized />
          : <Avatar name={member.name} color={color} size={avatarSize} />
        }
      </div>
      <p style={{ margin: 0, fontSize: size === "lg" ? 13.5 : 12.5, fontWeight: 700, color: "#111", letterSpacing: "-0.2px", lineHeight: 1.35 }}>
        {member.name}
      </p>
      {(member.github_url || member.linkedin_url || member.instagram_url) && (
        <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center", color: "#ccc" }}>
          {member.github_url    && <GithubIcon />}
          {member.linkedin_url  && <LinkedinIcon />}
          {member.instagram_url && <InstagramIcon />}
        </div>
      )}
    </button>
  )
}

function DeptOrgBlock({ deptKey, members, onSelect }: {
  deptKey: string; members: TimMember[]; onSelect: (m: TimMember) => void
}) {
  const cfg = DEPT[deptKey] ?? DEPT.other
  const sorted = [...members].sort((a, b) => a.order_num - b.order_num)
  const [leader, ...rest] = sorted
  const LINE_COLOR = `${cfg.color}50`

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        padding: "6px 18px", borderRadius: 50, marginBottom: 24,
        background: cfg.bg, border: `1.5px solid ${cfg.color}30`,
        fontSize: 11.5, fontWeight: 800, color: cfg.color,
        letterSpacing: "0.06em", textTransform: "uppercase" as const,
      }}>
        {cfg.label}
      </div>
      {leader && <OrgCard member={leader} color={cfg.color} size="lg" onClick={() => onSelect(leader)} />}
      {rest.length > 0 && leader && <div style={{ width: 2, height: 32, background: LINE_COLOR, flexShrink: 0 }} />}
      {rest.length > 0 && (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {rest.length > 1 && (
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: `calc(100% - 80px)`, height: 2, background: LINE_COLOR, zIndex: 0 }} />
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center", position: "relative" }}>
            {rest.map(m => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 24, background: LINE_COLOR }} />
                <OrgCard member={m} color={cfg.color} size="md" onClick={() => onSelect(m)} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 18, fontSize: 11, fontWeight: 600, color: "#aaa", padding: "3px 10px", borderRadius: 50, background: "#f5f5f5" }}>
        {members.length} anggota
      </div>
    </div>
  )
}

function FlatGrid({ members, onSelect }: { members: TimMember[]; onSelect: (m: TimMember) => void }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" as const, justifyContent: "center" }}>
      {members.map(m => (
        <OrgCard key={m.id} member={m} color={DEPT.other.color} size="md" onClick={() => onSelect(m)} />
      ))}
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function TeamSection({ team }: { team: TimMember[] }) {
  const [selected, setSelected] = useState<TimMember | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const hasDeptInfo = team.some(m => m.dept)

  const grouped: Record<string, TimMember[]> = {}
  for (const m of team) {
    const k = m.dept ?? "other"
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(m)
  }

  const keys: string[] = []
  for (const k of DEPT_ORDER) if (grouped[k]) keys.push(k)
  for (const k of Object.keys(grouped)) if (!keys.includes(k)) keys.push(k)

  const color = selected?.dept ? (DEPT[selected.dept]?.color ?? DEPT.other.color) : DEPT.other.color

  if (team.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>
        <p style={{ margin: 0, fontSize: 14 }}>Belum ada anggota tim. Tambahkan dari dashboard admin.</p>
      </div>
    )
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* MOBILE */}
      {isMobile ? (
        hasDeptInfo
          ? <MobileTeam grouped={grouped} keys={keys} onSelect={setSelected} />
          : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {team.map(m => <MobileCard key={m.id} member={m} color={DEPT.other.color} onClick={() => setSelected(m)} />)}
            </div>
          )
      ) : (
        /* DESKTOP — original org chart */
        <>
          {hasDeptInfo && (
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 40 }}>
              {ALL_DEPTS.filter(d => grouped[d.key]?.length).map(d => (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: DEPT[d.key].color }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#666" }}>{d.label}</span>
                </div>
              ))}
            </div>
          )}
          {hasDeptInfo ? (
            <div style={{ display: "flex", gap: 0, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" as const, position: "relative" }}>
              {keys.map((k, i) => (
                <div key={k} style={{ display: "flex", alignItems: "flex-start" }}>
                  {i > 0 && <div style={{ width: 1, background: "#e8e8e8", alignSelf: "stretch", margin: "0 32px", flexShrink: 0, minHeight: 200 }} />}
                  <DeptOrgBlock deptKey={k} members={grouped[k]} onSelect={setSelected} />
                </div>
              ))}
            </div>
          ) : (
            <FlatGrid members={team} onSelect={setSelected} />
          )}
        </>
      )}

      {selected && <ProfileModal member={selected} color={color} onClose={() => setSelected(null)} />}
    </>
  )
}
