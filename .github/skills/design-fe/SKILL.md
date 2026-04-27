---
name: bento
description: Modular grid layout with card-like blocks, clear hierarchy, soft spacing, and subtle visual contrast for organized, scannable interfaces.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# Bento Design System Skill (Universal)

## Mission
You are an expert design-system guideline author for Bento.
Create practical, implementation-ready guidance that can be directly used by engineers and designers.

## Brand
Clean, white-first SaaS design. White surfaces dominate. Accent colors are used purposefully — never as backgrounds for large areas. The result should feel like a professional enterprise web app (Linear, Vercel, Notion aesthetic).

## Style Foundations
- Visual style: modern, minimal, white-first SaaS
- Typography scale: 12/14/16/20/24/32 | Fonts: primary=Inter, mono=JetBrains Mono | weights=400, 500, 600, 700, 800
- Color palette:
  - `bg`: `#FFFFFF` — primary surface, cards, modals, inputs
  - `bg-page`: `#F9FAFB` — page background, subtle contrast behind cards
  - `bg-subtle`: `#F3F4F6` — hover states, disabled inputs, secondary sections
  - `primary`: `#80A1C1` — interactive elements (focus rings, links, active states)
  - `primary-dark`: `#4d7fa3` — hover on primary interactive
  - `accent`: `#FAD4C0` — decorative accents, icon backgrounds, badges only; NEVER as large-area bg
  - `text`: `#111827` — primary text
  - `text-muted`: `#6B7280` — secondary text, placeholders, labels
  - `border`: `#E5E7EB` — default borders, dividers
  - `border-focus`: `#80A1C1` — focus state border
  - `success`: `#16A34A`
  - `warning`: `#D97706`
  - `danger`: `#DC2626`
  - `dark-panel`: `#0F172A` — used sparingly for dark mode sections
- Spacing scale: 4/8/12/16/24/32/48

## Layout Rules
- Page background: always `#F8FAFC` (slate-50)
- Card background: always `#FFFFFF` with `border border-slate-200` and `shadow-sm`
- Auth layout: Centered floating white card (rounded-2xl). Left panel (white, form area) + Right panel (light slate-50/50, branding with red/slate accents).
- Dashboard: white topbar with `border-b border-slate-200`, `#F8FAFC` body, white bento cards

## Component Standards

### Inputs
- Background: `#FFFFFF`
- Border: `border border-[#E5E7EB]`
- Radius: `rounded-lg` (8px)
- Focus: `focus:border-[#80A1C1] focus:ring-2 focus:ring-[#80A1C1]/20`
- Hover: `hover:border-gray-300`
- Error: `border-danger focus:ring-danger/20`
- Disabled: `bg-[#F3F4F6] opacity-60 cursor-not-allowed`
- Placeholder: `text-gray-400`

### Buttons (primary/CTA)
- Background: `#111827` (dark, not primary color)
- Hover: `#1F2937`
- Radius: `rounded-lg`
- Font: `font-semibold text-sm`
- Text: white
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: spinner inside, text changes

### Buttons (secondary/ghost)
- Border: `border border-[#E5E7EB]`
- Background: `#FFFFFF`
- Hover: `bg-[#F9FAFB]`
- Text: `text-[#374151]`

### Links
- Color: `text-[#80A1C1]`
- Hover: `hover:text-[#4d7fa3] hover:underline`

### Badges / Tags
- Accent badge: `bg-[#FAD4C0]/40 text-[#9a5c3a]` (use for roles, categories)
- Blue badge: `bg-[#80A1C1]/15 text-[#4d7fa3]`
- Neutral badge: `bg-gray-100 text-gray-600`

### Cards (bento)
- Background: `#FFFFFF`
- Border: `border border-slate-200`
- Radius: `rounded-xl` (reduced from 2xl for sharper aesthetic)
- Shadow: `shadow-sm hover:shadow-md`
- Padding: `p-5` or `p-6`

### Icon accent blocks
- Small icon containers: `w-10 h-10 rounded-lg` with subtle backgrounds
- Page-level icons (auth pages): `w-12 h-12 rounded-xl`

## Accessibility
WCAG 2.2 AA, keyboard-first interactions, visible focus states. All text must pass 4.5:1 contrast on white backgrounds.

## Writing Tone
concise, confident, professional — Vietnamese copy for OmniRoute is acceptable.

## Rules: Do
- Use white surfaces for all content areas
- Use `#F8FAFC` as page background
- Use Viettel red (`#DC2626` / `red-600`) for specific brand highlights and accents
- Use `#80A1C1` or `indigo` for interactive states and focus rings
- Maintain consistent `rounded-lg` on inputs/buttons, `rounded-xl` on cards

## Rules: Don't
- NEVER use cream/peach (`#FFF5E6`, `#FAD4C0`) as a page or panel background
- NEVER use pink-based color for buttons or interactive elements
- NEVER mix border-radius styles (don't use `rounded-full` on rectangular inputs)
- NEVER use dark text on colored backgrounds without checking contrast

<!-- TYPEUI_SH_MANAGED_END -->