import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Image as ImageIcon,
  History,
  Lock,
  DollarSign,
  Phone,
  Briefcase,
  ExternalLink,
  Send,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import { Segmented } from '../../../components/ui/Segmented';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Button } from '../../../components/ui/Button';
import { TextArea } from '../../../components/ui/FormFields';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { formatMoney } from '../../../../core/utils/format';
import { ReportItem, TemplatePreset } from '../types';

interface ReportDetailPanelProps {
  report: ReportItem;
  escrowStatus: 'RELEASED' | 'FROZEN' | 'REFUNDED';
  onToggleEscrow: (id: string, current: string) => Promise<void>;
  onRefundCustomer: (id: string) => Promise<void>;
  onExecuteAction: (
    action: 'dismiss' | 'warning' | 'suspend' | 'ban',
    target: 'reporter' | 'suspect' | 'both',
    message: string,
    reason: string
  ) => Promise<void>;
  onOpenOrderModal: () => void;
  onOpenLightbox: (imageUrl: string) => void;
  onBackToQueue?: () => void;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'dismiss_safe',
    label: '🟢 Case Safe & Closed',
    action: 'dismiss',
    target: 'reporter',
    text: 'Thank you for reporting. Following a safety investigation, no breach was identified. This case has been marked as resolved.',
  },
  {
    id: 'warning_suspect',
    label: '🟡 Issue Safety Warning',
    action: 'warning',
    target: 'suspect',
    text: 'Safety Warning: Your recent activity on Sonaa (Task #{taskId}) was flagged for violating community guidelines. Please adhere to platform rules.',
  },
  {
    id: 'update_reporter',
    label: '🔵 Update Reporter',
    action: 'dismiss',
    target: 'reporter',
    text: 'Hello {reporter}, your safety report #{id} has been reviewed by Sonaa Admin and appropriate action has been taken. Thank you for keeping Sonaa safe.',
  },
  {
    id: 'suspend_account',
    label: '🟠 Suspend Suspect Account',
    action: 'suspend',
    target: 'both',
    text: 'Notice: Sonaa partner account has been temporarily suspended pending safety audit regarding Report #{id}.',
  },
  {
    id: 'ban_account',
    label: '🔴 Permanent Ban',
    action: 'ban',
    target: 'both',
    text: 'Notice: Sonaa partner account has been permanently blocked due to confirmed severe safety violation in Report #{id}.',
  },
];

