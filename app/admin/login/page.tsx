"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Terjadi kesalahan. Coba lagi.")
      setLoading(false)
      return
    }

    router.push("/admin")
    router.refresh()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; min-height: 100vh; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060d1a;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0, 180, 140, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 180, 140, 0.07) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridDrift 30s linear infinite;
        }
        @keyframes gridDrift {
          0% { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0, 200, 160, 0.08);
          animation: ringPulse 8s ease-in-out infinite;
        }
        .ring-1 { width: 700px; height: 700px; top: -200px; right: -200px; animation-delay: 0s; }
        .ring-2 { width: 500px; height: 500px; top: -100px; right: -100px; animation-delay: 1.5s; }
        .ring-3 { width: 300px; height: 300px; top: 0; right: 0; animation-delay: 3s; }
        .ring-4 { width: 600px; height: 600px; bottom: -250px; left: -250px; animation-delay: 2s; }
        .ring-5 { width: 350px; height: 350px; bottom: -120px; left: -120px; animation-delay: 4s; }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }

        .coords {
          position: absolute;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(0, 200, 160, 0.25);
          letter-spacing: 0.05em;
          line-height: 1.8;
        }
        .coords-tl { top: 24px; left: 24px; }
        .coords-br { bottom: 24px; right: 24px; }
        .coords-tr { top: 24px; right: 24px; text-align: right; }

        .crosshair {
          position: absolute;
          width: 60px; height: 60px;
          bottom: 80px; left: 80px;
          opacity: 0.18;
        }
        .crosshair::before, .crosshair::after {
          content: '';
          position: absolute;
          background: #00c8a0;
        }
        .crosshair::before { width: 1px; height: 100%; left: 50%; }
        .crosshair::after { height: 1px; width: 100%; top: 50%; }

        .card {
          position: relative;
          z-index: 10;
          width: min(420px, calc(100vw - 32px));
          padding: 36px 28px;
          background: rgba(8, 18, 36, 0.85);
          border: 1px solid rgba(0, 200, 160, 0.15);
          border-radius: 4px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(0, 200, 160, 0.05),
            0 40px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          opacity: 0;
          transform: translateY(20px);
          animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

        .logo-area { margin-bottom: 40px; display: flex; flex-direction: column; gap: 10px; }
        .logo-badge { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .logo-dot {
          width: 8px; height: 8px;
          background: #00c8a0; border-radius: 50%;
          box-shadow: 0 0 10px #00c8a0;
          animation: dotBlink 2s ease-in-out infinite;
        }
        @keyframes dotBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .logo-name {
          font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700;
          color: #00c8a0; letter-spacing: 0.15em; text-transform: uppercase;
        }
        .page-title { font-size: 26px; font-weight: 300; color: #e8f4f0; letter-spacing: -0.01em; line-height: 1.2; }
        .page-subtitle { font-size: 13px; color: rgba(180, 210, 200, 0.5); margin-top: 6px; }

        .divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, rgba(0, 200, 160, 0.3), transparent);
          margin-bottom: 32px;
        }

        .field { margin-bottom: 20px; }
        .field label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: rgba(0, 200, 160, 0.7);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          background: rgba(0, 200, 160, 0.04);
          border: 1px solid rgba(0, 200, 160, 0.15);
          border-radius: 3px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: #e8f4f0;
          outline: none; transition: all 0.2s ease;
        }
        .field input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .field input:focus {
          border-color: rgba(0, 200, 160, 0.5);
          background: rgba(0, 200, 160, 0.07);
          box-shadow: 0 0 0 3px rgba(0, 200, 160, 0.08);
        }

        .error-box {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          background: rgba(255, 80, 80, 0.08);
          border: 1px solid rgba(255, 80, 80, 0.2);
          border-radius: 3px; margin-bottom: 20px;
          font-size: 13px; color: #ff8080;
          animation: shakeIn 0.3s ease;
        }
        @keyframes shakeIn {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .btn {
          width: 100%; padding: 14px;
          background: #00c8a0; color: #060d1a;
          border: none; border-radius: 3px;
          font-family: 'Space Mono', monospace;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          background: #00dbb0;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0, 200, 160, 0.3);
        }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(6, 13, 26, 0.3);
          border-top-color: #060d1a; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-note {
          margin-top: 28px; text-align: center;
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: rgba(0, 200, 160, 0.25);
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="login-root">
        <div className="grid-bg" />
        <div className="ring ring-1" /><div className="ring ring-2" />
        <div className="ring ring-3" /><div className="ring ring-4" />
        <div className="ring ring-5" />
        <div className="crosshair" />

        <div className="coords coords-tl">0°01'S / 109°19'E<br />PONTIANAK · WKB</div>
        <div className="coords coords-tr">SAYBA ARC<br />RESTRICTED ACCESS</div>
        <div className="coords coords-br">SYS:ADMIN · SUPABASE AUTH</div>

        <div className="card">
          <div className="logo-area">
            <div className="logo-badge">
              <div className="logo-dot" />
              <span className="logo-name">SAYBA ARC</span>
            </div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Masuk dengan akun Supabase Anda</p>
          </div>

          <div className="divider" />

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="error-box">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading}>
              <div className="btn-inner">
                {loading && <div className="spinner" />}
                {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
              </div>
            </button>
          </form>

          <p className="footer-note">SAYBA ARC · ADMIN SYSTEM · SECURE</p>
        </div>
      </div>
    </>
  )
}
