/**
 * Status → Colour & Pill Variant Single Source of Truth
 * Domains per docs/refactor/03-data-contract.md §6.
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

export type StatusDomain =
  | 'task'
  | 'craftsman'
  | 'verification'
  | 'report'
  | 'billing'
  | 'commission'
  | 'subscription'
  | 'dispute'
  | 'offer'
  | 'broadcast'
  | 'withdrawal'
  | 'userAccount';

/**
 * Returns the standardized status pill variant for any domain status.
 */
export function pillVariantFor(domain: StatusDomain, status: string | undefined | null): StatusPillVariant {
  if (!status) return 'muted';
  const s = status.toUpperCase().trim();

  switch (domain) {
    case 'task': {
      if (s === 'PENDING') return 'outline';
      if (['ACCEPTED', 'PRE_CHAT_PENDING', 'CHAT_OPEN', 'AGREEMENT_PENDING', 'IN_PROGRESS'].includes(s)) {
        return 'neutral';
      }
      if (['WORK_SUBMITTED', 'RATING_PENDING'].includes(s)) return 'info';
      if (['CLOSED', 'COMPLETED'].includes(s)) return 'success';
      if (s === 'DISPUTED') return 'warning';
      if (s === 'FROZEN') return 'inverse';
      if (['CANCELLED', 'REJECTED'].includes(s)) return 'muted';
      if (s === 'EMERGENCY') return 'danger';
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
      if (s === 'PENDING') return 'warning';
      if (s === 'UNDER_INVESTIGATION') return 'info';
      if (s === 'RESOLVED') return 'success';
      if (s === 'DISMISSED') return 'muted';
      if (['HIGH', 'CRITICAL', 'URGENT'].includes(s)) return 'danger';
      if (['MEDIUM', 'MODERATE', 'WARNING'].includes(s)) return 'warning';
      if (['LOW', 'INFO', 'NORMAL'].includes(s)) return 'neutral';
      return 'neutral';
    }

    case 'billing': {
      if (s === 'PENDING_VERIFICATION') return 'warning';
      if (s === 'APPROVED') return 'success';
      if (s === 'REJECTED') return 'danger';
      if (s === 'CANCELLED') return 'muted';
      return 'neutral';
    }

    case 'commission': {
      if (['PENDING', 'DUE'].includes(s)) return 'warning';
      if (['APPROVED', 'PAID'].includes(s)) return 'success';
      if (s === 'REJECTED') return 'danger';
      return 'neutral';
    }

    case 'subscription': {
      if (s === 'ACTIVE') return 'success';
      if (['EXPIRED', 'CANCELLED'].includes(s)) return 'muted';
      if (s === 'LOCKED') return 'danger';
      if (s === 'FREE') return 'info';
      if (s === 'COMMISSION') return 'neutral';
      return 'neutral';
    }

    case 'dispute': {
      if (s === 'PENDING') return 'warning';
      if (s === 'RESOLVED') return 'success';
      return 'neutral';
    }

    case 'offer': {
      if (s === 'ACTIVE') return 'success';
      if (s === 'PAUSED') return 'muted';
      if (s === 'SCHEDULED') return 'info';
      if (s === 'ENDED') return 'muted';
      return 'neutral';
    }

    case 'broadcast': {
      if (s === 'SENT') return 'success';
      if (s === 'SCHEDULED') return 'info';
      if (s === 'CANCELLED') return 'muted';
      if (s === 'FAILED') return 'danger';
      return 'neutral';
    }

    case 'withdrawal': {
      if (s === 'PENDING') return 'warning';
      if (s === 'COMPLETED') return 'success';
      if (s === 'FAILED') return 'danger';
      return 'neutral';
    }

    case 'userAccount': {
      if (s === 'ACTIVE') return 'success';
      if (s === 'SUSPENDED') return 'warning';
      if (s === 'BLOCKED') return 'danger';
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
