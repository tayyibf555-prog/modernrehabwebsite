# DESIGN.md — Modern Rehab (impeccable variant)

## Color strategy
**Committed.** #E67E2A is load-bearing across 30–50% of surface area, not a 10% accent. The brand is "Modern Rehab in orange," not "dark site with orange highlights."

### Palette (OKLCH-tuned, no `#000`/`#fff`)

| Token | Value | Role |
|---|---|---|
| `--mr-orange` | `oklch(0.69 0.15 50)` (≈ `#E67E2A`) | Brand, drenched sections, hero punctuation, body-map glow |
| `--mr-orange-deep` | `oklch(0.60 0.16 45)` (≈ `#C8651A`) | Pressed states, deeper interactions |
| `--mr-orange-tint` | `oklch(0.96 0.04 65)` | Soft background tint for warm sections |
| `--mr-ink` | `oklch(0.16 0.005 60)` | Body text on light, page background on dark sections |
| `--mr-ink-deep` | `oklch(0.10 0.005 60)` | Deepest panel (booking shell, hero) |
| `--mr-paper` | `oklch(0.97 0.005 65)` | Light section background, reverse-out text on orange |
| `--mr-rule` | `oklch(0.88 0.008 60)` | Borders on light |
| `--mr-rule-dark` | `oklch(0.24 0.005 60)` | Borders on dark |
| `--mr-mute` | `oklch(0.50 0.005 60)` | Secondary text on light |
| `--mr-mute-dark` | `oklch(0.65 0.005 60)` | Secondary text on dark |

All neutrals are tinted toward warm (hue ~60), never neutral grey. No `#000` or `#fff` anywhere.

### Section color rhythm
1. Hero — `--mr-ink-deep` (drenched dark)
2. Body-map nav — `--mr-ink-deep` continuation
3. Approach — `--mr-orange` drenched (signature commitment)
4. About James — `--mr-paper` (relief, breathing room)
5. Services / pricing — `--mr-paper`
6. Booking — `--mr-ink-deep`
7. Cases — `--mr-paper`
8. Testimonials — `--mr-orange-tint`
9. Final CTA — `--mr-orange` drenched
10. Location + footer — `--mr-ink-deep`

The page alternates dark / light / orange with intent. No section is "default cream."

## Typography
Three reflex fonts for this brief were Manrope (current), Inter, DM Sans. All trained-data defaults. Rejected.

### Stack
- **Display** — **Boldonse** (Google Fonts). Heavy condensed display, almost industrial signage feel. Used for the hero H1 only — single oversized "Modern rehab for [stubborn back pain]."
- **Body & UI** — **Switzer** (Fontshare, free for web). Humanist sans, warm, opinionated terminals. 400 / 500 / 600 / 700.
- **Mono labels** — **Geist Mono** (Vercel, free). Cleaner than JetBrains Mono, more contemporary. Used for case-file labels, metadata, eyebrow tags.
- **Signature** — **Caveat** (Google Fonts, kept from existing identity). For James's signature only, nowhere else.

Pairing logic: Boldonse muscular display + Switzer humanist body + Geist Mono clinical metadata = "muscular / direct / considered". Caveat is the one human/handwritten note in an otherwise precise system.

### Scale (clamp, modular ≥1.25)
- H1: `clamp(56px, 9vw, 144px)` — hero only
- H2: `clamp(34px, 5vw, 68px)`
- H3: `clamp(22px, 2.4vw, 32px)`
- Body: 16px / 1.55
- Mono labels: 11–12px, tracking 0.14em, uppercase
- Body cap: 65ch

Line-height on dark: +0.05 (Switzer reads thin in reverse).

## Layout
- Max width 1280px. Side padding `clamp(20px, 4vw, 64px)`.
- Asymmetric grids for content sections; full-bleed for drenched sections.
- No "card grid of similar tiles" anywhere on the page. Services list is a structured row layout. Case studies are file-tab folders (asymmetric, not equal-sized cards).
- Spacing rhythm varies: tight in the hero, generous in the body-map, snug in the case files, expansive in the final CTA.

## Motion
- Ease-out-quart for most transitions: `cubic-bezier(0.165, 0.84, 0.44, 1)`.
- Hero H1 bracket rotation: 4-second hold, 480ms typewriter erase + 480ms retype with monospaced character interval. Looks mechanical, not playful.
- Body-map region hover: 200ms glow on `filter` and `fill`. No layout animation.
- Page entrance: a single short reveal on the H1 (character stagger ~14ms), nothing else. Restraint.
- IntersectionObserver-driven reveals for sections below the fold: 600ms opacity + 16px translateY, ease-out-quart.

