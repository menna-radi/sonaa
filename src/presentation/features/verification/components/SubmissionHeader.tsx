import React from 'react';
import { Flag, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { Submission } from '../types';
import { Avatar, Button, IconButton, StatusPill } from '../../../components/ui';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';

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
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();

  const handleApproveClick = async () => {
    const ok = await confirm({
      title: `Approve ${submission.name}`,
      body: `Are you sure you want to approve this craftsman for platform activation? All identity checks will be marked as verified.`,
      confirmLabel: 'Approve Submission',
      tone: 'default',
    });
    if (ok) {
      onApprove();
    }
  };

  const handleRejectClick = async () => {
    const res = await confirmWithReason({
      title: `Reject ${submission.name}`,
      body: `Please provide a reason for rejecting this verification request. This note will be recorded in the audit log.`,
      confirmLabel: 'Reject Submission',
      tone: 'danger',
      requireReason: true,
      reasonPlaceholder: currentNotes || 'Explain why this submission is rejected (e.g. blurry ID photo)...',
    });
    if (res.confirmed) {
      onReject(res.reason);
    }
  };

  const handleFlagClick = async () => {
    const res = await confirmWithReason({
      title: `Flag ${submission.name}`,
      body: `Flagging marks this submission for suspicious activity or secondary escalation.`,
      confirmLabel: 'Flag Submission',
      tone: 'warning',
      requireReason: true,
      reasonPlaceholder: currentNotes || 'Reason for flagging (e.g. mismatched document numbers)...',
    });
    if (res.confirmed) {
      onFlag(res.reason);
    }
  };

  const shortId = submission.verificationId.replace(/^#/, '').slice(-6);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--sp-4)',
        padding: 'var(--sp-4) var(--sp-6)',
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}
      className="submission-header"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        {onBackToList && (
          <div className="mobile-only">
            <IconButton
              icon={<ArrowLeft size={18} />}
              aria-label="Back to queue"
              onClick={onBackToList}
              variant="ghost"
            />
          </div>
        )}

        <Avatar src={submission.avatar} name={submission.name} size={48} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--fs-card-title)',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {submission.name}
            </h2>
            {isApproved && <StatusPill variant="success" label="Approved" />}
            {isRejected && <StatusPill variant="danger" label="Rejected" />}
            {isFlagged && <StatusPill variant="warning" label="Flagged" />}
          </div>

          <div
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--text-faint)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
            }}
          >
            <span>{submission.role || 'Craftsman'}</span>
            <span>·</span>
            <span>Submitted {submission.submittedAgo || 'Today'}</span>
            <span>·</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>ID #{shortId}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          flexWrap: 'wrap',
        }}
        className="submission-header-actions"
      >
        <Button
          variant="outline"
          size="sm"
          iconLeading={<Flag size={14} />}
          onClick={handleFlagClick}
          disabled={isSubmitting || isFlagged}
        >
          Flag
        </Button>

        <Button
          variant="soft-danger"
          size="sm"
          iconLeading={<X size={14} />}
          onClick={handleRejectClick}
          disabled={isSubmitting || isRejected}
        >
          Reject
        </Button>

        <Button
          variant="primary"
          size="sm"
          iconLeading={<CheckCircle2 size={14} />}
          onClick={handleApproveClick}
          disabled={isSubmitting || isApproved}
          loading={isSubmitting}
        >
          Approve all
        </Button>
      </div>
    </div>
  );
};

export default SubmissionHeader;
