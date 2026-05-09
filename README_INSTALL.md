# 🔥 SAYBA ARC — Cyberpunk Hero Update

## What changed

| File | Action |
|------|--------|
| `components/hero.tsx` | **REPLACED** — full scroll-driven cyberpunk map experience |
| `app/page.tsx` | Updated — removed `min-h-screen flex-col` wrapper that would clip the hero |
| `components/header.tsx` | Updated — dark theme, cyan border, backdrop-blur |
| `app/globals.css` | Extended — scan beam, blink, neon-pulse keyframes |
| `package.json` | Added `framer-motion ^11.2.0` |

## Install framer-motion

```bash
npm install framer-motion
# or
yarn add framer-motion
# or
pnpm add framer-motion
```

## How the scroll sequence works

| Scroll % | What happens |
|----------|-------------|
| 0 – 32%  | Indonesia archipelago overview, zoom starts |
| 32 – 65% | Zooms into Kalimantan, province boundary appears |
| 65 – 85% | Zooms into Pontianak, marker + HUD data panel lock on |
| 85 – 93% | Map dims, hero content fades in from left |
| 93 – 100% | Full content visible, scroll into next sections |

The hero takes `300vh` of scroll space (`height: 300vh` wrapper + `sticky` inner panel).

## Tips

- The map is pure SVG — no external map tile libraries needed.
- All animations are GPU-composited (`transform`, `opacity`) via Framer Motion's `useTransform`.
- To tweak zoom intensity, edit the `S1 / S2 / S3` constants at the top of `hero.tsx`.
- To adjust timing, change the breakpoints in the `useTransform` input arrays (the `[0, 0.32, 0.65, 0.85]` values).
