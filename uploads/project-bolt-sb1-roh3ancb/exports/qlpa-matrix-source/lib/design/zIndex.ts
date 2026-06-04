/**
 * Z-Index Scale
 * Canonical z-index values for QLPA Matrix Source layers.
 * Use these constants instead of arbitrary z values.
 */

export const Z_INDEX = {
  base:        0,
  raised:      1,
  dropdown:    10,
  sticky:      20,
  panel:       30,
  drawer:      40,
  overlay:     50,
  modal:       60,
  toast:       70,
  tooltip:     80,
  portal:      9999,  // createPortal fixed-position elements (ModeBar dropdown, etc.)
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
