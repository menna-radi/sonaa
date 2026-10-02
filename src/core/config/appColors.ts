/**
 * AppColors mirrors the Flutter AppColors class.
 * Centralized theme colors to use programmatically in TS/TSX files.
 * Values are design tokens (see src/presentation/styles/tokens.css) — no hex.
 * NOTE: currently unreferenced; kept for programmatic use until T-F093
 * removes it via unused-files.mjs if it stays unreferenced.
 */
export const AppColors = {
  // =========================
  // PRIMARY BRAND COLORS
  // =========================
  primary: 'var(--n-900)',
  black: 'var(--n-1000)',
  blackSoft: 'var(--n-950)',

  // =========================
  // BACKGROUND & SURFACES
  // =========================
  background: 'var(--surface-page)',
  surface: 'var(--surface-card)',
  surfaceLight: 'var(--n-100)',
  surfaceGrey: 'var(--n-200)',

  // =========================
  // TEXT COLORS
  // =========================
  textPrimary: 'var(--text-strong)',
  textSecondary: 'var(--text-muted)',
  textHint: 'var(--text-faint)',
  textDisabled: 'var(--n-400)',

  // =========================
  // BORDER / OUTLINE
  // =========================
  border: 'var(--border)',
  borderLight: 'var(--border-strong)',
  iconInactive: 'var(--n-400)',

  // =========================
  // STATUS COLORS
  // =========================
  success: 'var(--success)',
  error: 'var(--danger)',
  errorLight: 'var(--danger)',
  errorSoft: 'var(--danger-soft)',
  warning: 'var(--warning)',

  // =========================
  // OPACITY COLORS
  // =========================
  overlay60: 'rgba(0, 0, 0, 0.60)',
  white10: 'rgba(255, 255, 255, 0.10)',

  // =========================
  // NAVIGATION COLORS
  // =========================
  navActive: 'var(--n-900)',
  navInactive: 'var(--n-400)',

  // =========================
  // BUTTON COLORS
  // =========================
  buttonPrimary: 'var(--n-900)',
  buttonSecondary: 'var(--n-100)',
  buttonDisabled: 'var(--n-200)',

  // =========================
  // ADDITIONAL COLORS
  // =========================
  white: 'var(--n-0)',
  info: 'var(--info)',
  transparent: 'transparent',

  // =========================
  // NEUTRAL UI SURFACES
  // =========================
  neutralCircle: 'var(--n-100)',
  neutralBorder: 'var(--border)',
  neutralIcon: 'var(--n-900)',
  darkNeutralCircle: 'var(--n-800)',
  placeholderIcon: 'var(--n-400)',
  darkPlaceholderIcon: 'var(--n-500)',
  starInactive: 'var(--n-300)',
  starActive: 'var(--warning)',

  // =========================
  // DARK THEME COLORS
  // =========================
  darkBackground: 'var(--n-950)',
  darkSurface: 'var(--n-900)',
  darkSurfaceLight: 'var(--n-800)',
  darkSurfaceGrey: 'var(--n-800)',
  darkTextPrimary: 'var(--n-0)',
  darkTextSecondary: 'var(--n-400)',
  darkTextHint: 'var(--n-500)',
  darkTextDisabled: 'var(--n-600)',
  darkBorder: 'var(--n-800)',
  darkBorderLight: 'var(--n-800)',
  darkIconInactive: 'var(--n-500)',
  darkNavActive: 'var(--n-0)',
  darkNavInactive: 'var(--n-600)',
  darkButtonSecondary: 'var(--n-800)',
  darkButtonDisabled: 'var(--n-800)',
} as const;

export default AppColors;