## Components (the signature moves)

### 1. The body-map
- Two SVG body diagrams (front + back), drawn in a Frank-Netter-plate aesthetic — clinical, anatomical, not iconic.
- Regions are individual `<path>` elements with `data-region="back|neck|knee|hip|shoulder|head|elbow|wrist|ankle"`.
- Default state: regions are subtle outlines on dark.
- Hover: region fills with `--mr-orange` at 0.12 opacity + 1px orange stroke. Cursor changes to crosshair.
- Click: region fills solid orange, the adjacent data-panel updates to show case count, James's typical treatment plan, and a CTA "See cases for [region] →".
- Front/back toggle: a small two-state switch above the body. Mono label "VIEW: ANTERIOR / POSTERIOR".

### 2. The kinetic hero
- One H1, four lines, single huge composition. The bracketed term cycles:
  - `[stubborn back pain]`
  - `[10 years of sciatica]`
  - `[the hip that won't heal]`
  - `[the surgery you were dreading]`
  - `[whatever's stopped you]`
- Cycle interval: 4 seconds hold + 960ms transition.
- Brackets `[` `]` stay fixed (Geist Mono, orange). Only the text between them rotates.
- Transition: erase right-to-left character by character (≈30ms/char), then retype the next phrase left-to-right (≈30ms/char). A blinking caret sits at the end during the pause.
- Prefers-reduced-motion: no rotation, hold the first phrase.

### 3. Drenched orange Approach section
- Full-bleed `--mr-orange`.
- Three steps laid out horizontally, separated by a 1px dark rule. Big mono numerals 01 / 02 / 03 reversed in ink.
- Replaces the existing "icon-square rotating circle" cliché.

### 4. Case-file aesthetic
- Each case study is a folder-tab card on cream paper.
- Header: tab graphic + mono metadata (`CASE FILE #M-2026-093 / 12 WEEKS / OUTCOME: PAIN-FREE`).
- Body: name, condition, photo (full-bleed, no border), the story in 2 short paragraphs, IG link.
- Asymmetric: tab on the left, three files step-laddered down. NOT a 3-column equal grid.

### 5. Stats section is REMOVED
- The 12+ / 3,090 / 8–16 / 1-on-1 grid is the hero-metric template. Banned.
- Replaced by a single line of inline ticker text under the hero: "12 years / 3,090 followers / 174 pain-free clients" set in mono, small, no big numbers.

### 6. Section numbering is REMOVED
- The "/ 01 — The approach" eyebrow labels are editorial-magazine-aesthetic territory. Banned.
- Each section opens with its h2 directly, plus a one-line mono kicker where useful.

### 7. Trust marquee is REMOVED
- The horizontal scrolling "Chronic Pain · Back & Neck · Sports Injury" marquee is cliché. Cut.
- Replaced by the body-map (the body itself shows where treatment happens).

### Components KEPT from existing identity
- The MR logo circle mark (orange ring, MR set inside). Keep — it works.
- The Caveat signature for James's "— James" sign-off.
- The Cathcart map iframe in the location section, with the orange "Open in Google Maps" pin badge.
- The 4-step booking flow (Service / Date+Time / Details / Confirm), reskinned to the new system.
- The existing-client login banner pattern (good UX move, keep but restyle).

## Bans (project-specific, on top of impeccable's absolute bans)
- No side-stripe borders on cards / rows. (.svc-row had a 2px orange left border — banned, removed.)
- No icon-above-heading layout for steps. The Approach section uses numeric type, not iconography.
- No marquee scroll.
- No hero-metric grid.
- No editorial section-numbering ("/ 01 — Approach").
- No card grid where items are visually identical templates.

## Permissions taken
- Single-purpose hero (one composition, one rotating phrase, no supporting paragraph above the fold).
- Drenched orange sections (Approach + Final CTA).
- Ambient page-load reveal (restrained — H1 character stagger only).
- Anatomical body-map as primary nav-by-pain.
- Patient-file metadata typesetting in mono.

## Bridges to the faithful port at :3041
- This is a separate app on :3042. The 3041 version is the faithful prototype port and stays untouched.
- Shared design DNA: orange + dark + the MR circle mark + Caveat signature + the real photographs + the real testimonials. Everything else is reworked.
