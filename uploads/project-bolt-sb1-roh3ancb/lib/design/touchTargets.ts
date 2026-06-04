/**
 * Touch Targets
 * Minimum and recommended touch target sizes for accessible mobile UI.
 * Based on Apple HIG (44px), Google Material (48px), and Phi-aligned adjustments.
 */

/** Absolute minimum — WCAG 2.5.5 AA requires at least 44×44px for interactive elements */
export const MINIMUM_TOUCH_TARGET = 44;

/** Comfortable touch target — recommended for standard interactive elements */
export const COMFORTABLE_TOUCH_TARGET = 48;

/** Primary action target — used for main CTA buttons, send, create, confirm */
export const PRIMARY_ACTION_TARGET = 55;

/** Large touch target — used for mode selectors, trust level buttons, key choices */
export const LARGE_TOUCH_TARGET = 89;

/** Icon-only button minimum — must have a 44px hit area even if visual is smaller */
export const ICON_BUTTON_HIT_AREA = 44;

/** Bottom navigation tab — full-width tap area per tab */
export const BOTTOM_NAV_TAP_HEIGHT = 55;

/** Touch guidelines summary */
export const TOUCH_GUIDELINES = {
  minimum:        MINIMUM_TOUCH_TARGET,
  comfortable:    COMFORTABLE_TOUCH_TARGET,
  primaryAction:  PRIMARY_ACTION_TARGET,
  large:          LARGE_TOUCH_TARGET,
  iconHitArea:    ICON_BUTTON_HIT_AREA,
  bottomNavTab:   BOTTOM_NAV_TAP_HEIGHT,
} as const;

/**
 * Returns whether a given px size meets the minimum touch target requirement.
 */
export function meetsTouchMinimum(px: number): boolean {
  return px >= MINIMUM_TOUCH_TARGET;
}
