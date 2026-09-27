import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Trash2,
  Smartphone,
  Eye,
  Calendar,
  Users,
} from 'lucide-react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { SubscriptionRequestItem, Subscriber, SubscriptionPlan } from '../../../../domain/repositories/PaymentRepository';
import { Segmented } from '../../../components/ui/Segmented';
import { Button } from '../../../components/ui/Button';
import { StatusPill } from '../../../components/ui/StatusPill';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { TextField, TextArea } from '../../../components/ui/FormFields';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { ImageLightbox } from '../../verification/components/ImageLightbox';
import { formatMoney } from '../../../../core/utils/format';

interface BitSubscriptionManagerProps {
  onRefreshNeeded?: () => void;
}

export const BitSubscriptionManager: React.FC<BitSubscriptionManagerProps> = ({ onRefreshNeeded }) => {
  const { dependencies } = useDependencies();
  const { paymentRepository } = dependencies;
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'requests' | 'plans' | 'subscribers'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_VERIFICATION');

  // Preview Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Bit Settings Modal
  const [showBitModal, setShowBitModal] = useState(false);
  const [bitPhone, setBitPhone] = useState('+972 54 888 9999');
  const [bitRecipient, setBitRecipient] = useState('Sonaa Services (صنّاع)');
  const [bitInstEn, setBitInstEn] = useState('');
  const [bitInstAr, setBitInstAr] = useState('');
  const [savingBit, setSavingBit] = useState(false);

  // Create Plan Modal
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanNameEn, setNewPlanNameEn] = useState('');
  const [newPlanNameAr, setNewPlanNameAr] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState(1);
  const [newPlanPrice, setNewPlanPrice] = useState(150);
  const [newPlanFeaturesEn, setNewPlanFeaturesEn] = useState('');
  const [newPlanFeaturesAr, setNewPlanFeaturesAr] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // ── Queries (30s polling, off in background) ──
  const {
    data: requests = [],
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = useQuery<SubscriptionRequestItem[]>({
    queryKey: ['subscriptionRequests', statusFilter],
    queryFn: async () => {
      const res = await paymentRepository.getSubscriptionRequests(statusFilter);
      return res.success ? res.data : [];
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const {
    data: plans = [],
    isLoading: loadingPlans,
    refetch: refetchPlans,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const res = await paymentRepository.getSubscriptionPlans();
      return res.success ? res.data : [];
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const { refetch: refetchSettings } = useQuery({
    queryKey: ['bitSettings'],
    queryFn: async () => {
      const res = await paymentRepository.getBitSettings();
      if (res.success && res.data) {
        setBitPhone(res.data.BIT_PHONE_NUMBER || '+972 54 888 9999');
        setBitRecipient(res.data.BIT_RECIPIENT_NAME || 'Sonaa Services (صنّاع)');
        setBitInstEn(res.data.BIT_INSTRUCTIONS_EN || '');
        setBitInstAr(res.data.BIT_INSTRUCTIONS_AR || '');
        return res.data;
      }
      return null;
    },
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const {
    data: subscribers = [],
    isLoading: loadingSubscribers,
    refetch: refetchSubscribers,
  } = useQuery<Subscriber[]>({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const res = await paymentRepository.getSubscribers();
      return res.success ? res.data : [];
    },
    enabled: activeTab === 'subscribers',
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  // ── Handlers ──
  const handleApprove = async (req: SubscriptionRequestItem) => {
    const ok = await confirm({
      title: 'Approve Bit Payment Receipt',
      body: `Approve Bit payment receipt of ${formatMoney(req.price, 'ILS')} for craftsman ${req.userName}? This will activate their ${req.planTitle} subscription immediately.`,
      confirmLabel: 'Approve & Activate',
    });
    if (!ok) return;

    const res = await paymentRepository.approveSubscriptionRequest(req.id);
    if (res.success) {
      toast.success(`Subscription activated for ${req.userName}.`);
      queryClient.invalidateQueries({ queryKey: ['subscriptionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      onRefreshNeeded?.();
    } else {
      toast.error('Failed to approve request.');
    }
  };

  const handleReject = async (req: SubscriptionRequestItem) => {
    const res = await confirmWithReason({
      title: 'Reject Bit Payment Request',
      body: `Reject subscription request for craftsman ${req.userName}?`,
      tone: 'danger',
      confirmLabel: 'Reject Request',
      requireReason: true,
      reasonPlaceholder: 'Reason for rejection (e.g. invalid receipt, transfer amount mismatch)...',
    });
    if (!res.confirmed || !res.reason) return;

    const apiRes = await paymentRepository.rejectSubscriptionRequest(req.id, res.reason);
    if (apiRes.success) {
      toast.success(`Subscription request rejected.`);
      queryClient.invalidateQueries({ queryKey: ['subscriptionRequests'] });
      onRefreshNeeded?.();
    } else {
      toast.error('Failed to reject request.');
    }
  };

  const handleSaveBitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBit(true);
    const res = await paymentRepository.updateBitSettings({
      BIT_PHONE_NUMBER: bitPhone,
      BIT_RECIPIENT_NAME: bitRecipient,
      BIT_INSTRUCTIONS_EN: bitInstEn,
      BIT_INSTRUCTIONS_AR: bitInstAr,
    });
    setSavingBit(false);
    if (res.success) {
      toast.success('Bit payment instructions updated successfully.');
      setShowBitModal(false);
      refetchSettings();
    } else {
      toast.error('Failed to update Bit settings.');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanNameEn.trim()) return;
    setSavingPlan(true);

    const res = await paymentRepository.createSubscriptionPlan({
      name: newPlanNameEn,
      nameAr: newPlanNameAr || newPlanNameEn,
      price: Number(newPlanPrice),
      durationMonths: Number(newPlanDuration),
      features: newPlanFeaturesEn.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSavingPlan(false);

    if (res.success) {
      toast.success('Subscription plan created.');
      setShowCreatePlanModal(false);
      setNewPlanNameEn('');
      setNewPlanNameAr('');
      refetchPlans();
    } else {
      toast.error('Failed to create subscription plan.');
    }
  };

  const handleSuspendSubscriber = async (sub: Subscriber) => {
    const name = sub.craftsmanName || sub.user?.firstName || 'craftsman';
    const ok = await confirm({
      title: 'Suspend Subscriber',
      body: `Are you sure you want to suspend subscription access for ${name}?`,
      tone: 'danger',
      confirmLabel: 'Suspend Subscription',
    });
    if (!ok) return;

    const res = await paymentRepository.cancelSubscriber(sub.id);
    if (res.success) {
      toast.success(`Subscription suspended for ${name}.`);
      refetchSubscribers();
    } else {
      toast.error('Failed to suspend subscriber.');
    }
  };

  const handleExtendSubscriber = async (sub: Subscriber) => {
    const name = sub.craftsmanName || sub.user?.firstName || 'craftsman';
    const ok = await confirm({
      title: 'Extend Subscription',
      body: `Extend subscription by 30 days for ${name}?`,
      confirmLabel: 'Extend +30 Days',
    });
    if (!ok) return;

    const res = await paymentRepository.extendSubscriber(sub.id, 30);
    if (res.success) {
      toast.success(`Subscription extended by 30 days for ${name}.`);
      refetchSubscribers();
    } else {
      toast.error('Failed to extend subscription.');
    }
  };

  // ── Columns ──
  const requestColumns: Column<SubscriptionRequestItem>[] = [
    {
      key: 'craftsman',
      header: 'Craftsman',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{r.userName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            {r.userPhone || r.craftsmanTitle || 'Craftsman'}
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{r.planTitle}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            {r.durationMonths} {r.durationMonths === 1 ? 'Month' : 'Months'}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => (
        <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>
          {formatMoney(r.price, 'ILS')}
        </span>
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt Proof',
      render: (r) =>
        r.paymentProofUrl ? (
          <button
            type="button"
            onClick={() => setLightboxImage(r.paymentProofUrl)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-sunken)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
            }}
          >
            <Eye size={12} />
            <span>View Receipt</span>
          </button>
        ) : (
          <span style={{ color: 'var(--on-surface-subtle)', fontSize: 'var(--text-xs)' }}>—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusPill
          variant={
            r.status === 'APPROVED'
              ? 'success'
              : r.status === 'PENDING_VERIFICATION'
              ? 'warning'
              : 'danger'
          }
        >
          {r.status === 'PENDING_VERIFICATION' ? 'PENDING' : r.status}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (r) =>
        r.status === 'PENDING_VERIFICATION' ? (
          <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
            <Button size="sm" variant="ghost" onClick={() => handleReject(r)}>
              Reject
            </Button>
            <Button size="sm" variant="primary" onClick={() => handleApprove(r)}>
              Approve
            </Button>
          </div>
        ) : (
          <span style={{ color: 'var(--on-surface-subtle)', fontSize: 'var(--text-xs)' }}>
            Completed
          </span>
        ),
    },
  ];

  const subscriberColumns: Column<Subscriber>[] = [
    {
      key: 'craftsman',
      header: 'Craftsman',
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
            {s.craftsmanName || s.user?.firstName || 'Craftsman'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            {s.user?.phoneNumber || s.craftsmanTitle || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <StatusPill variant={s.subscriptionStatus === 'ACTIVE' ? 'success' : 'neutral'}>
          {s.subscriptionStatus}
        </StatusPill>
      ),
    },
    {
      key: 'expiry',
      header: 'Expiry Date',
      render: (s) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
          {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (s) => (
        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="outline" onClick={() => handleExtendSubscriber(s)}>
            +30 Days
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleSuspendSubscriber(s)}>
            Suspend
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <Segmented
            value={activeTab}
            onChange={(v) => setActiveTab(v as any)}
            items={[
              { value: 'requests', label: 'Receipt Queue', count: requests.length },
              { value: 'plans', label: 'Subscription Plans', count: plans.length },
              { value: 'subscribers', label: 'Subscribers' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          {activeTab === 'plans' && (
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={() => setShowCreatePlanModal(true)}
            >
              New Plan
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            icon={<Settings size={14} />}
            onClick={() => setShowBitModal(true)}
          >
            Bit Settings
          </Button>
        </div>
      </div>

      {/* TAB 1: REQUESTS */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Segmented
              value={statusFilter}
              onChange={setStatusFilter}
              items={[
                { value: 'PENDING_VERIFICATION', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'ALL', label: 'All Requests' },
              ]}
            />
          </div>

          <DataTable
            columns={requestColumns}
            rows={requests}
            rowKey={(r) => r.id}
            loading={loadingRequests}
          />
        </div>
      )}

      {/* TAB 2: PLANS */}
      {activeTab === 'plans' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
          {plans.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--on-surface)' }}>
                  {p.name}
                </span>
                <StatusPill variant="neutral">
                  {p.durationMonths || 1} {p.durationMonths === 1 ? 'Month' : 'Months'}
                </StatusPill>
              </div>

              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--on-surface)' }}>
                {formatMoney(p.price, 'ILS')}
              </div>

              <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                {(p.featuresEn || ['Accept Unlimited Tasks', 'Direct Customer Chat', 'Verified Badge']).map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <DataTable
          columns={subscriberColumns}
          rows={subscribers}
          rowKey={(s) => s.id}
          loading={loadingSubscribers}
        />
      )}

      {/* Bit Settings Modal */}
      {showBitModal && (
        <Modal
          isOpen={showBitModal}
          onClose={() => setShowBitModal(false)}
          title="Bit Payment Gateway Settings"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', width: '100%' }}>
              <Button variant="ghost" onClick={() => setShowBitModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={savingBit} onClick={handleSaveBitSettings}>
                Save Bit Settings
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveBitSettings} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <TextField
              label="Bit Phone Number (Recipient)"
              value={bitPhone}
              onChange={(e) => setBitPhone(e.target.value)}
              placeholder="+972 5X XXX XXXX"
              required
            />
            <TextField
              label="Recipient Name (Account Holder)"
              value={bitRecipient}
              onChange={(e) => setBitRecipient(e.target.value)}
              placeholder="Sonaa Platform"
              required
            />
            <TextArea
              label="English Instructions (Shown on Android App)"
              value={bitInstEn}
              onChange={(e) => setBitInstEn(e.target.value)}
              rows={2}
            />
            <TextArea
              label="Arabic Instructions (Shown on Android App)"
              value={bitInstAr}
              onChange={(e) => setBitInstAr(e.target.value)}
              rows={2}
            />
          </form>
        </Modal>
      )}

      {/* Create Plan Modal */}
      {showCreatePlanModal && (
        <Modal
          isOpen={showCreatePlanModal}
          onClose={() => setShowCreatePlanModal(false)}
          title="Create New Subscription Plan"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', width: '100%' }}>
              <Button variant="ghost" onClick={() => setShowCreatePlanModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={savingPlan} onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <TextField
              label="Plan Name (English)"
              value={newPlanNameEn}
              onChange={(e) => setNewPlanNameEn(e.target.value)}
              placeholder="e.g. Quarterly Pro"
              required
            />
            <TextField
              label="Plan Name (Arabic)"
              value={newPlanNameAr}
              onChange={(e) => setNewPlanNameAr(e.target.value)}
              placeholder="e.g. باقة الربع سنوية الاحترافية"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
              <TextField
                label="Duration (Months)"
                type="number"
                value={newPlanDuration}
                onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                required
              />
              <TextField
                label="Price (ILS ₪)"
                type="number"
                value={newPlanPrice}
                onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                required
              />
            </div>
            <TextArea
              label="Features (comma-separated)"
              value={newPlanFeaturesEn}
              onChange={(e) => setNewPlanFeaturesEn(e.target.value)}
              placeholder="Direct bids, Unlimited tasks, Priority listing"
            />
          </form>
        </Modal>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <ImageLightbox url={lightboxImage} onClose={() => setLightboxImage(null)} title="Bit Payment Receipt Proof" />
      )}
    </div>
  );
};
