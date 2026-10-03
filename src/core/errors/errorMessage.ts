import type { AppError } from './AppError';

/** backend `error` code → i18n key (all keys must exist in en/ar/he). */
export const ERROR_CODE_KEYS: Record<string, string> = {
  COMMISSION_DEBT_UNSETTLED: 'err_commission_debt',
  BILLING_SWITCH_BLOCKED_DEBT: 'err_commission_debt',
  REQUEST_ALREADY_APPROVED: 'err_request_already_approved',
  INVALID_FREE_TASKS_COUNT: 'err_free_tasks_range',
  COMMISSION_PAYMENT_LEDGER_MISMATCH: 'err_ledger_mismatch',
  VERIFICATION_NOT_REVIEWABLE: 'err_verification_not_reviewable',
  VERIFICATION_EVIDENCE_INCOMPLETE: 'err_verification_incomplete',
  UNIQUE_CONSTRAINT_FAILED: 'err_duplicate',
  RECORD_NOT_FOUND: 'err_not_found',
  NOT_FOUND: 'err_not_found',
  CONFLICT: 'err_conflict',
  FORBIDDEN: 'err_forbidden',
  UNAUTHORIZED: 'err_session_expired',
};

export const STATUS_KEYS: Record<string, string> = {
  NETWORK_ERROR: 'err_network',
  TIMEOUT_ERROR: 'err_timeout',
  SERVER_ERROR: 'err_server',
  FORBIDDEN_ERROR: 'err_forbidden',
  UNAUTHORIZED_ERROR: 'err_session_expired',
  NOT_FOUND_ERROR: 'err_not_found',
  CONFLICT_ERROR: 'err_conflict',
};

/** Returns a translated, user-safe message. Falls back to the server message, then a generic key. */
export function errorMessage(error: unknown, t: (k: string) => string): string {
  const e = error as Partial<AppError> | undefined;
  const key = (e?.backendCode && ERROR_CODE_KEYS[e.backendCode]) || (e?.code && STATUS_KEYS[e.code]);
  if (key) return t(key);
  if (e?.message && e.message !== 'HTTP Request Failed') return e.message;
  return t('err_generic');
}

/** ValidationError.details → { fieldName: message } for FormModal. */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  const d = (error as { details?: Array<{ field: string; message: string }> })?.details;
  return d ? Object.fromEntries(d.map((x) => [x.field.split('.').pop() ?? x.field, x.message])) : {};
}
