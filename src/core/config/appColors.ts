/**
 * AppColors mirrors the Flutter AppColors class.
 * Centralized theme colors to use programmatically in TS/TSX files.
 */
export const AppColors = {
  // =========================
  // PRIMARY BRAND COLORS
  // =========================
  primary: '#171717',
  black: '#000000',
  blackSoft: '#0A0A0A',

  // =========================
  // BACKGROUND & SURFACES
  // =========================
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceLight: '#F5F5F5',
  surfaceGrey: '#E5E5E5',

  // =========================
  // TEXT COLORS
  // =========================
  textPrimary: '#000000',
  textSecondary: '#525252',
  textHint: '#737373',
  textDisabled: '#A3A3A3',

  // =========================
  // BORDER / OUTLINE
  // =========================
  border: '#D1D6DB',
  borderLight: '#D4D4D4',
  iconInactive: '#9CA3AF',

  // =========================
  // STATUS COLORS
  // =========================
  success: '#22C55E',
  error: '#DC2626',
  errorLight: '#EF4444',
  errorSoft: '#FEE2E2',
  warning: '#F87171',

  // =========================
  // OPACITY COLORS
  // =========================
  overlay60: 'rgba(0, 0, 0, 0.60)',
  white10: 'rgba(255, 255, 255, 0.10)',

  // =========================
  // NAVIGATION COLORS
  // =========================
  navActive: '#171717',
  navInactive: '#A3A3A3',

  // =========================
  // BUTTON COLORS
  // =========================
  buttonPrimary: '#171717',
  buttonSecondary: '#F5F5F5',
  buttonDisabled: '#E5E5E5',

  // =========================
  // ADDITIONAL COLORS
  // =========================
  white: '#FFFFFF',
  info: '#3B82F6',
  transparent: 'transparent',

  // =========================
  // NEUTRAL UI SURFACES
  // =========================
  neutralCircle: '#F2F2F7',
  neutralBorder: '#E5E5EA',
  neutralIcon: '#1C1C1E',
  darkNeutralCircle: '#2C2C2E',
  placeholderIcon: '#AEAEB2',
  darkPlaceholderIcon: '#8E8E93',
  starInactive: '#D1D1D6',
  starActive: '#FFC107',

  // =========================
  // DARK THEME COLORS
  // =========================
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkSurfaceLight: '#2A2A2A',
  darkSurfaceGrey: '#333333',
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: '#A3A3A3',
  darkTextHint: '#737373',
  darkTextDisabled: '#525252',
  darkBorder: '#333333',
  darkBorderLight: '#2A2A2A',
  darkIconInactive: '#6B7280',
  darkNavActive: '#FFFFFF',
  darkNavInactive: '#525252',
  darkButtonSecondary: '#2A2A2A',
  darkButtonDisabled: '#333333',
} as const;

export default AppColors;
