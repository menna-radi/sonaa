/**
 * Status → Colour & Pill Variant Single Source of Truth
 * Source: docs/dashboard/ui-refactor/01-design-tokens.md (§7)
 */

export type StatusPillVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'inverse'
  | 'outline'
  | 'muted';

export type StatusDomain = 'task' | 'craftsman' | 'verification' | 'report';

/**
 * Returns the standardized status pill variant for any domain status.
 */
export function pillVariantFor(domain: StatusDomain, status: string | undefined | null): StatusPillVariant {
  if (!status) return 'muted';
  const s = status.toUpperCase().trim();

  switch (domain) {
    case 'task': {
      if (['IN_PROGRESS', 'CHAT_OPEN', 'AGREEMENT_PENDING', 'PRE_CHAT_PENDING', 'ACCEPTED'].includes(s)) {
        return 'neutral';
      }
      if (['PENDING', 'OPEN'].includes(s)) {
        return 'outline';
      }
      if (['WORK_SUBMITTED', 'RATING_PENDING', 'REVIEW'].includes(s)) {
        return 'info';
      }
      if (['CLOSED', 'COMPLETED', 'RESOLVED'].includes(s)) {
        return 'success';
      }
      if (['DISPUTED'].includes(s)) {
        return 'warning';
      }
      if (['FROZEN', 'LOCKED'].includes(s)) {
        return 'inverse';
      }
      if (['CANCELLED', 'REJECTED'].includes(s)) {
        return 'muted';
      }
      if (['EMERGENCY', 'SOS'].includes(s)) {
        return 'danger';
      }
      return 'neutral';
    }

    case 'craftsman': {
      if (['ONLINE', 'AVAILABLE', 'ACTIVE'].includes(s)) return 'success';
      if (['OFFLINE', 'INACTIVE'].includes(s)) return 'muted';
      if (['BUSY', 'SUSPENDED'].includes(s)) return 'warning';
      if (['FLAGGED', 'BANNED', 'BLOCKED'].includes(s)) return 'danger';
      return 'muted';
    }

    case 'verification': {
      if (['UNDER_REVIEW', 'PENDING', 'IN_REVIEW'].includes(s)) return 'warning';
      if (['APPROVED', 'VERIFIED'].includes(s)) return 'success';
      if (['REJECTED', 'DECLINED'].includes(s)) return 'danger';
      if (['FLAGGED', 'NEEDS_ATTENTION'].includes(s)) return 'danger';
      if (['PENDING_SUBMISSION', 'DRAFT', 'UNVERIFIED'].includes(s)) return 'outline';
      return 'outline';
    }

    case 'report': {
      if (['HIGH', 'CRITICAL', 'URGENT'].includes(s)) return 'danger';
      if (['MEDIUM', 'MODERATE', 'WARNING'].includes(s)) return 'warning';
      if (['LOW', 'INFO', 'NORMAL'].includes(s)) return 'neutral';
      return 'neutral';
    }

    default:
      return 'neutral';
  }
}

/**
 * Returns the translation key for a given status
 */
export function statusLabelKey(domain: StatusDomain, status: string | undefined | null): string {
  if (!status) return 'status_unknown';
  const s = status.toLowerCase().trim();
  return `status_${s}`;
}
