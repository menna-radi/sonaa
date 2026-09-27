/**
 * Shared formatting utilities for the AROX Admin Dashboard
 * Following guidelines from docs/dashboard/ui-refactor/
 */

export type SupportedLocale = 'en' | 'ar' | 'he';

/**
 * Format currency amounts in Israeli New Shekel (ILS / ₪)
 * Uses Intl.NumberFormat with clean zero-decimal rule for integers >= 1000.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = 'ILS',
  locale: SupportedLocale = 'en'
): string {
  if (amount == null || isNaN(amount)) return '—';

  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-IL',
    ar: 'ar-IL',
    he: 'he-IL',
  };

  const targetLocale = localeMap[locale] || 'en-IL';
  const hasDecimals = amount % 1 !== 0 && Math.abs(amount) < 1000;

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency === 'ILS' ? '₪' : currency}`;
  }
}

/**
 * Format standard numbers with thousands separators
 */
export function formatNumber(
  value: number | null | undefined,
  locale: SupportedLocale = 'en'
): string {
  if (value == null || isNaN(value)) return '—';
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    ar: 'ar-EG',
    he: 'he-IL',
  };
  return new Intl.NumberFormat(localeMap[locale] || 'en-US').format(value);
}

/**
 * Format percentage deltas with sign and 1 decimal place (e.g., +8.2%, -3.4%, 0.0%)
 */
export function formatPercent(delta: number | null | undefined): string {
  if (delta == null || isNaN(delta)) return '—';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

/**
 * Format relative timestamps (e.g., "5 minutes ago", "منذ ٥ دقائق", "לפני 5 דקות")
 */
export function formatRelativeTime(
  dateInput: string | number | Date | null | undefined,
  locale: SupportedLocale = 'en'
): string {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'object' ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  const matched = units.find((u) => absDiff >= u.seconds) || { unit: 'second', seconds: 1 };
  const count = Math.round(diffInSeconds / matched.seconds);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(count, matched.unit);
  } catch {
    return date.toLocaleDateString();
  }
}
