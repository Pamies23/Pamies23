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
| Page off-white | `#F8F9F4` | List/grid screen background (never pure white behind cards) — exact hex from the HG app |
| Photo beige | `#EAE7D8` | Product image canvases: card tops, detail hero, thumbnails — exact hex from the HG app |
| Card white | `#FFFFFF` | Info zones of cards, detail body, sheet bodies |
| Ink | `#131311` (app `--ink`) | Text, CTA pills, active states, filled icons |
| Lime accent | `--lime` (#C7F23E) | ONE small accent at a time: "new" badge, active filter chip, highlight. Never large surfaces |
| Muted gray | `--muted` | Descriptions, metadata (allergens, units), inactive tabs |
| Black overlay | `#000` | Full-bleed headers, the FILTRAR expanding panel, drawer header block |
| Intense red | `--red` (#D90429) | Over-goal numbers, destructive actions (user rejected orange-ish reds) |
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
TOTAL/summary block.

### Bottom CTA (shared: home + detail; `.add-cta` / `.rv-cta`)
**Black pill, full width, THIN and LOW** (padding 8px + nested pill,
bottom safe-area+10, side 20): big 19px bold label starting from the LEFT,
optional **nested darker pill on the right** with the figure
(`rgba(255,255,255,0.16)`). Both CTAs identical. They appear ONLY when the
user reaches the bottom of the scroll, sliding up SOLID — no opacity fade
(user rule); 0.4s spring, bottom max(safe-area − 10px, 8px). If the view
doesn't scroll, they show immediately. Never keep them fixed
while browsing — they'd steal content space (user rule).

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

### Macro bars (home)
The ORIGINAL stacked white macro cards on the water region (user tried
Apple-Watch rings twice and reverted): each card = name caps left, bold
value + gray goal right, and a 12px pill track (`rgba(19,19,17,0.14)`)
with TWO segments — lime `.seg` (focused part: selected food or filtered
view) + lime-dim `.seg.rest` (rest of that view). Widths set in rAF after
render so the CSS transition draws them. Tap card = macro filter (card
turns ink). The home date above is display caps in INK over the water
(coral and lime were tried and rejected).
The meal-filter row below the water is a BLACK full-bleed sticky strip
styled EXACTLY like the Alimentos|Recetas header: bold display text tabs
(20px, no boxes/borders), muted gray `rgba(255,255,255,0.42)` at rest and
LIME when selected; symmetric 13px vertical padding. When pinned, the
notch fills BLACK (wrapper ::before) so it melts into the strip — the
outline-chip version with a white notch was tried and replaced by this.
"Limpiar filtros" chip is lime.

### Aisle cards (Compra)
Off-white page; black sticky header holds title + lime `n/m` counter,
lime progress bar, gray meta line and the day chips (dark outline, lime
when selected). Each pending category = white rounded card ("aisle") with
caps header + group total, hairline-separated rows (beige emoji circle,
name, bold grams, check ring → lime when got). Got items live in a final
**black** card "En el carro", struck through; tap returns them. All done →
"🎉 ¡Compra lista!" display banner.

### Action chips (home)
Ink pills (solid) for primary actions; outline (2px inset ring) for
toggles; outline red for destructive. Uppercase 12px display font. The
row hides entirely when no chip is visible (`:has`), so it never leaves a
dead gap above the grid.

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

The user loves the ORDENAR panel's fluidity — these are the EXACT recipes
that produce it. Reuse them verbatim for anything new.

### 5a. Collapsible panel (the one the user loves)
Animates open/closed with dynamic content height, no JS measuring:
```css
.panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.36s cubic-bezier(.22,.61,.36,1); }
.panel.open { grid-template-rows: 1fr; }
.panel-inner { overflow: hidden; min-height: 0; }   /* direct child; content inside */
```
Standardized at **0.36s + cubic-bezier(.22,.61,.36,1)** app-wide (day
picker, gram panel, ORDENAR). Any new expanding UI uses this.

### 5b. Hide-on-scroll header
Slide with `transform` (NEVER margins/height: layout changes feed back
into scroll events and the bar oscillates). Fade the bar too, and paint
the sticky wrapper white so content never shows through the notch strip:
```css
.sticky-head { position: sticky; top: 0; transition: transform 0.34s cubic-bezier(.4,0,.2,1), background-color 0.28s ease; }
.sticky-head.bar-hidden { transform: translateY(calc((var(--tabsH) - env(safe-area-inset-top)) * -1)); background: #fff; }
.sticky-head.bar-hidden .black-bar { opacity: 0; pointer-events: none; }
```
JS: compare `scrollY` deltas (>4px) per direction; always show near top
(`y <= 24`); set `--tabsH` from `offsetHeight` on open/resize.

### 5c. Staggered card entrance
```css
@keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.list.reveal .card { animation: cardIn 0.42s cubic-bezier(.22,.61,.36,1) both; }
/* nth-child delays 0.04s steps, cap at n+8 */
```
Add `.reveal` on open, remove after ~750ms so re-renders don't replay.
Respect `prefers-reduced-motion`.

### 5d. Chip/button appearance
```css
@keyframes chipIn { from { opacity: 0; transform: translateY(6px) scale(0.95); } to { opacity: 1; transform: none; } }
.chip:not(.hidden) { animation: chipIn 0.3s cubic-bezier(.22,.61,.36,1); }
```
(`classList.toggle(c, force)` doesn't mutate when state is unchanged, so
this only replays when a chip actually appears.)

### 5e. Gotchas that break fluidity (learned the hard way)
- **View-enter animations that use `transform` with `fill: both` keep the
  view as a containing block** → `position: fixed` children (bottom CTAs)
  get positioned against the view, not the viewport. Remove the animation
  class on `animationend` (guard `e.target === viewEl`).
- `overflow-x: auto` on a bar clips pseudo-elements hanging above it
  (`bottom: 100%`) — put notch covers on the non-scrolling wrapper.
- Progress fills (rings/bars) rebuild with value 0 in markup, then set the
  real value inside `requestAnimationFrame` so the CSS transition draws it.

### 5f. Overscroll (rubber-band) consistency
Bounce strips must always continue the adjacent content color. The ONLY
technique that works on iOS: two FIXED covers parked just outside the
viewport (`#bounceTop { top: -100vh }`, `#bounceBottom { bottom: -100vh }`,
`height: 100vh; z-index: -1; pointer-events: none`), recolored per view by
`setBounceColors(id)` from the `BOUNCE_COLORS` map in `showView`. iOS drags
fixed elements along with the rubber band, so the cover slides exactly
into the revealed strip; elsewhere they stay invisible and touch nothing.
Two approaches were tried and FAILED — do not reintroduce them:
- `::after` extenders below the page (`top: 100%`): absolutely-positioned
  overflow EXTENDS the document scroll → artificially scrollable blank
  screen (user caught it immediately).
- `::before` extenders above the page: iOS clips painting above the
  document box in standalone, so they simply never show.
For photo regions, sample the RENDERED edge color of the cover-cropped
image (not the raw file's edge row): water top #569897, profile
#89B6A4/#B0E1C0, sim-top #BCDFDB.

### 5g. Other rules
- Tab underline **slides** between tabs (never jumps).
- Sheets/modals slide from bottom, dismissible by pull-down that follows
  the finger.
- Every tappable thing compresses on `:active` (scale 0.94–0.98).

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
