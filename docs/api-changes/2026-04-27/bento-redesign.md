# Bento UI Redesign + Deployment Config

**Date:** 2026-04-27  
**Scope:** Frontend only (no API changes)

## Changes

### Design System Migration
- **FROM:** IBM Plex Mono font, pink primary (`#db2777`)
- **TO:** Bento design system — Inter + JetBrains Mono, peach/slate palette

### Color Tokens (tailwind.config.ts)
| Token | Value |
|---|---|
| `primary` | `#FAD4C0` (peach) |
| `secondary` | `#80A1C1` (steel blue) |
| `surface` | `#FFF5E6` (warm cream) |
| `success` | `#16A34A` |
| `warning` | `#D97706` |
| `danger` | `#DC2626` |

### Files Modified
- `vite.config.ts` — added `server.port: 5050`, `preview.port: 5050`
- `tailwind.config.ts` — Bento color tokens + Inter/JetBrains Mono fonts
- `index.html` — Inter + JetBrains Mono from Google Fonts
- `src/index.css` — base body styles (`#FFF5E6` bg, `#111827` text, Inter font)
- `src/layouts/AuthLayout/AuthLayout.tsx` — full split-screen bento layout (dark left panel + cream right panel)
- `src/pages/LoginPage/LoginPage.tsx` — Bento input/button styles
- `src/pages/RegisterPage/RegisterPage.tsx` — Bento input/button styles
- `src/pages/OtpVerificationPage/OtpVerificationPage.tsx` — ShieldCheck icon, Bento styles
- `src/pages/ForgotPasswordPage/ForgotPasswordPage.tsx` — Mail icon, Bento styles
- `src/pages/ResetPasswordPage/ResetPasswordPage.tsx` — KeyRound icon, Bento styles
- `src/pages/DashboardPage/DashboardPage.tsx` — full bento dashboard with stat cards + placeholder charts

### Files Created
- `vercel.json` — SPA rewrite rules for Vercel deployment
- `.gitignore` — standard Vite gitignore

### TypeScript
- `npx tsc --noEmit` → 0 errors
