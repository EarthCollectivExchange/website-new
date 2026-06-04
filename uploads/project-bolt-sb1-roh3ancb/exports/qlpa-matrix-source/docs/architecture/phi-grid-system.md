# EarthOS Phi Grid System

## The Golden Ratio

φ (phi) = 1.618...

The Golden Ratio creates proportions that feel inherently balanced without looking mechanical. A space divided by φ produces a major portion (61.8%) and a minor portion (38.2%).

---

## Fibonacci Spacing

Use values from the Fibonacci sequence as spacing units:

| Token | Value | Tailwind approx | Use case |
|-------|-------|-----------------|----------|
| f3    | 3px   | p-px            | Hairlines, borders |
| f5    | 5px   | p-1             | Micro gaps |
| f8    | 8px   | p-2             | Standard spacing unit |
| f13   | 13px  | p-3             | Card padding, gaps |
| f21   | 21px  | p-5             | Panel padding |
| f34   | 34px  | p-8             | Section gaps |
| f55   | 55px  | p-14            | Component heights, bottom nav |
| f89   | 89px  | p-24            | Major section gaps |
| f144  | 144px | p-36            | Full section heights |

**Rule:** Every gap, padding, margin, and component height should match one of these values (or the nearest one).

---

## Two-Column Layout

At desktop widths, use the golden ratio for the sidebar/content split:

- Sidebar (conversation list): **38.2%** of viewport width
- Content area (conversation view): **61.8%** of viewport width

Constraints:
- Sidebar minimum: 320px (never narrower on desktop)
- Sidebar maximum: 420px (never wider on desktop)

On mobile: full-width stack — no split view.

---

## Avoiding Crowded UI

Crowded UI happens when spacing is arbitrary and inconsistent. To avoid it:

1. **Use the Fibonacci ladder** — when you need more space, move up one step (f8 → f13 → f21 → f34)
2. **Never mix random px values** — 10px, 15px, 20px, 24px all in one component creates visual noise
3. **Group related elements tightly (f8)** — separate groups generously (f21 or f34)
4. **Headers need breathing room** — use f21 vertical padding for section headers
5. **Touch targets** — minimum 44px, comfortable 48px, primary action 55px

---

## Keeping Simple View Calm

The Simple view must feel peaceful and uncluttered. Rules:

1. **No more than 3 visual layers** visible at once (background, surface, foreground)
2. **White space is content** — empty space is intentional, not wasted
3. **f21 or f34 panel gaps** in Simple view — never compress to f8
4. **One primary action per screen** — everything else is secondary
5. **Maximum 2 type sizes** visible at once in any panel
6. **No status badges unless they require user attention**

Advanced and Developer views may use f13 gaps — density is appropriate there.

---

## Type Scale

Based on Phi:

| Role | Size | Line Height | Weight |
|------|------|-------------|--------|
| Body | 14px | 150% (21px) | 400 |
| Label | 12px | 150% (18px) | 500 |
| Small | 10px | 150% (15px) | 400 |
| Heading | 16px | 120% (19px) | 600 |
| Title | 20px | 120% (24px) | 700 |

Maximum 3 font weights in any single view.

---

## Reference Files

- `lib/design/fibonacciScale.ts` — Fibonacci constants
- `lib/design/phiTokens.ts` — PHI, INVERSE_PHI, phiMajor(), phiMinor()
- `lib/design/layoutRhythm.ts` — SPACING, PANEL_GAPS, CARD_PADDING, LAYOUT_RATIOS
- `lib/design/touchTargets.ts` — Touch target size constants
- `lib/design/zIndex.ts` — Z-index scale
