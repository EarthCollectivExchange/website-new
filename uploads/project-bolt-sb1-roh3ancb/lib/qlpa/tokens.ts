// QLPA Phi / Fibonacci design tokens
// Use these instead of arbitrary spacing values.

export const QLPA_SPACE = {
  x3:  3,
  x6:  6,
  x9:  9,
  x13: 13,
  x21: 21,
  x34: 34,
  x55: 55,
  x89: 89,
} as const;

export const QLPA_RADIUS = {
  soft:  13,
  card:  21,
  panel: 34,
} as const;

export const QLPA_MOTION = {
  fast:     233,
  standard: 369,
  slow:     610,
  ease:     'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export const MAGNETIC_ORB_MOTION = {
  maxOffset:      9,
  returnDuration: QLPA_MOTION.standard,
  hoverScale:     1.018,
  pressScale:     0.982,
  easing:         QLPA_MOTION.ease,
} as const;

// ─── Human Mode Atmosphere Tokens ────────────────────────────────────────────
//
// Each mode has a distinct visual identity:
//
//  calm      — grounding teal-green      breathable, peaceful, safe harbour
//  focus     — deep prussian blue        precision, intent, reduced noise
//  care      — rose / warm magenta       human warmth, supported, present
//  creator   — rich amber-gold           expressive, generative, luminous
//  shield    — bright aqua / cyan        sealed protection, clear boundary
//  sovereign — royal violet-blue         command, autonomy, full visibility
//  emergency — urgent rose-red           alert, priority, critical signal
//
// Shape:
//  accent        — icon / text colour (high opacity for readability)
//  accentSoft    — softer variant for secondary text elements
//  border        — card border when selected (low opacity)
//  bg            — card background tint (very low opacity)
//  glow          — box-shadow glow colour (very low opacity)
//  text          — primary label colour in active mode panels
//  dot           — small indicator dot / status pip
//  panelGradient — subtle linear-gradient for panel header wash
//
// Opacity discipline:
//  background aura:  0.04–0.10
//  border:           0.18–0.32
//  active glow:      0.10–0.22
//  text accent:      0.80–0.92 (readable, not neon)
//
// Dark-safe: all values are transparent overlays on dark glass surfaces.
// None contain #fff, bg-white, or light-hue fills.

export interface ModeAtmosphere {
  accent:        string;
  accentSoft:    string;
  border:        string;
  bg:            string;
  glow:          string;
  text:          string;
  dot:           string;
  panelGradient: string;
}

export const QLPA_MODE_COLORS = {

  // Calm — teal-green: grounding, breathable, safe
  calm: {
    accent:        'rgba(86,  210, 168, 0.90)',
    accentSoft:    'rgba(86,  210, 168, 0.55)',
    border:        'rgba(86,  210, 168, 0.26)',
    bg:            'rgba(86,  210, 168, 0.07)',
    glow:          'rgba(86,  210, 168, 0.13)',
    text:          'rgba(140, 235, 200, 0.88)',
    dot:           'rgba(86,  210, 168, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(86,210,168,0.06) 0%, transparent 55%)',
  },

  // Focus — deep prussian blue: precision, intent, clarity
  // Distinct from sovereign: cooler, more contained, less saturated
  focus: {
    accent:        'rgba(100, 150, 230, 0.90)',
    accentSoft:    'rgba(100, 150, 230, 0.52)',
    border:        'rgba(100, 150, 230, 0.28)',
    bg:            'rgba( 60, 100, 200, 0.07)',
    glow:          'rgba(100, 150, 230, 0.14)',
    text:          'rgba(150, 190, 245, 0.88)',
    dot:           'rgba(100, 150, 230, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(60,100,200,0.08) 0%, transparent 55%)',
  },

  // Care — rose / warm magenta: human warmth, presence, support
  care: {
    accent:        'rgba(228, 120, 168, 0.90)',
    accentSoft:    'rgba(228, 120, 168, 0.52)',
    border:        'rgba(228, 120, 168, 0.26)',
    bg:            'rgba(210,  80, 130, 0.07)',
    glow:          'rgba(228, 120, 168, 0.14)',
    text:          'rgba(245, 160, 200, 0.88)',
    dot:           'rgba(228, 120, 168, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(210,80,130,0.07) 0%, transparent 55%)',
  },

  // Creator — rich amber-gold: expressive, luminous, generative
  // Kept richer/deeper than warning amber; warmer hue (36°→42°)
  creator: {
    accent:        'rgba(232, 186,  72, 0.90)',
    accentSoft:    'rgba(232, 186,  72, 0.52)',
    border:        'rgba(232, 186,  72, 0.26)',
    bg:            'rgba(200, 148,  40, 0.07)',
    glow:          'rgba(232, 186,  72, 0.14)',
    text:          'rgba(248, 208, 120, 0.88)',
    dot:           'rgba(232, 186,  72, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(200,148,40,0.08) 0%, transparent 55%)',
  },

  // Shield — bright aqua-cyan: sealed protection, clear boundary
  // Higher saturation than calm to read as "active protection"
  shield: {
    accent:        'rgba( 56, 218, 222, 0.90)',
    accentSoft:    'rgba( 56, 218, 222, 0.52)',
    border:        'rgba( 56, 218, 222, 0.28)',
    bg:            'rgba(  0, 188, 210, 0.07)',
    glow:          'rgba( 56, 218, 222, 0.16)',
    text:          'rgba(120, 238, 242, 0.88)',
    dot:           'rgba( 56, 218, 222, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(0,188,210,0.09) 0%, transparent 55%)',
  },

  // Sovereign — royal violet-blue: command, autonomy, full visibility
  // Clearly distinct from shield (violet shift) and focus (more saturated)
  sovereign: {
    accent:        'rgba(120, 140, 255, 0.90)',
    accentSoft:    'rgba(120, 140, 255, 0.52)',
    border:        'rgba(120, 140, 255, 0.28)',
    bg:            'rgba( 80, 100, 240, 0.07)',
    glow:          'rgba(120, 140, 255, 0.16)',
    text:          'rgba(170, 185, 255, 0.88)',
    dot:           'rgba(120, 140, 255, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(80,100,240,0.09) 0%, transparent 55%)',
  },

  // Emergency — urgent rose-red: priority signal, critical alert
  emergency: {
    accent:        'rgba(248,  88,  88, 0.90)',
    accentSoft:    'rgba(248,  88,  88, 0.52)',
    border:        'rgba(248,  88,  88, 0.30)',
    bg:            'rgba(220,  50,  50, 0.08)',
    glow:          'rgba(248,  88,  88, 0.18)',
    text:          'rgba(255, 140, 140, 0.88)',
    dot:           'rgba(248,  88,  88, 0.90)',
    panelGradient: 'linear-gradient(180deg, rgba(220,50,50,0.09) 0%, transparent 55%)',
  },

} as const satisfies Record<string, ModeAtmosphere>;

// ─── Canonical helper ─────────────────────────────────────────────────────────

/** Returns the full atmosphere token set for a given human mode key.
 *  Falls back to sovereign if the key is unrecognised. */
export function getHumanModeAtmosphere(mode: string): ModeAtmosphere {
  return (QLPA_MODE_COLORS as Record<string, ModeAtmosphere>)[mode]
    ?? QLPA_MODE_COLORS.sovereign;
}
