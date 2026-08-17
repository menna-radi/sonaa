import React, { useState, useEffect } from 'react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { SubscriptionRequestItem } from '../../../../domain/repositories/PaymentRepository';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings,
  Plus,
  Trash2,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  FileText,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  X,
  Edit,
  ShieldAlert,
  Search,
  Sparkles
} from 'lucide-react';

export const BitSubscriptionManager: React.FC<{ onRefreshNeeded?: () => void }> = ({ onRefreshNeeded }) => {
  const { dependencies } = useDependencies();
  const { paymentRepository } = dependencies;

  const [requests, setRequests] = useState<SubscriptionRequestItem[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'plans' | 'subscribers'>('requests');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_VERIFICATION');

  // Bit Settings Modal
  const [showBitModal, setShowBitModal] = useState(false);
  const [bitPhone, setBitPhone] = useState('+972 54 888 9999');
  const [bitRecipient, setBitRecipient] = useState('Sonaa Services (صنّاع)');
  const [bitInstEn, setBitInstEn] = useState('');
  const [bitInstAr, setBitInstAr] = useState('');
  const [savingBit, setSavingBit] = useState(false);

  // Image Modal Inspection
  const [activePreviewRequest, setActivePreviewRequest] = useState<any | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Reject Modal
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Create Plan Modal
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [newPlanNameEn, setNewPlanNameEn] = useState('');
  const [newPlanNameAr, setNewPlanNameAr] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState(1);
  const [newPlanPrice, setNewPlanPrice] = useState(150);
  const [newPlanFeaturesEn, setNewPlanFeaturesEn] = useState('');
  const [newPlanFeaturesAr, setNewPlanFeaturesAr] = useState('');
  const [newPlanIsPopular, setNewPlanIsPopular] = useState(false);

  // Subscribers Directory
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [reqRes, plansRes, bitRes] = await Promise.all([
      paymentRepository.getSubscriptionRequests(statusFilter),
      paymentRepository.getSubscriptionPlans(),
      paymentRepository.getBitSettings(),
    ]);

    if (reqRes.success) setRequests(reqRes.data);
    if (plansRes.success) setPlans(plansRes.data);
    if (bitRes.success) {
      setBitPhone(bitRes.data.BIT_PHONE_NUMBER || '+972 54 888 9999');
      setBitRecipient(bitRes.data.BIT_RECIPIENT_NAME || 'Sonaa Services (صنّاع)');
      setBitInstEn(bitRes.data.BIT_INSTRUCTIONS_EN || '');
      setBitInstAr(bitRes.data.BIT_INSTRUCTIONS_AR || '');
    }
    setLoading(false);
  };

  const loadSubscribers = async () => {
    setSubscribersLoading(true);
    const res = await paymentRepository.getSubscribers();
    if (res.success) setSubscribers(res.data);
    setSubscribersLoading(false);
  };

  const handleCancelSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this craftsman\'s subscription?')) return;
    await paymentRepository.cancelSubscriber(id);
    loadSubscribers();
  };

  const handleExtendSubscriber = async (id: string, days: number = 30) => {
    await paymentRepository.extendSubscriber(id, days);
    loadSubscribers();
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      loadSubscribers();
      const interval = setInterval(() => {
        loadSubscribers();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approve Bit payment receipt and activate craftsman subscription?')) return;
    setSubmittingAction(true);
    const res = await paymentRepository.approveSubscriptionRequest(requestId);
    setSubmittingAction(false);
    if (res.success) {
      alert('🎉 Subscription activated successfully! Notification and template message sent to user.');
      loadData();
      if (onRefreshNeeded) onRefreshNeeded();
    } else {
      alert('Error approving request: ' + (res.error?.message || 'Failed'));
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectionReason.trim()) return;
    setSubmittingAction(true);
    const res = await paymentRepository.rejectSubscriptionRequest(rejectingRequestId, rejectionReason.trim());
    setSubmittingAction(false);
    if (res.success) {
      alert('Subscription request rejected.');
      setRejectingRequestId(null);
      setRejectionReason('');
      loadData();
    } else {
      alert('Error rejecting request: ' + (res.error?.message || 'Failed'));
    }
  };

  const handleSaveBitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBit(true);
    await paymentRepository.updateBitSettings({
      BIT_PHONE_NUMBER: bitPhone,
      BIT_RECIPIENT_NAME: bitRecipient,
      BIT_INSTRUCTIONS_EN: bitInstEn,
      BIT_INSTRUCTIONS_AR: bitInstAr,
    });
    setSavingBit(false);
    setShowBitModal(false);
    alert('Bit Payment Settings updated successfully.');
  };

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState('');

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setNewPlanNameEn('');
    setNewPlanNameAr('');
    setNewPlanDuration(1);
    setNewPlanPrice(150);
    setNewPlanFeaturesEn('');
    setNewPlanFeaturesAr('');
    setNewPlanIsPopular(false);
    setShowCreatePlanModal(true);
  };

  const handleOpenEditPlanModal = (plan: any) => {
    setEditingPlan(plan);
    setNewPlanNameEn(plan.nameEn || plan.name || '');
    setNewPlanNameAr(plan.nameAr || plan.name || '');
    setNewPlanDuration(plan.durationMonths || 1);
    setNewPlanPrice(plan.price || 150);
    setNewPlanFeaturesEn(Array.isArray(plan.featuresEn) ? plan.featuresEn.join('\n') : plan.featuresEn || '');
    setNewPlanFeaturesAr(Array.isArray(plan.featuresAr) ? plan.featuresAr.join('\n') : plan.featuresAr || '');
    setNewPlanIsPopular(Boolean(plan.isPopular));
    setShowCreatePlanModal(true);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanNameEn.trim()) return;
    setSubmittingAction(true);
    
    const featEn = newPlanFeaturesEn.split('\n').map((s: string) => s.trim()).filter(Boolean);
    const featAr = newPlanFeaturesAr.split('\n').map((s: string) => s.trim()).filter(Boolean);

    const planPayload = {
      nameEn: newPlanNameEn.trim(),
      nameAr: newPlanNameAr.trim() || newPlanNameEn.trim(),
      durationMonths: Number(newPlanDuration),
      price: Number(newPlanPrice),
      featuresEn: featEn.length > 0 ? featEn : ['Full task access in Jerusalem', 'Customer chat & instant notifications', 'Verified Craftsman Badge'],
      featuresAr: featAr.length > 0 ? featAr : ['صلاحية قبول جميع المهمات في القدس', 'محادثة فورية مع الزبائن', 'شارة شريك معتمد'],
      isPopular: newPlanIsPopular,
    };

    let res;
    if (editingPlan) {
      res = await paymentRepository.updateSubscriptionPlan(editingPlan.id, planPayload);
    } else {
      res = await paymentRepository.createSubscriptionPlan(planPayload);
    }

    setSubmittingAction(false);
    if (res.success) {
      setShowCreatePlanModal(false);
      setEditingPlan(null);
      setNewPlanNameEn('');
      setNewPlanNameAr('');
      setNewPlanFeaturesEn('');
      setNewPlanFeaturesAr('');
      setNewPlanIsPopular(false);
      loadData();
    } else {
      alert('Failed to save subscription plan');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    await paymentRepository.deleteSubscriptionPlan(id);
    loadData();
  };

  return (
    <div className="bit-sub-manager glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', margin: '24px 0' }}>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#00bcd4', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>bit</div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Bit Subscription & Payment Verification
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review Bit payment screenshots, approve craftsman subscriptions, and configure Bit account instructions for Jerusalem & Palestine.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowBitModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Settings size={15} />
            <span>Bit Config</span>
          </button>

          <button
            onClick={() => setShowCreatePlanModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'requests' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'requests' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Verification Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'plans' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'plans' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Plans & Pricing ({plans.length})
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'subscribers' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'subscribers' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Active Craftsmen Subscribers
        </button>
      </div>

      {/* TAB 1: VERIFICATION REQUESTS */}
      {activeTab === 'requests' && (
        <div>
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: statusFilter === st ? 'var(--color-primary)' : 'var(--bg-surface-hover)',
                  color: statusFilter === st ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st === 'PENDING_VERIFICATION' ? 'Pending Review' : st === 'APPROVED' ? 'Approved' : st === 'REJECTED' ? 'Rejected' : 'All Requests'}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>Loading payment requests...</p>
          ) : requests.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-surface-hover)', borderRadius: '12px', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No subscription requests found matching this status.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-surface-hover)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header: User & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {req.userName.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{req.userName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.craftsmanTitle} • {req.userPhone || 'No Phone'}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background:
                            req.status === 'APPROVED'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : req.status === 'REJECTED'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(234, 179, 8, 0.15)',
                          color:
                            req.status === 'APPROVED'
                              ? '#22c55e'
                              : req.status === 'REJECTED'
                              ? '#ef4444'
                              : '#eab308',
                        }}
                      >
                        {req.status === 'PENDING_VERIFICATION' ? 'PENDING' : req.status}
                      </span>
                    </div>

                    {/* Plan Details */}
                    <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{req.planTitle}</span>
                        <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>₪{req.price} ILS</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Duration: {req.durationMonths} Month{req.durationMonths > 1 ? 's' : ''} • Bit Transfer
                      </span>
                      {req.notes && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Screenshot Preview */}
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => {
                          setActivePreviewRequest(req);
                          setZoomScale(1);
                          setRotationAngle(0);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px dashed var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} />
                        <span>View Bit Payment Screenshot</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING_VERIFICATION' ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={submittingAction}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#22c55e',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => setRejectingRequestId(req.id)}
                        disabled={submittingAction}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '8px' }}>
                      {req.status === 'APPROVED' ? '✅ Activated by Admin' : `❌ Rejected: ${req.rejectionReason || 'Invalid receipt'}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {plans.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-surface-hover)',
                padding: '24px',
                borderRadius: '16px',
                border: p.isPopular ? '2px solid #0284c7' : '1px solid var(--border-color)',
                boxShadow: p.isPopular ? '0 8px 24px rgba(2, 132, 199, 0.2)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  {p.isPopular ? (
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> MOST POPULAR
                    </span>
                  ) : (
                    <span style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      STANDARD PASS
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      title="Edit Plan"
                      onClick={() => handleOpenEditPlanModal(p)}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      title="Delete Plan"
                      onClick={() => handleDeletePlan(p.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.nameEn || p.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.nameAr}</p>

                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span>₪{p.price}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ILS / {p.durationMonths} Month{p.durationMonths > 1 ? 's' : ''}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Plan Highlights & Features:
                  </strong>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {(p.featuresEn || []).map((f: string, idx: number) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Subscribers: <strong style={{ color: 'var(--text-primary)' }}>{p.subscribersCount || 0} Craftsmen</strong></span>
                <button
                  onClick={() => handleOpenEditPlanModal(p)}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                >
                  Edit Configuration →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ACTIVE CRAFTSMEN SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div>
          {/* Search & Actions Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search subscriber by name, phone, or title..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={loadSubscribers}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface-hover)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Refresh Directory
            </button>
          </div>

          {subscribersLoading ? (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Loading active subscribers...</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Craftsman</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Title</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Sub Status</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Expiry Date</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Task Access</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers
                    .filter((sub: any) => {
                      if (!subscriberSearch.trim()) return true;
                      const q = subscriberSearch.toLowerCase();
                      return (
                        (sub.craftsmanName || '').toLowerCase().includes(q) ||
                        (sub.craftsmanTitle || '').toLowerCase().includes(q) ||
                        (sub.user?.phoneNumber || '').toLowerCase().includes(q) ||
                        (sub.user?.email || '').toLowerCase().includes(q)
                      );
                    })
                    .map((sub: any) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px' }}>
                          <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.9rem' }}>{sub.craftsmanName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.user?.phoneNumber || sub.user?.email || ''}</span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{sub.craftsmanTitle}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: sub.subscriptionStatus === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: sub.subscriptionStatus === 'ACTIVE' ? '#22c55e' : '#ef4444' }}>
                            {sub.subscriptionStatus}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                          {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 600, color: sub.isAllowedToAcceptTasks ? '#22c55e' : '#ef4444' }}>
                            {sub.isAllowedToAcceptTasks ? '✅ Allowed' : '🔒 Blocked'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {sub.subscriptionStatus === 'ACTIVE' ? (
                              <button
                                title="Suspend Subscription"
                                onClick={() => handleCancelSubscriber(sub.id)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <ShieldAlert size={13} /> Suspend Access
                              </button>
                            ) : (
                              <button
                                title="Activate Subscription"
                                onClick={() => handleExtendSubscriber(sub.id)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <CheckCircle size={13} /> Activate Access
                              </button>
                            )}
                            <button
                              title="Extend +30 Days"
                              onClick={() => handleExtendSubscriber(sub.id)}
                              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              +30 Days
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: PREVIEW IMAGE SCREENSHOT (PRO INSPECTOR) */}
      {activePreviewRequest && (
        <div
          onClick={() => setActivePreviewRequest(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  bit
                </div>
                <div style={{ textAlign: 'start' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Bit Payment Receipt Proof
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activePreviewRequest.userName} • {activePreviewRequest.planTitle} (₪{activePreviewRequest.price} ILS)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActivePreviewRequest(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Inspection Canvas Area */}
            <div
              style={{
                position: 'relative',
                background: '#08080a',
                flex: 1,
                minHeight: '340px',
                maxHeight: '58vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                overflow: 'hidden',
              }}
            >
              {/* Toolbar floating controls */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10,
                  background: 'rgba(18, 18, 22, 0.85)',
                  padding: '6px 10px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <button
                  title="Zoom In"
                  onClick={() => setZoomScale((z) => Math.min(z + 0.25, 3))}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  title="Zoom Out"
                  onClick={() => setZoomScale((z) => Math.max(z - 0.25, 0.5))}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  title="Rotate 90°"
                  onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <RotateCw size={16} />
                </button>
                <a
                  title="Open Original Image File"
                  href={(() => {
                    const url = activePreviewRequest.paymentProofUrl?.trim();
                    if (!url || (!url.startsWith('/') && !/^https?:\/\//i.test(url))) return '#';
                    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Image Preview */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                }}
              >
                <img
                  src={(() => {
                    const url = activePreviewRequest.paymentProofUrl?.trim();
                    if (!url || (!url.startsWith('/') && !/^https?:\/\//i.test(url))) return '';
                    return url.startsWith('/') ? `${window.location.origin}${url}` : url;
                  })()}
                  alt="Bit Payment Receipt Proof"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallbackBox = document.getElementById('inspect-fallback-msg');
                    if (fallbackBox) fallbackBox.style.display = 'block';
                  }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '52vh',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    transform: `scale(${zoomScale}) rotate(${rotationAngle}deg)`,
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                  }}
                />
                <div id="inspect-fallback-msg" style={{ display: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '40px', textAlign: 'center' }}>
                  ⚠️ Unable to render inline image preview directly.<br />
                  <a
                    href={(() => {
                      const url = activePreviewRequest.paymentProofUrl?.trim();
                      if (!url || (!url.startsWith('/') && !/^https?:\/\//i.test(url))) return '#';
                      return url.startsWith('/') ? `${window.location.origin}${url}` : url;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'underline', marginTop: '12px', display: 'inline-block' }}
                  >
                    Click here to open image link directly
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Bar with Action Controls */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: activePreviewRequest.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.15)' : activePreviewRequest.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: activePreviewRequest.status === 'APPROVED' ? '#22c55e' : activePreviewRequest.status === 'REJECTED' ? '#ef4444' : '#eab308',
                  }}
                >
                  {activePreviewRequest.status}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  User Notes: "{activePreviewRequest.notes || 'None'}"
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {activePreviewRequest.status === 'PENDING_VERIFICATION' && (
                  <>
                    <button
                      onClick={() => {
                        const reqId = activePreviewRequest.id;
                        setActivePreviewRequest(null);
                        handleApprove(reqId);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#22c55e',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <CheckCircle size={16} /> Approve & Activate Sub
                    </button>
                    <button
                      onClick={() => {
                        const reqId = activePreviewRequest.id;
                        setActivePreviewRequest(null);
                        setRejectingRequestId(reqId);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#ef4444',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActivePreviewRequest(null)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT REASON */}
      {rejectingRequestId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Reject Subscription Request</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Provide a reason for rejecting this Bit payment request.</p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={3}
                placeholder="e.g. Invalid receipt screenshot, amount does not match plan price..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRejectingRequestId(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Reject Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BIT SETTINGS CONFIG */}
      {showBitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Configure Bit Payment Settings</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Set your target Bit account phone number and instructions displayed to app users.</p>
            <form onSubmit={handleSaveBitSettings} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Bit Phone Number</label>
                <input type="text" value={bitPhone} onChange={(e) => setBitPhone(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Recipient Account Name</label>
                <input type="text" value={bitRecipient} onChange={(e) => setBitRecipient(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Instructions (English)</label>
                <textarea value={bitInstEn} onChange={(e) => setBitInstEn(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Instructions (Arabic / تعليمات باللغة العربية)</label>
                <textarea value={bitInstAr} onChange={(e) => setBitInstAr(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '0.8rem', direction: 'rtl' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowBitModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingBit} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PLAN */}
      {showCreatePlanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure subscription duration, pricing in ILS ₪, and feature description bullets for app users.</p>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Plan Name (English)</label>
                <input type="text" value={newPlanNameEn} onChange={(e) => setNewPlanNameEn(e.target.value)} required placeholder="e.g. 6 Months Pro Pass" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Plan Name (Arabic / الاسم بالعربية)</label>
                <input type="text" value={newPlanNameAr} onChange={(e) => setNewPlanNameAr(e.target.value)} placeholder="مثال: باقة المحترفين (6 أشهر)" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', direction: 'rtl' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Duration Preset</label>
                  <select
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }}
                  >
                    <option value={1}>1 Month (Monthly Pass)</option>
                    <option value={3}>3 Months (Quarterly Pass)</option>
                    <option value={6}>6 Months (Half-Year Pro)</option>
                    <option value={12}>12 Months (1 Year Premium)</option>
                    <option value={24}>24 Months (2 Years Enterprise)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Price (ILS ₪)</label>
                  <input type="number" value={newPlanPrice} onChange={(e) => setNewPlanPrice(Number(e.target.value))} min="1" required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Feature Highlights / Description Bullets (English - One per line)</label>
                <textarea
                  value={newPlanFeaturesEn}
                  onChange={(e) => setNewPlanFeaturesEn(e.target.value)}
                  rows={3}
                  placeholder={'Full task access in Jerusalem\nCustomer messaging & live chat\nVerified Craftsman Badge'}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Feature Highlights (Arabic - مميزات الباقة كل ميزة في سطر)</label>
                <textarea
                  value={newPlanFeaturesAr}
                  onChange={(e) => setNewPlanFeaturesAr(e.target.value)}
                  rows={3}
                  placeholder={'قبول جميع الطلبات والمهمات في القدس\nمحادثة فورية مع الزبائن\nشارة شريك معتمد'}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', fontSize: '0.8rem', direction: 'rtl' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="chk-is-popular"
                  checked={newPlanIsPopular}
                  onChange={(e) => setNewPlanIsPopular(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="chk-is-popular" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Mark as "Most Popular" Pass (High Visibility Badge)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreatePlanModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submittingAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default BitSubscriptionManager;
