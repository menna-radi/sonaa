import React, { useState } from 'react';
import type { Craftsman } from '../hooks/useCraftsmen';
import {
  Avatar,
  VerifiedMark,
  StatusPill,
  StatTile,
  ChecklistChip,
  Card,
  ConfirmDialog,
  useToast,
} from '../../../components/ui';
import { Sparkline } from '../../../components/charts';
import { CraftsmanActions } from './CraftsmanActions';
import { formatMoney } from '../../../../core/utils/format';
import { MoreHorizontal, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface CraftsmanDetailPanelProps {
  craftsman: Craftsman | null;
  onSuspend: (id: string, reason?: string) => Promise<void>;
  onUnsuspend: (id: string) => Promise<void>;
  onBan: (id: string) => Promise<void>;
  onToggleVerification: (id: string, key: keyof Craftsman['verifications'], approved: boolean) => Promise<void>;
  onViewProfile?: (craftsman: Craftsman) => void;
  className?: string;
}

export const CraftsmanDetailPanel: React.FC<CraftsmanDetailPanelProps> = ({
  craftsman,
  onSuspend,
  onUnsuspend,
  onBan,
  onToggleVerification,
  onViewProfile,
  className = '',
}) => {
  const { success, error } = useToast();
  const [confirmKey, setConfirmKey] = useState<keyof Craftsman['verifications'] | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  if (!craftsman) {
    return (
      <Card className={`craftsman-detail-panel ${className}`} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-caption)' }}>
          Select a craftsman to inspect details
        </span>
      </Card>
    );
  }

  const isVerified =
    craftsman.verifications?.nationalId ||
    (craftsman.verifications?.selfieMatch && craftsman.verifications?.bankIban);

  const verificationItems: { key: keyof Craftsman['verifications']; label: string }[] = [
    { key: 'nationalId', label: 'National ID' },
    { key: 'selfieMatch', label: 'Selfie Match' },
    { key: 'tradeLicense', label: 'Trade License' },
    { key: 'bankIban', label: 'Bank IBAN' },
    { key: 'backgroundCheck', label: 'Background Check' },
    { key: 'insurance', label: 'Insurance' },
  ];

  const handleToggleClick = (key: keyof Craftsman['verifications']) => {
    setConfirmKey(key);
  };

  const handleConfirmToggle = async () => {
    if (!confirmKey) return;
    setToggleLoading(true);
    const current = Boolean(craftsman.verifications?.[confirmKey]);
    try {
      await onToggleVerification(craftsman.id, confirmKey, !current);
      success(`${confirmKey} status updated for ${craftsman.name}.`);
      setConfirmKey(null);
    } catch (err: any) {
      error(err?.message || 'Failed to update verification status.');
    } finally {
      setToggleLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(craftsman.idNumber || craftsman.id);
    success('Craftsman ID copied to clipboard');
  };

  return (
    <Card
      className={`craftsman-detail-panel ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header Profile block */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
        <Avatar
          src={craftsman.avatarUrl}
          name={craftsman.name}
          size={64}
          shape="square"
          presence={craftsman.status === 'suspended' ? 'flagged' : craftsman.isAvailable ? 'online' : 'offline'}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: 'var(--fs-card-title)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {craftsman.name}
              </h2>
              {isVerified && <VerifiedMark size={16} />}
            </div>

            <button
              type="button"
              onClick={copyId}
              style={{
                background: 'none',
                border: 'none',
                padding: 'var(--sp-1)',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              title="Copy Craftsman ID"
            >
              <Copy size={14} />
            </button>
          </div>

          <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
            {craftsman.trade} · Joined {craftsman.joinedDate || '2024'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 4 }}>
            <StatusPill
              variant={craftsman.status === 'suspended' ? 'danger' : craftsman.isAvailable ? 'success' : 'neutral'}
              label={craftsman.status === 'suspended' ? 'Suspended' : craftsman.isAvailable ? 'Online' : 'Offline'}
              dot={craftsman.isAvailable && craftsman.status !== 'suspended'}
            />
            <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>
              #{craftsman.idNumber || craftsman.id.slice(0, 8)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stat Tiles (4-grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-2)' }}>
        <StatTile
          label="Rating"
          value={
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              ★ {Number(craftsman.rating || 5.0).toFixed(1)}
            </span>
          }
          caption={`${craftsman.reviewsCount || 0} reviews`}
        />
        <StatTile
          label="Jobs"
          value={craftsman.jobsCount || 0}
          caption="completed"
        />
        <StatTile
          label="Response"
          value={craftsman.responseTimeMin ? `${craftsman.responseTimeMin}m` : '—'}
          caption="avg time"
        />
        <StatTile
          label="Trust Score"
          value={`${Math.round(Number(craftsman.trustScore ?? 0.85) * 100)}%`}
          caption="out of 100"
        />
      </div>

      {/* 3. Verification Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        <span
          style={{
            fontSize: 'var(--fs-micro)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--text-muted)',
          }}
        >
          Verification Status
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-2)' }}>
          {verificationItems.map((item) => {
            const checked = Boolean(craftsman.verifications?.[item.key]);
            return (
              <ChecklistChip
                key={item.key}
                label={item.label}
                checked={checked}
                onClick={() => handleToggleClick(item.key)}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Earnings Card (Render ONLY if API provides real earnings) */}
      {typeof craftsman.earnings30Days === 'number' && (
        <Card variant="inverse" style={{ padding: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 'var(--fs-caption)', opacity: 0.8 }}>Earnings · Last 30 days</span>
            <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--success)', fontWeight: 700 }}>
              {craftsman.earningsChangePct ? `+${craftsman.earningsChangePct}%` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 'var(--fs-card-title)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(craftsman.earnings30Days)}
            </span>
            {craftsman.earningsSparkline && (
              <Sparkline data={craftsman.earningsSparkline} color="var(--on-inverse)" width={100} height={24} />
            )}
          </div>
        </Card>
      )}

      {/* 5. Actions Row */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border-subtle)' }}>
        <CraftsmanActions
          craftsman={craftsman}
          onSuspend={onSuspend}
          onUnsuspend={onUnsuspend}
          onBan={onBan}
          onViewProfile={onViewProfile}
        />
      </div>

      {/* Toggle Verification ConfirmDialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmKey)}
        title={
          confirmKey === 'nationalId' && craftsman.verifications?.nationalId
            ? 'Revoke National ID Verification?'
            : `Update ${confirmKey} Status?`
        }
        description={
          confirmKey === 'nationalId' && craftsman.verifications?.nationalId
            ? 'WARNING: Revoking National ID verification will flag this craftsman as unverified and notify the user.'
            : `Are you sure you want to toggle the ${confirmKey} verification status for ${craftsman.name}?`
        }
        confirmLabel="Confirm Change"
        confirmVariant={
          confirmKey === 'nationalId' && craftsman.verifications?.nationalId ? 'danger' : 'primary'
        }
        isLoading={toggleLoading}
        onConfirm={handleConfirmToggle}
        onCancel={() => setConfirmKey(null)}
      />
    </Card>
  );
};

export default CraftsmanDetailPanel;
