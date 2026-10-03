import React from 'react';
import { RotateCw, Check, X } from 'lucide-react';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { StatusPill } from '../../../components/ui/StatusPill';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { formatMoney } from '../../../../core/utils/format';
import { FailedTransaction, LegacyWithdrawalRequest as WithdrawalRequest } from '../../../../domain/entities/Payment';
import { useLanguage } from '../../../context/LanguageContext';

interface PayoutsTableProps {
  failedTransactions: FailedTransaction[];
  withdrawalRequests: WithdrawalRequest[];
  retryingId: string | null;
  onRetry: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PayoutsTable: React.FC<PayoutsTableProps> = ({
  failedTransactions,
  withdrawalRequests,
  retryingId,
  onRetry,
  onApprove,
  onReject,
}) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();

  const handleApproveWithdrawal = async (req: WithdrawalRequest) => {
    const ok = await confirm({
      title: 'Approve Withdrawal Request',
      body: `Approve withdrawal payout of ${formatMoney(req.amount, 'ILS', language)} to ${req.name} (${req.bank})?`,
      confirmLabel: 'Approve Payout',
    });
    if (ok) {
      onApprove(req.id);
    }
  };

  const handleRejectWithdrawal = async (req: WithdrawalRequest) => {
    const ok = await confirm({
      title: 'Reject Withdrawal Request',
      body: `Reject withdrawal payout request for ${req.name}?`,
      tone: 'danger',
      confirmLabel: 'Reject Request',
    });
    if (ok) {
      onReject(req.id);
    }
  };

  const failedColumns: Column<FailedTransaction>[] = [
    {
      key: 'transaction',
      header: 'Transaction',
      render: (tx) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{tx.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            {tx.txId} · {tx.bank} · {tx.timeAgo}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx) => (
        <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>
          {formatMoney(tx.amount, 'ILS', language)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Failure Reason',
      render: (tx) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>
          {t(tx.reasonKey) || tx.reasonKey.replace('reason_', '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'retries',
      header: 'Retries',
      render: (tx) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
          {tx.retries} attempts
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'end',
      render: (tx) => {
        const isRetrying = retryingId === tx.id;
        return (
          <Button
            size="sm"
            variant="outline"
            icon={<RotateCw size={12} className={isRetrying ? 'animate-spin' : ''} />}
            loading={isRetrying}
            onClick={() => onRetry(tx.id)}
          >
            Retry
          </Button>
        );
      },
    },
  ];

  const withdrawalColumns: Column<WithdrawalRequest>[] = [
    {
      key: 'craftsman',
      header: 'Craftsman / Account',
      render: (req) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{req.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            {req.bank} · {req.timeAgo}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (req) => (
        <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>
          {formatMoney(req.amount, 'ILS', language)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (req) => (
        <StatusPill
          variant={
            req.status === 'approved'
              ? 'success'
              : req.status === 'pending'
              ? 'warning'
              : 'danger'
          }
        >
          {req.status.toUpperCase()}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (req) =>
        req.status === 'pending' ? (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
            <Button
              size="sm"
              variant="ghost"
              icon={<X size={12} />}
              onClick={() => handleRejectWithdrawal(req)}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Check size={12} />}
              onClick={() => handleApproveWithdrawal(req)}
            >
              Approve
            </Button>
          </div>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            Processed
          </span>
        ),
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 'var(--sp-4)',
      }}
    >
      {/* Failed Transactions */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--on-surface)' }}>
              {t('payments_failed_tx') || 'Failed Transactions'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
              {failedTransactions.length} require attention
            </div>
          </div>
        </div>

        <DataTable
          columns={failedColumns}
          rows={failedTransactions}
          rowKey={(tx) => tx.id}
        />
      </div>

      {/* Withdrawal Requests */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--on-surface)' }}>
              {t('payments_withdrawal_reqs') || 'Withdrawal Requests'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
              {withdrawalRequests.filter((w) => w.status === 'pending').length} pending approval
            </div>
          </div>
        </div>

        <DataTable
          columns={withdrawalColumns}
          rows={withdrawalRequests}
          rowKey={(req) => req.id}
        />
      </div>
    </div>
  );
};
