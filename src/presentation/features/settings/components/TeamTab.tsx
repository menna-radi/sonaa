import React, { useState } from 'react';
import { PauseCircle, PlayCircle, UserPlus, Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Avatar, Button, Card, DataTable, EmptyState, ErrorState, StatusPill } from '../../../components/ui';
import { useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate } from '../../../../core/utils/format';
import type { AdminMember } from '../../../../domain/entities/AdminMember';
import type { InviteAdminResult } from '../../../../domain/repositories/TeamRepository';
import { useSetTeamMemberStatus, useTeam } from '../hooks/useTeam';
import { InviteAdminModal } from './InviteAdminModal';
import { TemporaryPasswordModal } from './TemporaryPasswordModal';
import '../settings.css';

export const TeamTab: React.FC = () => {
  const { t, language } = useLanguage();
  const confirmWithReason = useConfirmWithReason();
  const team = useTeam();
  const setStatus = useSetTeamMemberStatus();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const members = team.members ?? [];
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;

  const onInvited = (result: InviteAdminResult) => {
    if (result.temporaryPassword) setIssued({ email: result.email, password: result.temporaryPassword });
  };

  const changeStatus = async (m: AdminMember, next: 'ACTIVE' | 'SUSPENDED') => {
    const key = next === 'ACTIVE' ? 'reactivate' : 'suspend';
    const { confirmed, reason } = await confirmWithReason({
      title: t(`team_confirm_${key}_title`),
      body: `${t(`team_confirm_${key}_body`)} ${m.name}`,
      tone: next === 'SUSPENDED' ? 'warning' : 'default',
      requireReason: next === 'SUSPENDED',
      confirmLabel: t(`team_action_${key}`),
      cancelLabel: t('btn_cancel'),
    });
    if (!confirmed) return;
    setStatus.mutate({ id: m.id, status: next, reason: reason || undefined });
  };

  const actions = (m: AdminMember) => {
    if (m.isSelf || m.status === 'BLOCKED') return null;
    if (m.status === 'ACTIVE') {
      if (activeCount <= 1) return null;
      return (
        <Button variant="ghost" size="sm" icon={<PauseCircle size={14} />} onClick={() => changeStatus(m, 'SUSPENDED')}>
          {t('team_action_suspend')}
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="sm" icon={<PlayCircle size={14} />} onClick={() => changeStatus(m, 'ACTIVE')}>
        {t('team_action_reactivate')}
      </Button>
    );
  };

  const statusPill = (m: AdminMember) => (
    <StatusPill variant={pillVariantFor('userAccount', m.status)} label={t(statusLabelKey('userAccount', m.status))} />
  );

  const member = (m: AdminMember) => (
    <span className="team-cell">
      <Avatar name={m.name} size={32} />
      <span className="team-cell__text">
        <span className="ui-text-strong ui-clamp-1">
          {m.name || '—'}
          {m.isSelf && <span className="ui-caption"> ({t('team_you')})</span>}
        </span>
        <bdi className="ui-num ui-caption ui-clamp-1">{m.email || '—'}</bdi>
      </span>
    </span>
  );

  const columns = [
    { key: 'member', header: t('team_col_member'), render: member },
    { key: 'title', header: t('team_col_title'), hideOnTablet: true, render: (m: AdminMember) => <span>{m.title || '—'}</span> },
    { key: 'status', header: t('team_col_status'), render: statusPill },
    {
      key: 'joined',
      header: t('team_col_joined'),
      hideOnTablet: true,
      render: (m: AdminMember) => <span>{m.createdAt ? formatDate(m.createdAt, language) : '—'}</span>,
    },
    { key: 'actions', header: t('team_col_actions'), align: 'end' as const, render: actions },
  ];

  if (team.error) {
    return (
      <ErrorState title={t('status_error_title')} message={team.error.message} onRetry={() => team.refetch()} retryLabel={t('btn_retry')} />
    );
  }

  if (team.unsupported) {
    return (
      <Card>
        <EmptyState icon={<Users size={20} />} title={t('team_unavailable')} body={t('team_unavailable_body')} />
      </Card>
    );
  }

  return (
    <div className="ui-stack">
      <div className="ui-row ui-row--between">
        <span className="ui-caption">{t('team_subtitle')}</span>
        <Button variant="primary" size="sm" icon={<UserPlus size={14} />} onClick={() => setInviteOpen(true)}>
          {t('team_invite_btn')}
        </Button>
      </div>
      <Card padding="none">
        <DataTable
          columns={columns}
          rows={members}
          rowKey={(m: AdminMember) => m.id}
          loading={team.loading}
          empty={<EmptyState icon={<Users size={20} />} title={t('team_empty')} />}
          mobile={(m: AdminMember) => (
            <div className="team-card">
              <div className="team-card__top">
                {member(m)}
                {statusPill(m)}
              </div>
              <div className="team-card__bottom">
                <span className="ui-caption">{m.title || '—'}</span>
                {actions(m)}
              </div>
            </div>
          )}
        />
      </Card>
      <InviteAdminModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={onInvited} />
      <TemporaryPasswordModal
        isOpen={issued !== null}
        email={issued?.email ?? ''}
        password={issued?.password ?? ''}
        onClose={() => setIssued(null)}
      />
    </div>
  );
};

export default TeamTab;
