// Cerulean and aqua color theme
export const colors = {
  // Primary
  cerulean: '#007BA7',      // Primary actions, highlights
  aqua: '#00FFFF',          // Accents, success states

  // Semantic
  primary: '#007BA7',       // cerulean
  accent: '#00FFFF',        // aqua
  success: '#00D4AA',       // teal-ish
  warning: '#FFB347',       // soft orange
  error: '#FF6B6B',         // soft red

  // Neutral
  dim: '#6B7280',           // secondary text
  muted: '#9CA3AF',         // hints, placeholders
  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
