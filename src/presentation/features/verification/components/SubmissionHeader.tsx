import React from 'react';
import { Flag, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { Submission } from '../types';
import { Avatar, Button, IconButton, StatusPill } from '../../../components/ui';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';
import { tf } from '../utils';

interface SubmissionHeaderProps {
  submission: Submission;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  onFlag: (reason?: string) => void;
  isSubmitting?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  isFlagged?: boolean;
  currentNotes?: string;
  onBackToList?: () => void;
}

export const SubmissionHeader: React.FC<SubmissionHeaderProps> = ({
  submission,
  onApprove,
  onReject,
  onFlag,
  isSubmitting = false,
  isApproved = false,
  isRejected = false,
  isFlagged = false,
  currentNotes = '',
  onBackToList,
}) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();

  const handleApproveClick = async () => {
    const ok = await confirm({
      title: tf(t, 'vr_approve_title', { name: submission.name }),
      body: (
        <div className="ui-stack ui-stack--tight">
          <span>{t('vr_approve_body')}</span>
          <ul className="vr-badge-list">
            <li>{t('vr_badge_id')}</li>
            <li>{t('vr_badge_cert')}</li>
            <li>{t('vr_badge_selfie')}</li>
            <li>{t('vr_badge_background')}</li>
            <li>{t('vr_badge_insured')}</li>
          </ul>
        </div>
      ),
      confirmLabel: t('vr_approve_confirm'),
      tone: 'default',
    });
    if (ok) onApprove();
  };

  const handleRejectClick = async () => {
    const res = await confirmWithReason({
      title: tf(t, 'vr_reject_title', { name: submission.name }),
      body: t('vr_reject_body'),
      confirmLabel: t('vr_reject_confirm'),
      tone: 'danger',
      requireReason: true,
      reasonPlaceholder: currentNotes || t('vr_reject_placeholder'),
    });
    if (res.confirmed) onReject(res.reason);
  };

  const handleFlagClick = async () => {
    const res = await confirmWithReason({
      title: tf(t, 'vr_flag_title', { name: submission.name }),
      body: t('vr_flag_body'),
      confirmLabel: t('vr_flag_confirm'),
      tone: 'warning',
      requireReason: true,
      reasonPlaceholder: currentNotes || t('vr_flag_placeholder'),
    });
    if (res.confirmed) onFlag(res.reason);
  };

  const shortId = submission.verificationId.replace(/^#/, '').slice(-6);
  const submittedWhen = submission.submittedAt ? formatRelativeTime(submission.submittedAt, language) : '—';

  return (
    <div className="submission-header">
      <div className="vr-submission-main">
        {onBackToList && (
          <div className="mobile-only">
            <IconButton
              icon={<ArrowLeft size={18} className="ui-icon--directional" />}
              aria-label={t('vr_back_queue')}
              onClick={onBackToList}
              variant="ghost"
            />
          </div>
        )}

        <Avatar src={submission.avatar} name={submission.name} size={48} />

        <div className="vr-submission-text">
          <div className="vr-submission-name-row">
            <h2 className="vr-submission-name">{submission.name}</h2>
            {isApproved && <StatusPill variant="success" label={t('status_approved')} />}
            {isRejected && <StatusPill variant="danger" label={t('status_rejected')} />}
            {isFlagged && <StatusPill variant="warning" label={t('status_flagged')} />}
          </div>

          <div className="vr-submission-meta">
            <span>{submission.role || t('vr_role_default')}</span>
            <span>·</span>
            <span>{tf(t, 'vr_submitted_at', { when: submittedWhen })}</span>
            <span>·</span>
            <bdi className="vr-mono">{tf(t, 'vr_id_label', { id: shortId })}</bdi>
          </div>
        </div>
      </div>

      <div className="submission-header-actions">
        <Button
          variant="outline"
          size="sm"
          iconLeading={<Flag size={14} />}
          onClick={handleFlagClick}
          disabled={isSubmitting || isFlagged}
        >
          {t('vr_btn_flag')}
        </Button>

        <Button
          variant="soft-danger"
          size="sm"
          iconLeading={<X size={14} />}
          onClick={handleRejectClick}
          disabled={isSubmitting || isRejected}
        >
          {t('vr_btn_reject')}
        </Button>

        <Button
          variant="primary"
          size="sm"
          iconLeading={<CheckCircle2 size={14} />}
          onClick={handleApproveClick}
          disabled={isSubmitting || isApproved}
          loading={isSubmitting}
        >
          {t('vr_btn_approve_all')}
        </Button>
      </div>
    </div>
  );
};

export default SubmissionHeader;
