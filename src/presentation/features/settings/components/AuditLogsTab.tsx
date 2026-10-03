import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Info, RefreshCw, ScrollText } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  AlertBanner,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Select,
  SearchInput,
  TextField,
  type Column,
} from '../../../components/ui';
import { formatDateTime } from '../../../../core/utils/format';
import { downloadCsv, toCsv } from '../../../../core/utils/csv';
import type { AuditLog } from '../../../../domain/entities/AuditLog';
import { AUDIT_PAGE_SIZE, useAuditLogs, type AuditFilters } from '../hooks/useAuditLogs';
import { AuditDiff } from './AuditDiff';
import '../settings.css';

const SEARCH_DEBOUNCE_MS = 300;
const SHORT_ID_CHARS = 8;

export const AuditLogsTab: React.FC = () => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [search]);

  const filters = useMemo<AuditFilters>(
    () => ({
      page,
      ...(debounced ? { q: debounced } : {}),
      ...(action ? { action } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [page, debounced, action, from, to]
  );
  const q = useAuditLogs(filters);
  const filterActive = Boolean(debounced || action || from || to);
  const totalPages = Math.max(1, Math.ceil(q.total / AUDIT_PAGE_SIZE));

  const actionLabel = (code: string): string => {
    const key = `audit_action_${code}`;
    return t(key) !== key ? t(key) : code;
  };

  const exportCsv = () => {
    const head = [
      t('audit_col_time'),
      t('audit_col_admin'),
      t('audit_col_action'),
      t('audit_col_target'),
      t('audit_col_ip'),
    ];
    const rows = q.items.map((l) => [
      l.createdAt,
      l.actorEmail ? `${l.actorName} <${l.actorEmail}>` : l.actorName,
      l.action,
      [l.targetType, l.targetId].filter(Boolean).join(' '),
      l.ipAddress ?? '',
    ]);
    downloadCsv(`audit-logs-page-${page}.csv`, toCsv([head, ...rows]));
  };

  const showIp = q.items.some((l) => l.ipAddress);

  const columns: Column<AuditLog>[] = [
    {
      key: 'time',
      header: t('audit_col_time'),
      width: 170,
      render: (l) => <span className="ui-num ui-caption">{formatDateTime(l.createdAt, language)}</span>,
    },
    {
      key: 'admin',
      header: t('audit_col_admin'),
      render: (l) => (
        <span className="audit-cell">
          <span className="ui-text-strong ui-clamp-1">{l.actorName || '—'}</span>
          {l.actorEmail && <bdi className="ui-num ui-caption ui-clamp-1">{l.actorEmail}</bdi>}
        </span>
      ),
    },
    {
      key: 'action',
      header: t('audit_col_action'),
      render: (l) => {
        const label = actionLabel(l.action);
        return label === l.action ? <code className="audit-code">{l.action}</code> : <span>{label}</span>;
      },
    },
    {
      key: 'target',
      header: t('audit_col_target'),
      hideOnTablet: true,
      render: (l) => (
        <span className="audit-cell">
          <span>{l.targetType || '—'}</span>
          {l.targetId && <bdi className="ui-num ui-caption">{l.targetId.slice(0, SHORT_ID_CHARS)}</bdi>}
        </span>
      ),
    },
    ...(showIp
      ? [
          {
            key: 'ip',
            header: t('audit_col_ip'),
            hideOnTablet: true,
            render: (l: AuditLog) => <bdi className="ui-num ui-caption">{l.ipAddress || '—'}</bdi>,
          },
        ]
      : []),
    {
      key: 'details',
      header: t('audit_col_details'),
      render: (l) => {
        const open = expanded === l.id;
        return (
          <div className="audit-details">
            <Button
              variant="ghost"
              size="sm"
              icon={open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              aria-expanded={open}
              onClick={() => setExpanded(open ? null : l.id)}
            >
              {open ? t('audit_details_hide') : t('audit_details_show')}
            </Button>
            {open && <AuditDiff before={l.before} after={l.after} />}
          </div>
        );
      },
    },
  ];

  const actionOptions = [
    { value: '', label: t('audit_all_actions') },
    ...q.actions.map((a) => ({ value: a, label: actionLabel(a) })),
  ];

  return (
    <Card
      eyebrow={t('audit_eyebrow')}
      title={t('audit_title')}
      subtitle={t('audit_subtitle')}
      actions={
        <div className="ui-row">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            disabled={q.items.length === 0}
            onClick={exportCsv}
          >
            {t('btn_export_csv')}
          </Button>
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} loading={q.fetching} onClick={() => q.refetch()}>
            {t('btn_refresh')}
          </Button>
        </div>
      }
    >
      <div className="ui-stack">
        <div className="ui-toolbar">
          <SearchInput
            className="ui-toolbar__grow"
            value={search}
            onChange={setSearch}
            placeholder={t('audit_search_ph')}
          />
          <Select
            aria-label={t('audit_col_action')}
            value={action}
            options={actionOptions}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          />
          <TextField
            type="date"
            aria-label={t('audit_from')}
            value={from}
            max={to || undefined}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <TextField
            type="date"
            aria-label={t('audit_to')}
            value={to}
            min={from || undefined}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {!q.serverFiltering && filterActive && (
          <AlertBanner tone="info" icon={<Info size={16} />} title={t('audit_filters_client_only')} />
        )}

        {q.error ? (
          <ErrorState title={t('status_error_title')} message={q.error.message} onRetry={() => q.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={q.items}
            rowKey={(l) => l.id}
            loading={q.loading}
            empty={
              <EmptyState
                icon={<ScrollText size={20} />}
                title={t('audit_empty_title')}
                description={t('audit_empty_desc')}
              />
            }
            pagination={{
              page,
              totalPages,
              totalItems: q.total,
              pageSize: AUDIT_PAGE_SIZE,
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </Card>
  );
};

export default AuditLogsTab;
