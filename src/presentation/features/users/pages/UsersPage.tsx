import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  AlertBanner,
  Avatar,
  Button,
  Card,
  DataTable,
  Dropdown,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Segmented,
  StatusPill,
  type DropdownItem,
} from '../../../components/ui';
import { useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate } from '../../../../core/utils/format';
import type { UserAccountStatus, UserRole, UserSummary } from '../../../../domain/entities/UserSummary';
import { useUsers, useSetUserStatus, USERS_PAGE_SIZE } from '../hooks/useUsers';
import { UserCog, MoreHorizontal, Info, Ban, PauseCircle, PlayCircle } from 'lucide-react';
import '../users.css';

type RoleFilter = UserRole | 'ALL';
const ROLE_FILTERS: RoleFilter[] = ['ALL', 'CUSTOMER', 'CRAFTSMAN', 'ADMIN'];
const SEARCH_DEBOUNCE_MS = 300;

export const UsersPage: React.FC = () => {
  const { t, language } = useLanguage();
  const confirmWithReason = useConfirmWithReason();
  const setStatus = useSetUserStatus();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [search]);

  const q = useUsers({ q: debounced, role, page });
  const totalPages = Math.max(1, Math.ceil(q.total / USERS_PAGE_SIZE));

  const changeStatus = async (user: UserSummary, next: UserAccountStatus) => {
    const key = next === 'ACTIVE' ? 'unsuspend' : next === 'SUSPENDED' ? 'suspend' : 'block';
    const { confirmed, reason } = await confirmWithReason({
      title: t(`users_confirm_${key}_title`),
      body: `${t(`users_confirm_${key}_body`)} ${user.name}`,
      tone: next === 'BLOCKED' ? 'danger' : next === 'SUSPENDED' ? 'warning' : 'default',
      requireReason: next !== 'ACTIVE',
      confirmLabel: t(`users_action_${key}`),
      cancelLabel: t('btn_cancel'),
    });
    if (!confirmed) return;
    setStatus.mutate({ id: user.id, status: next, reason: reason || undefined });
  };

  const actionItems = (u: UserSummary): DropdownItem[] => {
    const items: DropdownItem[] = [];
    if (u.status === 'ACTIVE') {
      items.push({ key: 'suspend', label: t('users_action_suspend'), icon: <PauseCircle size={14} />, onClick: () => changeStatus(u, 'SUSPENDED') });
    } else {
      items.push({ key: 'unsuspend', label: t('users_action_unsuspend'), icon: <PlayCircle size={14} />, onClick: () => changeStatus(u, 'ACTIVE') });
    }
    if (u.status !== 'BLOCKED') {
      items.push({ key: 'block', label: t('users_action_block'), icon: <Ban size={14} />, tone: 'danger', onClick: () => changeStatus(u, 'BLOCKED') });
    }
    return items;
  };

  const canManage = (u: UserSummary) => u.status !== undefined && u.role !== 'ADMIN';
  const actionsMenu = (u: UserSummary) =>
    canManage(u) ? (
      <Dropdown
        trigger={<Button variant="ghost" size="sm" icon={<MoreHorizontal size={16} />} aria-label={t('users_col_actions')} />}
        items={actionItems(u)}
      />
    ) : null;

  const statusPill = (u: UserSummary) =>
    u.status ? (
      <StatusPill variant={pillVariantFor('userAccount', u.status)} label={t(statusLabelKey('userAccount', u.status))} />
    ) : (
      '—'
    );

  const rolePill = (u: UserSummary) => (
    <StatusPill variant={u.role === 'ADMIN' ? 'inverse' : 'neutral'} label={t(`users_role_${u.role.toLowerCase()}`)} />
  );

  const columns = [
    {
      key: 'name',
      header: t('users_col_name'),
      render: (u: UserSummary) => (
        <span className="users-cell">
          <Avatar name={u.name} size={32} />
          <span className="users-cell__text">
            <span className="ui-text-strong ui-clamp-1">{u.name || '—'}</span>
          </span>
        </span>
      ),
    },
    { key: 'role', header: t('users_col_role'), render: rolePill },
    {
      key: 'contact',
      header: t('users_col_contact'),
      hideOnTablet: true,
      render: (u: UserSummary) => (
        <span className="users-cell__text">
          <bdi className="ui-num">{u.phone || '—'}</bdi>
          <bdi className="ui-num ui-caption">{u.email || '—'}</bdi>
        </span>
      ),
    },
    {
      key: 'rating',
      header: t('users_col_rating'),
      render: (u: UserSummary) => <bdi className="ui-num">{u.rating != null ? u.rating.toFixed(1) : '—'}</bdi>,
    },
    {
      key: 'joined',
      header: t('users_col_joined'),
      hideOnTablet: true,
      render: (u: UserSummary) => <span>{u.createdAt ? formatDate(u.createdAt, language) : '—'}</span>,
    },
    ...(q.hasStatus
      ? [
          { key: 'status', header: t('users_col_status'), render: statusPill },
          { key: 'actions', header: t('users_col_actions'), align: 'end' as const, render: actionsMenu },
        ]
      : []),
  ];

  return (
    <div className="ui-page">
      <PageHeader title={t('users_title')} subtitle={t('users_subtitle')} />
      {!q.hasStatus && !q.loading && !q.error && (
        <AlertBanner tone="info" icon={<Info size={18} />} title={t('users_readonly_note')} />
      )}
      <div className="ui-toolbar">
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={setSearch} placeholder={t('users_search_ph')} aria-label={t('users_search_ph')} />
        </div>
        <Segmented
          value={role}
          onChange={(v) => {
            setRole(v as RoleFilter);
            setPage(1);
          }}
          items={ROLE_FILTERS.map((r) => ({ value: r, label: t(`users_role_filter_${r.toLowerCase()}`) }))}
        />
      </div>
      <Card padding="none">
        {q.error ? (
          <ErrorState title={t('status_error_title')} message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={columns}
            rows={q.rows}
            rowKey={(u: UserSummary) => u.id}
            loading={q.loading}
            empty={<EmptyState icon={<UserCog size={20} />} title={t('users_empty')} />}
            pagination={{ page, totalPages, totalItems: q.total, pageSize: USERS_PAGE_SIZE, onPageChange: setPage }}
            mobile={(u: UserSummary) => (
              <div className="users-card">
                <div className="users-card__top">
                  <span className="users-cell">
                    <Avatar name={u.name} size={32} />
                    <span className="ui-text-strong ui-clamp-1">{u.name || '—'}</span>
                  </span>
                  {rolePill(u)}
                </div>
                <div className="users-card__bottom">
                  <bdi className="ui-num ui-caption">{u.phone || u.email || '—'}</bdi>
                  {q.hasStatus && (
                    <span className="ui-row">
                      {statusPill(u)}
                      {actionsMenu(u)}
                    </span>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default UsersPage;
