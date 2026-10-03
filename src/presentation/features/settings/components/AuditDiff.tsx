import React from 'react';
import { Copy } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, useToast } from '../../../components/ui';

const MAX_VALUE_CHARS = 120;

interface AuditDiffProps {
  before: unknown;
  after: unknown;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const stringify = (v: unknown): string => {
  if (v === undefined || v === null) return '—';
  return typeof v === 'string' ? v : JSON.stringify(v);
};

const truncate = (s: string): string => (s.length > MAX_VALUE_CHARS ? `${s.slice(0, MAX_VALUE_CHARS)}…` : s);

export const AuditDiff: React.FC<AuditDiffProps> = ({ before, after }) => {
  const { t } = useLanguage();
  const { success, error } = useToast();

  const b = isRecord(before) ? before : undefined;
  const a = isRecord(after) ? after : undefined;
  const keys = b || a ? Array.from(new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})])) : [];
  const rows = b || a
    ? keys.map((k) => ({ key: k, before: b?.[k], after: a?.[k] }))
    : before == null && after == null
      ? []
      : [{ key: '', before, after }];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ before, after }, null, 2));
      success(t('audit_copied'));
    } catch {
      error(t('audit_copy_failed'));
    }
  };

  if (rows.length === 0) return <span className="ui-caption">{t('audit_no_changes')}</span>;

  return (
    <div className="audit-diff">
      <div className="audit-diff__grid">
        <span className="ui-eyebrow">{t('audit_diff_field')}</span>
        <span className="ui-eyebrow">{t('audit_diff_before')}</span>
        <span className="ui-eyebrow">{t('audit_diff_after')}</span>
        {rows.map((r) => {
          const bs = stringify(r.before);
          const as = stringify(r.after);
          return (
            <React.Fragment key={r.key}>
              <bdi className="audit-diff__key ui-num">{r.key || '—'}</bdi>
              <bdi className="audit-diff__val ui-num" title={bs}>{truncate(bs)}</bdi>
              <bdi className="audit-diff__val ui-num" title={as}>{truncate(as)}</bdi>
            </React.Fragment>
          );
        })}
      </div>
      <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={copy}>
        {t('audit_copy_json')}
      </Button>
    </div>
  );
};

export default AuditDiff;