export const ReportDetailPanel: React.FC<ReportDetailPanelProps> = ({
  report,
  escrowStatus,
  onToggleEscrow,
  onRefundCustomer,
  onExecuteAction,
  onOpenOrderModal,
  onOpenLightbox,
  onBackToQueue,
}) => {
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'evidence' | 'audit'>('overview');
  const [selectedAction, setSelectedAction] = useState<'dismiss' | 'warning' | 'suspend' | 'ban'>('dismiss');
  const [messageTarget, setMessageTarget] = useState<'reporter' | 'suspect' | 'both'>('reporter');
  const [customMessage, setCustomMessage] = useState<string>(() => {
    return TEMPLATE_PRESETS[0].text
      .replace('{reporter}', report.reporter)
      .replace('{id}', report.id)
      .replace('{taskId}', report.taskDisplayId || report.id);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (preset: TemplatePreset) => {
    setSelectedAction(preset.action);
    setMessageTarget(preset.target);
    const formatted = preset.text
      .replace('{reporter}', report.reporter)
      .replace('{id}', report.id)
      .replace('{taskId}', report.taskDisplayId || report.id);
    setCustomMessage(formatted);
  };

  const handleEscrowToggle = async () => {
    const isFrozen = escrowStatus === 'FROZEN';
    const ok = await confirm({
      title: isFrozen ? 'Unfreeze Escrow Payout' : 'Freeze Escrow Payout',
      body: `Are you sure you want to ${isFrozen ? 'unfreeze' : 'freeze'} the escrow protection amount for this report?`,
      tone: isFrozen ? 'default' : 'warning',
      confirmLabel: isFrozen ? 'Unfreeze' : 'Freeze',
    });
    if (!ok) return;

    try {
      await onToggleEscrow(report.id, escrowStatus);
      toast.success(`Escrow payout successfully ${isFrozen ? 'unfrozen' : 'frozen'}.`);
    } catch {
      toast.error('Failed to update escrow state.');
    }
  };

  const handleRefund = async () => {
    const ok = await confirm({
      title: 'Issue Customer Refund',
      body: `Are you sure you want to refund ${formatMoney(report.orderBudget || 350)} back to customer ${report.reporter}?`,
      tone: 'danger',
      confirmLabel: 'Issue Refund',
    });
    if (!ok) return;

    try {
      await onRefundCustomer(report.id);
      toast.success('Customer refund has been processed.');
    } catch {
      toast.error('Failed to issue refund.');
    }
  };

  const handleExecute = async () => {
    const res = await confirmWithReason({
      title: `Execute ${selectedAction.toUpperCase()} & Dispatch Notification`,
      body: `This will apply the "${selectedAction.toUpperCase()}" decision on report #${report.id} and send the configured notification to ${messageTarget.toUpperCase()}.`,
      tone: selectedAction === 'ban' || selectedAction === 'suspend' ? 'danger' : 'default',
      confirmLabel: 'Execute Decision',
      requireReason: true,
      reasonPlaceholder: 'Enter moderator rationale for the platform audit trail...',
    });

    if (!res.confirmed || !res.reason) return;

    setIsSubmitting(true);
    try {
      await onExecuteAction(selectedAction, messageTarget, customMessage, res.reason);
      toast.success(`Report #${report.id} resolved with ${selectedAction.toUpperCase()}.`);
    } catch {
      toast.error('Failed to execute moderation action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailTabItems = [
    { value: 'overview', label: 'Incident Overview' },
    { value: 'chat', label: `Chat Logs (${report.chatLogs?.length || 0})` },
    { value: 'evidence', label: `Evidence (${report.evidenceImages?.length || 0})` },
    { value: 'audit', label: 'Audit Trail' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--sp-4)',
        textAlign: 'start',
      }}
    >
      {/* Mobile Back Button */}
      {onBackToQueue && (
        <button
          type="button"
          onClick={onBackToQueue}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-base)',
            color: 'var(--on-surface)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            alignSelf: 'flex-start',
          }}
        >
          <ChevronLeft size={16} />
          <span>Back to Queue</span>
        </button>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--sp-3)',
          gap: 'var(--sp-3)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--primary)',
                fontFamily: 'monospace',
              }}
            >
              Report #{report.id}
            </span>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--on-surface-subtle)',
                background: 'var(--surface-sunken)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              {report.category.toUpperCase()}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--on-surface)' }}>
            {report.title}
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            Submitted {report.time}
          </span>
        </div>

        <StatusPill
          variant={
            report.severity === 'high'
              ? 'danger'
              : report.severity === 'medium'
              ? 'warning'
              : 'neutral'
          }
        >
          {report.severity.toUpperCase()} SEVERITY
        </StatusPill>
      </div>

      {/* Tabs */}
      <Segmented
        value={activeTab}
        onChange={(v) => setActiveTab(v as any)}
        items={detailTabItems}
      />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {/* Escrow Protection Banner */}
          <div
            style={{
              background:
                escrowStatus === 'REFUNDED'
                  ? 'var(--info-soft, rgba(37, 99, 235, 0.1))'
                  : escrowStatus === 'RELEASED'
                  ? 'var(--success-soft, rgba(22, 163, 74, 0.1))'
                  : 'var(--warning-soft, rgba(234, 88, 12, 0.1))',
              border: `1px solid ${
                escrowStatus === 'REFUNDED'
                  ? 'var(--info)'
                  : escrowStatus === 'RELEASED'
                  ? 'var(--success)'
                  : 'var(--warning)'
              }`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--sp-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--sp-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div
                style={{
                  background:
                    escrowStatus === 'REFUNDED'
                      ? 'var(--info)'
                      : escrowStatus === 'RELEASED'
                      ? 'var(--success)'
                      : 'var(--warning)',
                  color: '#ffffff',
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)' }}>
                  Escrow Financial Protection: {formatMoney(report.orderBudget || 350)}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                  Status: <strong>{escrowStatus}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <Button size="sm" variant="outline" onClick={handleEscrowToggle}>
                {escrowStatus === 'FROZEN' ? 'Unfreeze Payout' : 'Freeze Payout'}
              </Button>
              <Button size="sm" variant="primary" icon={<DollarSign size={14} />} onClick={handleRefund}>
                Issue Customer Refund
              </Button>
            </div>
          </div>

          {/* Parties Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {/* Reporter */}
            <div
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--on-surface-subtle)', textTransform: 'uppercase' }}>
                  Reporter Profile
                </span>
                <span style={{ fontSize: '10px', background: 'var(--info-soft, rgba(37,99,235,0.15))', color: 'var(--info)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                  Customer
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
                {report.reporter}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)', marginTop: 4 }}>
                <Phone size={12} />
                <a href={`tel:${report.reporterPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {report.reporterPhone || '—'}
                </a>
              </div>
              <div style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
                ✓ {report.reporterPriorReportsCount || 1} Prior Report Submitted
              </div>
            </div>

            {/* Suspect */}
            <div
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--on-surface-subtle)', textTransform: 'uppercase' }}>
                  Reported Suspect
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    background:
                      report.suspectStatus === 'BLOCKED'
                        ? 'var(--danger-soft, rgba(239,68,68,0.15))'
                        : 'var(--warning-soft, rgba(245,158,11,0.15))',
                    color:
                      report.suspectStatus === 'BLOCKED'
                        ? 'var(--danger)'
                        : 'var(--warning)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {report.suspectStatus || 'ACTIVE'}
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
                {report.subject}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)', marginTop: 4 }}>
                <Phone size={12} />
                <a href={`tel:${report.suspectPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {report.suspectPhone || '—'}
                </a>
              </div>
              <div
                style={{
                  marginTop: 'var(--sp-2)',
                  fontSize: 'var(--text-xs)',
                  color: (report.suspectPriorReportsCount || 0) > 1 ? 'var(--danger)' : 'var(--on-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                {(report.suspectPriorReportsCount || 0) > 1 && <AlertTriangle size={12} />}
                <span>{report.suspectPriorReportsCount || 1} Reported Incident(s) Logged</span>
              </div>
            </div>
          </div>

          {/* Linked Order Context Card */}
          <div
            onClick={onOpenOrderModal}
            style={{
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--sp-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'background var(--motion-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div
                style={{
                  background: 'var(--info-soft, rgba(37,99,235,0.15))',
                  color: 'var(--primary)',
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)' }}>
                  {report.taskTitle || 'Linked Service Order'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                  Order Ref: <strong style={{ color: 'var(--primary)' }}>{report.taskDisplayId || report.id}</strong>
                </div>
              </div>
            </div>

            <Button size="sm" variant="outline" icon={<ExternalLink size={14} />}>
              Inspect Order
            </Button>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--on-surface-subtle)', textTransform: 'uppercase' }}>
              Reported Incident Statement
            </span>
            <div
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--on-surface)',
                lineHeight: 1.5,
              }}
            >
              {report.desc}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHAT LOGS */}
      {activeTab === 'chat' && (
        <div
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)' }}>
              Order Chat Log History
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
              Flagged messages highlighted
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {(report.chatLogs || []).map((msg, idx) => (
              <div
                key={idx}
                style={{
                  background: msg.flagged
                    ? 'var(--danger-soft, rgba(239, 68, 68, 0.12))'
                    : 'var(--surface-base)',
                  border: msg.flagged
                    ? '1px solid var(--danger)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: msg.sender === report.reporter ? 'var(--primary)' : 'var(--success)',
                    }}
                  >
                    {msg.sender}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                    {msg.time}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: msg.flagged ? 'var(--danger)' : 'var(--on-surface)',
                    fontWeight: msg.flagged ? 600 : 400,
                  }}
                >
                  {msg.text}
                </div>
                {msg.flagged && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--danger)',
                      background: 'var(--danger-soft, rgba(239, 68, 68, 0.2))',
                      padding: '1px 6px',
                      borderRadius: 4,
                      marginTop: 6,
                      display: 'inline-block',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ Flagged Message Signal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)' }}>
            Uploaded Photos & Attachments ({report.evidenceImages?.length || 0})
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--sp-3)',
            }}
          >
            {(report.evidenceImages || []).map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => onOpenLightbox(imgUrl)}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'var(--surface-sunken)',
                  transition: 'transform var(--motion-fast)',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Evidence photo ${idx + 1}`}
                  style={{ width: '100%', height: 120, objectFit: 'cover' }}
                />
                <div
                  style={{
                    padding: 'var(--sp-2)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--on-surface-subtle)',
                    textAlign: 'center',
                  }}
                >
                  Evidence #{idx + 1} 🔍
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT */}
      {activeTab === 'audit' && (
        <div
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)' }}>
            Incident Moderation Audit Log
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {(report.auditTrail || []).map((log, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    marginTop: 6,
                  }}
                />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                    By {log.actor} · {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--on-surface-subtle)', textTransform: 'uppercase' }}>
          Response Automation Presets
        </span>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          {TEMPLATE_PRESETS.map((preset) => {
            const isSelected = selectedAction === preset.action && messageTarget === preset.target;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyTemplate(preset)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  border: isSelected
                    ? '1px solid var(--border-focus)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--primary)' : 'var(--surface-sunken)',
                  color: isSelected ? '#ffffff' : 'var(--on-surface)',
                  cursor: 'pointer',
                  transition: 'background var(--motion-fast)',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Audience & Direct Notification Controls */}
      <div
        style={{
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--sp-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)' }}>
            Notification Target Audience:
          </span>
          <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
            {(['reporter', 'suspect', 'both'] as const).map((targ) => {
              const isSelected = messageTarget === targ;
              return (
                <button
                  key={targ}
                  type="button"
                  onClick={() => setMessageTarget(targ)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary)' : 'var(--surface-base)',
                    color: isSelected ? '#ffffff' : 'var(--on-surface-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {targ.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <TextArea
          label="Automated Notification Message (Editable):"
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Type message to dispatch to selected party..."
          sunken
        />
      </div>

      {/* Execute Button */}
      <Button
        variant={selectedAction === 'ban' || selectedAction === 'suspend' ? 'danger' : 'primary'}
        size="lg"
        icon={<Send size={16} />}
        loading={isSubmitting}
        onClick={handleExecute}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Execute {selectedAction.toUpperCase()} & Dispatch Notification
      </Button>
    </div>
  );
};
