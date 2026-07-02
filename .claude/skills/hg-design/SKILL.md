---
name: hg-design
description: Honest Greens design system distilled from real app screenshots — the aesthetic target for Real Food (iphone.html). Use whenever restyling or adding UI to the app, choosing colors/typography/spacing, or designing a new component or interaction, so everything stays coherent with the HG look. Covers palette, type, component recipes, spacing rhythm, and motion rules, plus the semantic mapping (HG sells food; we track a menu).
---

# Honest Greens → Real Food design system

Distilled from 6 real HG app screenshots (menu grid, product detail ×2,
filter overlay, side drawer, detail-with-extras). This is the aesthetic
contract: every new or restyled piece of UI in `iphone.html` should be
derivable from these rules.

## 1. Palette

| Token | Value | Use |
|---|---|---|
| Page off-white | `#F4F2EB` | List/grid screen background (never pure white behind cards) |
| Photo beige | `#E8E4D9` | Product image canvases: card tops, detail hero, thumbnails |
| Card white | `#FFFFFF` | Info zones of cards, detail body, sheet bodies |
| Ink | `#131311` (app `--ink`) | Text, CTA pills, active states, filled icons |
| Lime accent | `--lime` (#C7F23E) | ONE small accent at a time: "new" badge, active filter chip, highlight. Never large surfaces |
| Muted gray | `--muted` | Descriptions, metadata (allergens, units), inactive tabs |
| Black overlay | `#000` | Full-bleed headers, the FILTRAR expanding panel, drawer header block |
| Warning amber | `#E8A13D`-ish | Only for state notices ("cocina cerrada") |

Rule: color hierarchy is **black on white on beige on off-white**, with lime
as a scarce reward. HG never uses borders to separate surfaces — it uses
background-color changes and hairlines (`rgba(0,0,0,0.08)`).

## 2. Typography

- **Display**: very heavy grotesque (app: Archivo 800/900), UPPERCASE,
  tight line-height (~1.02), slight negative tracking. Used for: product
  names, section headers ("ESCOGE TUS EXTRAS", "TOTAL", "FILTRAR"),
  prices/kcal figures.
- **Body**: regular humanist sans (app: Inter 400–600), sentence case,
  relaxed line-height (~1.5). Descriptions, list rows.
- **Metadata**: same body font, gray, smaller ("Alérgenos: …").
- Category tabs are **sentence case** ("Bebidas", "Salsas"), bold when
  active, gray when not.
- Numbers (prices → for us kcal/grams) are display-bold, comma decimals.

## 3. Component recipes

### Product card (2-col grid)
Radius ~20–24. Top: beige canvas, product floats centered with soft
drop-shadow, ~1:1 ratio. Optional lime circular badge top-left (28px, icon
inside). Bottom: white, UPPERCASE bold name (16–18px), then price/kcal
bold after a **large gap** (name top-anchored, figure bottom-anchored —
cards in a row keep figures aligned).

### Detail screen
Full-bleed beige hero (~45vh) with plain `←` top-left (no circle). White
body: UPPERCASE title (26px) → bold figure (price/kcal) → gray description
→ gray metadata line → outline tag chips. Hairline divider before the
TOTAL/summary block. Sticky bottom CTA: **black pill, full width**, white
bold label "+ Acción", with a **nested darker pill on the right** holding
the figure (`rgba(255,255,255,0.14)` bg). Disabled = whole pill ~35%
opacity + notice line underneath.

### Tag chips (diet/allergen style)
Rounded-square OUTLINE, 2px ink border, radius ~10, ~44px, bold 2-letter
code inside ("PB", "VE"). On black surfaces: white border/text, gray when
inactive.

### Quantity stepper
`⊖  [01]  ⊕` — outline circles (minus gray, plus ink) + boxed 2-digit
count (2px ink border, radius 10).

### Extras row ("ESCOGE TUS EXTRAS")
Section header in display caps. Horizontal scroll of plain items (no card
chrome): circular photo (~84px, beige bg), centered 2-line name (12px),
`+ 2,75€` bold beneath (for us: `+ NN kcal`). Selection = ink ring/check.

### FILTRAR panel
Expands **from the top, black, full-width**, pushing/overlaying under the
status bar. White display-caps title + ✕ right. Gray explainer paragraph.
Grid of outline chips (tag style + label). "🗑 Resetear filtros" as quiet
gray text-button. Content below (category tabs + list) stays visible.

### Category tab bar
White bg, horizontal scroll, sentence-case bold text; active = ink +
2–3px ink underline flush with a hairline that spans the full bar width.

### Side drawer
Black header block (photo avatar + UPPERCASE bold white name + gray
action link) then white list: icon + 17px medium label per row, generous
row height (~88px), full-width hairlines BETWEEN rows, lime "Nuevo" pill
inline where relevant. Footer: small social/link icons.

## 4. Spacing rhythm

- Screen gutter: 20px. Card grid gap: 12–16px.
- **Group breaks read ~3× the in-group gap**: when the category of items
  changes mid-list, insert extra vertical air (in-app: `.cat-gap` spacer li).
- Section headers get big top margins (~24–28px) and modest bottoms (~14px).
- Hairlines (`1px rgba(0,0,0,0.08–0.14)`) separate stacked rows; never
  boxed borders.

## 5. Motion & mechanics (the "fluid" feel)

- **Header hides on scroll down, returns on scroll up** (list screens):
  the black top bar slides away leaving only the white category bar
  pinned; ~0.3s ease-out. (In-app: `.sheet-head-sticky.bar-hidden`.)
- Tab underline **slides** between tabs (never jumps).
- Panels expand with `grid-template-rows 0fr→1fr` (calendar effect) —
  used by day picker, gram panel, FILTRAR.
- Sheets/modals slide from bottom with `cubic-bezier(.22,.61,.36,1)`,
  dismissible by pull-down that follows the finger.
- Every tappable thing compresses on `:active` (scale 0.94–0.98).
- Lists entering a screen get a subtle staggered rise (translateY 14px →
  0, ~40ms/card, cap ~8 cards). Respect `prefers-reduced-motion`.
- Numbers/rings animate to their value on render (existing pattern).

## 6. Semantic mapping HG → Real Food

| Honest Greens | Real Food |
|---|---|
| Product / dish | Food / recipe |
| Price ("4,25€") | kcal (and grams where relevant) |
| "+ Añadir al carrito" | "+ Añadir al menú" |
| Extras with `+price` | Extra foods with `+kcal` added into the recipe |
| Diet filter (Keto/PB…) | Sort/filter by macro (proteínas, carbs, grasas, kcal) |
| "Cocina cerrada" notice | (n/a — no ordering) |
| Cart | Compra (shopping list) |

Keep the HG *shape* of each element but never fake commerce: no prices,
no stock states. Figures shown are always nutrition.
