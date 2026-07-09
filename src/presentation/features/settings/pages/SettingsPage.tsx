import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Lock,
  Bell,
  Settings,
  Plus,
  ChevronRight,
  Check,
  Search,
  User,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  Clock,
  MapPin,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { User as DomainUser } from '../../../../domain/entities/User';

type TabKey = 'roles' | 'security' | 'notifications' | 'platform';

interface TeamRole {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  userCount: number;
  color: string;
  permissions: Record<string, boolean>;
}

const INITIAL_ROLES: TeamRole[] = [
  {
    id: 'super-admin', name: 'Super Admin', nameAr: 'مدير عام',
    description: 'Full access · All resources', descriptionAr: 'صلاحيات كاملة · جميع الموارد',
    userCount: 2, color: '#171717',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': true, 'ban-users': true,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': true, 'view-earnings': true,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': true, 'refund-tasks': true,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': true, 'manage-plans': true,
      'manage-roles': true, 'api-access': true, 'audit-logs': true, 'platform-config': true,
    }
  },
  {
    id: 'operations-lead', name: 'Operations Lead', nameAr: 'مدير العمليات',
    description: 'Read all · Manage tasks, craftsmen', descriptionAr: 'قراءة الكل · إدارة المهام والحرفيين',
    userCount: 4, color: '#404040',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': true, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': true, 'refund-tasks': false,
      'view-revenue': true, 'approve-payouts': false, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': false, 'api-access': false, 'audit-logs': true, 'platform-config': false,
    }
  },
  {
    id: 'moderator', name: 'Moderator', nameAr: 'مشرف محتوى',
    description: 'Verification queue · Reports · Chat moderation', descriptionAr: 'طابور التحقق · التقارير · إدارة الدردشة',
    userCount: 12, color: '#737373',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': false, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': false, 'refund-tasks': false,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': true, 'api-access': true, 'audit-logs': false, 'platform-config': false,
    }
  },
  {
    id: 'finance', name: 'Finance', nameAr: 'المالية',
    description: 'Payments · Payouts · Subscriptions', descriptionAr: 'المدفوعات · الحسابات · الاشتراكات',
    userCount: 3, color: '#737373',
    permissions: {
      'view-users': true, 'edit-users': false, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': false, 'suspend-craftsmen': false, 'view-earnings': true,
      'view-tasks': true, 'freeze-tasks': false, 'resolve-disputes': false, 'refund-tasks': true,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': true, 'manage-plans': true,
      'manage-roles': false, 'api-access': false, 'audit-logs': true, 'platform-config': false,
    }
  },
  {
    id: 'support-agent', name: 'Support Agent', nameAr: 'الدعم الفني',
    description: 'Read users · Reply tickets', descriptionAr: 'قراءة بيانات المستخدمين · الرد على التذاكر',
    userCount: 18, color: '#d4d4d4',
    permissions: {
      'view-users': true, 'edit-users': false, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': false, 'suspend-craftsmen': false, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': false, 'resolve-disputes': false, 'refund-tasks': false,
      'view-revenue': false, 'approve-payouts': false, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': false, 'api-access': false, 'audit-logs': false, 'platform-config': false,
    }
  }
];

const PERMISSION_GROUPS = [
  {
    label: 'Users', labelAr: 'المستخدمين',
    perms: [
      { key: 'view-users', label: 'View users', labelAr: 'عرض المستخدمين' },
      { key: 'edit-users', label: 'Edit users', labelAr: 'تعديل بيانات المستخدمين' },
      { key: 'suspend-users', label: 'Suspend users', labelAr: 'تعليق الحسابات' },
      { key: 'ban-users', label: 'Ban users', labelAr: 'حظر المستخدمين' },
    ]
  },
  {
    label: 'Craftsmen', labelAr: 'الحرفيين',
    perms: [
      { key: 'view-profiles', label: 'View profiles', labelAr: 'عرض الملفات' },
      { key: 'approve-verifications', label: 'Approve verifications', labelAr: 'الموافقة على التحقق' },
      { key: 'suspend-craftsmen', label: 'Suspend craftsmen', labelAr: 'تعليق الحرفيين' },
      { key: 'view-earnings', label: 'View earnings', labelAr: 'عرض الأرباح' },
    ]
  },
  {
    label: 'Tasks', labelAr: 'المهام',
    perms: [
      { key: 'view-tasks', label: 'View tasks', labelAr: 'عرض المهام' },
      { key: 'freeze-tasks', label: 'Freeze tasks', labelAr: 'تجميد المهام' },
      { key: 'resolve-disputes', label: 'Resolve disputes', labelAr: 'فض النزاعات' },
      { key: 'refund-tasks', label: 'Refund tasks', labelAr: 'استرداد المبالغ' },
    ]
  },
  {
    label: 'Finance', labelAr: 'المالية',
    perms: [
      { key: 'view-revenue', label: 'View revenue', labelAr: 'عرض الإيرادات' },
      { key: 'approve-payouts', label: 'Approve payouts', labelAr: 'الموافقة على المستحقات' },
      { key: 'issue-refunds', label: 'Issue refunds', labelAr: 'إصدار المستردات' },
      { key: 'manage-plans', label: 'Manage plans', labelAr: 'إدارة الباقات' },
    ]
  },
  {
    label: 'System', labelAr: 'النظام',
    perms: [
      { key: 'manage-roles', label: 'Manage roles', labelAr: 'إدارة الأدوار' },
      { key: 'api-access', label: 'API access', labelAr: 'الوصول للـ API' },
      { key: 'audit-logs', label: 'Audit logs', labelAr: 'سجلات التدقيق' },
      { key: 'platform-config', label: 'Platform config', labelAr: 'تهيئة المنصة' },
    ]
  }
];

export const SettingsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { authRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const saved = localStorage.getItem('settings_active_tab') as TabKey;
    return (saved && ['roles', 'security', 'notifications', 'platform'].includes(saved)) ? saved : 'roles';
  });

  useEffect(() => {
    localStorage.setItem('settings_active_tab', activeTab);
  }, [activeTab]);

  const [roles, setRoles] = useState<TeamRole[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('moderator');

  // Admin users state
  const [adminsList, setAdminsList] = useState<DomainUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  // New admin modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('super-admin');
  const [newAdminAvatar, setNewAdminAvatar] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Side Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Security
  const [securityOpts, setSecurityOpts] = useState({
    twoFactor: true, trustedDevices: true, ipAllowlist: false,
    sessionTimeout: true, auditLogging: true
  });

  // Notifications
  const [notifChannels, setNotifChannels] = useState([
    { id: 'sos', eventEn: 'Emergency / SOS', eventAr: 'حالات الطوارئ / SOS', email: true, push: true, sms: true },
    { id: 'failed_payments', eventEn: 'Failed payments', eventAr: 'فشل عمليات الدفع', email: true, push: true, sms: true },
    { id: 'new_verifications', eventEn: 'New verifications', eventAr: 'طلبات التحقق الجديدة', email: true, push: true, sms: false },
    { id: 'daily_summary', eventEn: 'Daily summary', eventAr: 'الملخص اليومي', email: true, push: false, sms: false }
  ]);

  // Platform Config
  const [platformConfig, setPlatformConfig] = useState([
    { id: 'commission_rate', labelEn: 'Commission rate', labelAr: 'نسبة العمولة', val: '20.4%', icon: <Percent size={16} /> },
    { id: 'min_withdrawal', labelEn: 'Min withdrawal', labelAr: 'الحد الأدنى للسحب', val: 'SAR 100', icon: <DollarSign size={16} /> },
    { id: 'payout_schedule', labelEn: 'Payout schedule', labelAr: 'جدولة المستحقات', val: 'Weekly · Sunday', icon: <Clock size={16} /> },
    { id: 'auto_release', labelEn: 'Auto-release escrow', labelAr: 'الإفراج التلقائي', val: '24 hours', icon: <Clock size={16} /> },
    { id: 'currency', labelEn: 'Default currency', labelAr: 'العملة الافتراضية', val: 'SAR (Saudi Riyal)', icon: <DollarSign size={16} /> },
    { id: 'region', labelEn: 'Service region', labelAr: 'منطقة الخدمة', val: 'Riyadh + 6 cities', icon: <MapPin size={16} /> },
    { id: 'emergency_sla', labelEn: 'Emergency response SLA', labelAr: 'SLA الطوارئ', val: '15 minutes', icon: <ShieldAlert size={16} /> },
    { id: 'verification_sla', labelEn: 'Verification SLA', labelAr: 'SLA التحقق', val: '24 hours', icon: <Check size={16} /> }
  ]);

  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const result = await authRepository.getAdmins();
      if (result.success) {
        setAdminsList(result.data);
      } else {
        setAdminsError(result.error.message || 'Failed to load admins');
      }
    } catch (err: unknown) {
      setAdminsError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  }, [authRepository]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handlePermissionToggle = (key: string) => {
    setRoles(prev => prev.map(r =>
      r.id === selectedRoleId ? { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } } : r
    ));
  };

  const getEnabledCount = (role: TeamRole) => Object.values(role.permissions).filter(Boolean).length;

  const totalAdmins = adminsList.length;

  const getRoleName = (roleId: string) => {
    const roleObj = roles.find(r => r.id === roleId);
    return roleObj ? roleObj.name : 'Super Admin';
  };

  const getRoleNameArByString = (roleName: string) => {
    const roleObj = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    return roleObj ? roleObj.nameAr : roleName;
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string; password?: string } = {};

    // Name validation
    if (!newAdminName.trim()) {
      errors.name = isRtl ? 'الاسم مطلوب' : 'Name is required';
    } else if (newAdminName.trim().length < 3) {
      errors.name = isRtl ? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!newAdminEmail.trim()) {
      errors.email = isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!emailRegex.test(newAdminEmail.trim())) {
      errors.email = isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!newAdminPassword) {
      errors.password = isRtl ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (!passwordRegex.test(newAdminPassword)) {
      errors.password = isRtl
        ? 'يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام'
        : 'Must be at least 8 characters with letters and numbers';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const roleName = getRoleName(newAdminRole);
    const result = await authRepository.createAdmin(newAdminName.trim(), newAdminEmail.trim(), roleName, newAdminAvatar);
    if (result.success) {
      setAdminsList(prev => [...prev, result.data]);
      setIsModalOpen(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('super-admin');
      setNewAdminAvatar('');
      setFormErrors({});
    } else {
      alert(result.error.message || 'Failed to create admin');
    }
  };

  const handleRoleClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsDrawerOpen(true);
  };

  const membersOfSelectedRole = adminsList.filter(admin => {
    const normAdminRole = admin.role.toLowerCase().replace(/\s+/g, '-');
    return normAdminRole === selectedRoleId;
  });

  // Render the small settings sub-nav
  const settingsSubTabs = [
    { key: 'roles' as TabKey, label: isRtl ? 'الأدوار والصلاحيات' : 'Roles & Permissions', icon: <Users size={16} /> },
    { key: 'security' as TabKey, label: isRtl ? 'الأمن والحماية' : 'Security', icon: <Lock size={16} /> },
    { key: 'notifications' as TabKey, label: isRtl ? 'تفضيلات الإشعارات' : 'Notification preferences', icon: <Bell size={16} /> },
    { key: 'platform' as TabKey, label: isRtl ? 'تهيئة المنصة' : 'Platform configuration', icon: <Settings size={16} /> },
  ];

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button onClick={() => setSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text"><strong>Sonaa</strong><span>Admin</span></div>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}><Bell size={16} /><span className="mobile-badge" /></button>
          </div>
        </div>

        {/* Desktop page header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.48px', color: '#171717' }}>
              {t('settings_page_title') || 'Settings'}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#737373', fontSize: '14px' }}>
              {t('settings_page_subtitle') || 'Roles · security · platform configuration'}
            </p>
          </div>
        </div>

        <div className="settings-layout animate-fade-in">
          {/* Left: Settings sub-nav card */}
          <div className="settings-subnav-card">
            {settingsSubTabs.map(tab => (
              <button
                key={tab.key}
                className={`settings-subnav-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {activeTab === tab.key && (
                  <span className="settings-subnav-arrow" />
                )}
                <span className="subnav-icon">{tab.icon}</span>
                <span className="subnav-label">{tab.label}</span>
                {activeTab === tab.key && <ChevronRight size={12} className="subnav-chevron" />}
              </button>
            ))}
          </div>

          {/* Right: Content area */}
          <div className="settings-content-area">

            {/* ── TAB 1: ROLES & PERMISSIONS ── */}
            {activeTab === 'roles' && (
              <div className="roles-tab">

                {/* Card 1: Team Roles */}
                <div className="settings-card">
                  <div className="card-header-row">
                    <div>
                      <p className="card-label-small">{isRtl ? 'أدوار الفريق' : 'Team Roles'}</p>
                      <p className="card-value-medium">{totalAdmins} {isRtl ? `مشرف في ${roles.length} أدوار` : `admins across ${roles.length} roles`}</p>
                    </div>
                    <button className="btn-dark-sm" onClick={() => setIsModalOpen(true)}>
                      <Plus size={12} />
                      <span>{isRtl ? 'دور جديد' : 'New role'}</span>
                    </button>
                  </div>

                  <div className="roles-list">
                    {roles.map(role => {
                      const roleMemberCount = adminsList.filter(
                        admin => admin.role.toLowerCase().replace(/\s+/g, '-') === role.id
                      ).length;
                      return (
                        <div
                          key={role.id}
                          className={`role-row${selectedRoleId === role.id ? ' selected' : ''}`}
                          onClick={() => handleRoleClick(role.id)}
                        >
                          <div className="role-color-pill" style={{ backgroundColor: role.color }} />
                          <div className="role-row-info">
                            <span className="role-row-name">{isRtl ? role.nameAr : role.name}</span>
                            <span className="role-row-desc">{isRtl ? role.descriptionAr : role.description}</span>
                          </div>
                          <div className="role-count-badge">
                            <span>{roleMemberCount}</span>
                            <span style={{ color: '#737373', fontSize: '10px' }}>{isRtl ? 'مستخدم' : ' users'}</span>
                          </div>
                          <ChevronRight size={14} style={{ color: '#a3a3a3', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card 2: Permissions Matrix */}
                <div className="settings-card">
                  <div className="card-header-row">
                    <div>
                      <p className="card-label-small">{isRtl ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}</p>
                      <p className="card-value-medium">
                        {isRtl
                          ? `دور ${selectedRole.nameAr} · ${getEnabledCount(selectedRole)} صلاحية مفعّلة`
                          : `${selectedRole.name} role · ${getEnabledCount(selectedRole)} permissions enabled`}
                      </p>
                    </div>
                  </div>

                  {/* 2-column permission groups grid */}
                  <div className="permissions-2col-grid">
                    {PERMISSION_GROUPS.map(group => (
                      <div key={group.label} className="perm-group">
                        <p className="perm-group-label">{isRtl ? group.labelAr : group.label}</p>
                        <div className="perm-items-list">
                          {group.perms.map(perm => {
                            const isOn = selectedRole.permissions[perm.key] ?? false;
                            return (
                              <div key={perm.key} className="perm-item-row">
                                <span className="perm-item-label">{isRtl ? perm.labelAr : perm.label}</span>
                                <button
                                  className={`mini-toggle${isOn ? ' on' : ''}`}
                                  onClick={() => handlePermissionToggle(perm.key)}
                                >
                                  <div className="mini-toggle-thumb" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* ── TAB 2: SECURITY ── */}
            {activeTab === 'security' && (
              <div className="settings-card">
                <div className="card-header-row" style={{ marginBottom: '20px' }}>
                  <div>
                    <p className="card-label-small">Security</p>
                    <p className="card-value-medium">{isRtl ? 'إعدادات الحماية لمدراء المنصة' : 'Configure admin access security policies'}</p>
                  </div>
                </div>
                <div className="security-list">
                  {[
                    { key: 'twoFactor', icon: <Lock size={18} />, title: isRtl ? 'المصادقة الثنائية' : 'Two-factor authentication', desc: isRtl ? 'مفروض على جميع المدراء · تطبيق الهاتف + رسائل SMS احتياطية' : 'Enforced for all admins · Authenticator + SMS backup' },
                    { key: 'trustedDevices', icon: <User size={18} />, title: isRtl ? 'الأجهزة الموثوقة' : 'Trusted devices', desc: isRtl ? '٤ أجهزة · آخر تسجيل من MacBook Pro منذ دقيقتين' : '4 devices · Last login from MacBook Pro · 2m ago' },
                    { key: 'ipAllowlist', icon: <Sliders size={18} />, title: isRtl ? 'قائمة IP المسموحة' : 'IP allowlist', desc: isRtl ? 'تقييد الوصول لنطاقات IP المكتبية فقط' : 'Restrict admin access to office IP ranges' },
                    { key: 'sessionTimeout', icon: <Clock size={18} />, title: isRtl ? 'انتهاء الجلسة' : 'Session timeout', desc: isRtl ? 'خروج تلقائي بعد ٣٠ دقيقة من عدم النشاط' : 'Auto-logout after 30 minutes of inactivity' },
                    { key: 'auditLogging', icon: <Eye size={18} />, title: isRtl ? 'سجلات التدقيق' : 'Audit logging', desc: isRtl ? 'كل إجراء مسؤول موثق · الاحتفاظ لمدة ٩٠ يومًا' : 'Every admin action recorded · 90 day retention' },
                  ].map(opt => {
                    const isOn = securityOpts[opt.key as keyof typeof securityOpts];
                    return (
                      <div key={opt.key} className="security-row">
                        <div className="security-row-left">
                          <div className="security-icon-box">{opt.icon}</div>
                          <div>
                            <p className="security-title">{opt.title}</p>
                            <p className="security-desc">{opt.desc}</p>
                          </div>
                        </div>
                        <button
                          className={`toggle-switch${isOn ? ' on' : ''}`}
                          onClick={() => setSecurityOpts(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                        >
                          <div className="toggle-thumb" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 3: NOTIFICATION PREFERENCES ── */}
            {activeTab === 'notifications' && (
              <div className="settings-card">
                <div className="card-header-row" style={{ marginBottom: '20px' }}>
                  <div>
                    <p className="card-label-small">{isRtl ? 'قنوات الإشعارات' : 'Notification channels'}</p>
                    <p className="card-value-medium">{isRtl ? 'تحديد كيفية وصول الإشعارات عبر البريد والإشعارات الفورية والرسائل' : 'Pick how each event reaches you across email, push, and SMS.'}</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="notif-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'start' }}>{isRtl ? 'الحدث' : 'Event'}</th>
                        <th>{isRtl ? 'البريد' : 'Email'}</th>
                        <th>{isRtl ? 'إشعار' : 'Push'}</th>
                        <th>{isRtl ? 'SMS' : 'SMS'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifChannels.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="notif-event-name">{isRtl ? item.eventAr : item.eventEn}</td>
                          {(['email', 'push', 'sms'] as const).map(ch => (
                            <td key={ch} style={{ textAlign: 'center' }}>
                              <button
                                className={`mini-toggle${item[ch] ? ' on' : ''}`}
                                onClick={() => {
                                  const updated = [...notifChannels];
                                  updated[idx] = { ...updated[idx], [ch]: !updated[idx][ch] };
                                  setNotifChannels(updated);
                                }}
                              >
                                <div className="mini-toggle-thumb" />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 4: PLATFORM CONFIGURATION ── */}
            {activeTab === 'platform' && (
              <div className="settings-card">
                <div style={{ marginBottom: '20px' }}>
                  <p className="card-label-small">{isRtl ? 'تهيئة المنصة' : 'Platform configuration'}</p>
                </div>
                <div className="platform-params-grid">
                  {platformConfig.map(param => (
                    <div key={param.id} className="param-card">
                      {editingParamId === param.id ? (
                        <>
                          <p className="param-label">{isRtl ? param.labelAr : param.labelEn}</p>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
                            <input
                              value={editingVal}
                              onChange={e => setEditingVal(e.target.value)}
                              className="param-edit-input"
                              autoFocus
                            />
                            <button className="param-save-btn" onClick={() => {
                              setPlatformConfig(prev => prev.map(p => p.id === param.id ? { ...p, val: editingVal } : p));
                              setEditingParamId(null);
                            }}>
                              <Check size={12} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="param-label">{isRtl ? param.labelAr : param.labelEn}</p>
                          <p
                            className="param-value"
                            onDoubleClick={() => { setEditingParamId(param.id); setEditingVal(param.val); }}
                            title={isRtl ? 'انقر مرتين للتعديل' : 'Double-click to edit'}
                          >{param.val}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {isModalOpen && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal-content animate-scale-up" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {isRtl ? 'إضافة حساب مشرف جديد' : 'Add New Admin Account'}
                </h3>
                <button className="admin-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleCreateAdmin} className="admin-modal-form">
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ alignSelf: 'flex-start' }}>{isRtl ? 'الصورة الشخصية' : 'Profile Picture'}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', alignSelf: 'flex-start' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#27272a', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {newAdminAvatar ? (
                        <img src={newAdminAvatar} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Users size={24} style={{ color: '#a1a1aa' }} />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-upload-file"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewAdminAvatar(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="avatar-upload-file" className="btn-cancel" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '11px', display: 'inline-block' }}>
                        {isRtl ? 'اختر صورة' : 'Choose Photo'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {isRtl ? 'الاسم بالكامل' : 'Full Name'}
                    <span style={{ color: '#ef4444', marginInlineStart: '2px' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    placeholder={isRtl ? 'مثال: أحمد الفارس' : 'e.g. Ahmed Al-Farsi'}
                    value={newAdminName}
                    onChange={e => { setNewAdminName(e.target.value); setFormErrors(prev => ({ ...prev, name: undefined })); }}
                    className={`form-input${formErrors.name ? ' input-error' : ''}`}
                  />
                  {formErrors.name && <span className="field-error-msg">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                    <span style={{ color: '#ef4444', marginInlineStart: '2px' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@sonaa.sa"
                    value={newAdminEmail}
                    onChange={e => { setNewAdminEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: undefined })); }}
                    className={`form-input${formErrors.email ? ' input-error' : ''}`}
                  />
                  {formErrors.email && <span className="field-error-msg">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {isRtl ? 'كلمة المرور' : 'Password'}
                    <span style={{ color: '#ef4444', marginInlineStart: '2px' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={newAdminPassword}
                      onChange={e => { setNewAdminPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: undefined })); }}
                      className={`form-input${formErrors.password ? ' input-error' : ''}`}
                      style={{ paddingInlineEnd: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        insetInlineEnd: '12px',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      tabIndex={-1}
                      aria-label={showModalPassword ? 'Hide password' : 'Show password'}
                    >
                      {showModalPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {formErrors.password && <span className="field-error-msg">{formErrors.password}</span>}
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                    {isRtl ? '8 أحرف على الأقل · حروف وأرقام' : 'Min 8 chars · letters & numbers'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">{isRtl ? 'الدور والصلاحيات' : 'Role & Permissions'}</label>
                  <select
                    value={newAdminRole}
                    onChange={e => setNewAdminRole(e.target.value)}
                    className="form-select"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {isRtl ? r.nameAr : r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn-submit">
                    {isRtl ? 'إنشاء الحساب' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sliding Side Drawer for Role Members */}
        <div className={`role-drawer-backdrop ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
          <div className={`role-drawer-content ${isDrawerOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            <div className="drawer-header">
              <div>
                <h3 className="drawer-title">{isRtl ? selectedRole.nameAr : selectedRole.name}</h3>
                <p className="drawer-subtitle">{isRtl ? selectedRole.descriptionAr : selectedRole.description}</p>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>&times;</button>
            </div>

            <div className="drawer-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="drawer-section-title">{isRtl ? 'أعضاء الفريق' : 'Team Members'}</span>
                <button className="btn-dark-sm" onClick={() => { setIsDrawerOpen(false); setIsModalOpen(true); setNewAdminRole(selectedRoleId); }}>
                  <Plus size={12} />
                  <span>{isRtl ? 'إضافة عضو' : 'Add Member'}</span>
                </button>
              </div>

              {adminsLoading ? (
                <p className="drawer-message">{isRtl ? 'جاري التحميل...' : 'Loading members...'}</p>
              ) : adminsError ? (
                <p className="drawer-message error">{adminsError}</p>
              ) : membersOfSelectedRole.length === 0 ? (
                <p className="drawer-message">{isRtl ? 'لا يوجد أعضاء مسجلين في هذا الدور.' : 'No members assigned to this role.'}</p>
              ) : (
                <div className="drawer-members-list">
                  {membersOfSelectedRole.map(member => (
                    <div key={member.id} className="drawer-member-card">
                      <img src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt={member.name} className="drawer-member-avatar" />
                      <div style={{ textAlign: 'start', flex: 1, minWidth: 0 }}>
                        <p className="drawer-member-name">{member.name}</p>
                        <p className="drawer-member-email">{member.email}</p>
                      </div>
                      <span className="drawer-member-status">{isRtl ? 'نشط' : 'Active'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <MobileBottomTabs />
      </main>

      <style>{`
        /* ── Page Layout ── */
        .settings-layout {
          display: grid;
          grid-template-columns: 210px 1fr;
          gap: 16px;
          align-items: start;
          padding-bottom: 40px;
        }

        /* ── Left sub-nav card ── */
        .settings-subnav-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 1px 1.5px rgba(0,0,0,0.04);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-subnav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 400;
          color: #737373;
          text-align: start;
          transition: all 0.15s ease;
        }
        .settings-subnav-btn:hover {
          background: #f5f5f5;
          color: #404040;
        }
        .settings-subnav-btn.active {
          background: #f5f5f5;
          color: #171717;
          font-weight: 600;
        }
        .settings-subnav-arrow {
          position: absolute;
          inset-inline-start: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #171717;
          border-radius: 9999px;
        }
        .subnav-icon { display: flex; align-items: center; flex-shrink: 0; }
        .subnav-label { flex: 1; line-height: 1.3; }
        .subnav-chevron { flex-shrink: 0; opacity: 0.5; }
        [dir="rtl"] .subnav-chevron { transform: rotate(180deg); }

        /* ── Content area ── */
        .settings-content-area {
          min-width: 0;
        }

        /* ── Generic card ── */
        .settings-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          box-shadow: 0 1px 1.5px rgba(0,0,0,0.04);
          padding: 24px;
          margin-bottom: 16px;
        }
        .settings-card:last-child { margin-bottom: 0; }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .card-label-small {
          font-size: 12px;
          font-weight: 700;
          color: #737373;
          letter-spacing: 0.6px;
          margin: 0 0 4px;
        }
        .card-value-medium {
          font-size: 14px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        .btn-dark-sm {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #171717;
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .btn-dark-sm:hover { opacity: 0.85; }

        /* ── Roles list ── */
        .roles-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .role-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          background: #fff;
        }
        .role-row:hover { border-color: #d4d4d4; }
        .role-row.selected { border-color: #171717; background: #fafafa; }
        .role-color-pill {
          width: 4px;
          height: 40px;
          border-radius: 9999px;
          flex-shrink: 0;
        }
        .role-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .role-row-name {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
        }
        .role-row-desc {
          font-size: 10px;
          color: #737373;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .role-count-badge {
          display: flex;
          align-items: baseline;
          gap: 2px;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          color: #737373;
        }

        /* ── Permissions matrix ── */
        .permissions-2col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }
        .perm-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .perm-group-label {
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
        }
        .perm-items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .perm-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafafa;
          padding: 8px;
          border-radius: 8px;
          gap: 8px;
        }
        .perm-item-label {
          font-size: 12px;
          color: #404040;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Mini toggle (permissions/notifications) ── */
        .mini-toggle {
          position: relative;
          width: 28px;
          height: 16px;
          border-radius: 9999px;
          background: #d4d4d4;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          padding: 0;
          flex-shrink: 0;
        }
        .mini-toggle.on { background: #171717; }
        .mini-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.15s;
        }
        .mini-toggle.on .mini-toggle-thumb { transform: translateX(12px); }
        [dir="rtl"] .mini-toggle.on .mini-toggle-thumb { transform: translateX(-12px); }

        /* ── Regular toggle (security) ── */
        .toggle-switch {
          position: relative;
          width: 40px;
          height: 20px;
          border-radius: 9999px;
          background: #d4d4d4;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          padding: 0;
          flex-shrink: 0;
        }
        .toggle-switch.on { background: #171717; }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .toggle-switch.on .toggle-thumb { transform: translateX(20px); }
        [dir="rtl"] .toggle-switch.on .toggle-thumb { transform: translateX(-20px); }

        /* ── Security list ── */
        .security-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .security-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 16px 20px;
          gap: 16px;
        }
        .security-row-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }
        .security-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #171717;
          flex-shrink: 0;
        }
        .security-title {
          font-size: 12px;
          font-weight: 700;
          color: #171717;
          margin: 0 0 3px;
        }
        .security-desc {
          font-size: 10px;
          color: #737373;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Notifications table ── */
        .notif-table {
          width: 100%;
          border-collapse: collapse;
        }
        .notif-table th {
          background: #fafafa;
          padding: 12px 16px;
          font-size: 10px;
          font-weight: 700;
          color: #737373;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e5e5;
          text-align: center;
        }
        .notif-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f5f5f5;
          font-size: 12px;
          color: #171717;
          text-align: center;
        }
        .notif-event-name { font-weight: 600; text-align: start !important; }
        .notif-table tr:hover td { background: #fafafa; }

        /* ── Platform Config ── */
        .platform-params-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .param-card {
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 20px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: default;
        }
        .param-edit-input {
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 14px;
          font-weight: 700;
          color: #171717;
          width: 100%;
          outline: none;
          box-sizing: border-box;
        }
        .param-edit-input:focus { border-color: #171717; }
        .param-save-btn {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #171717;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .param-label {
          font-size: 12px;
          font-weight: 400;
          color: #737373;
          margin: 0;
        }
        .param-value {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
          .settings-subnav-card {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 4px;
          }
          .settings-subnav-btn {
            width: auto;
            white-space: nowrap;
          }
          .permissions-2col-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
            width: 100% !important;
          }
          .settings-layout {
            padding: 16px !important;
            box-sizing: border-box;
          }
          .platform-params-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Admin Modal ── */
        .admin-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(9, 9, 11, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
        }
        .admin-modal-content {
          width: 100%;
          max-width: 440px;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
          padding: 24px;
          color: #fff;
          box-sizing: border-box;
        }
        .admin-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #27272a;
          padding-bottom: 12px;
        }
        .admin-modal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #f4f4f5;
        }
        .admin-modal-close-btn {
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }
        .admin-modal-close-btn:hover {
          color: #fff;
        }
        .admin-modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: start;
        }
        .form-label {
          font-size: 11px;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-input, .form-select {
          background: #000000 !important;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75) !important;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
          width: 100%;
        }
        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .form-input:focus, .form-select:focus {
          border-color: #52525b;
        }
        .form-select option {
          background: #000000 !important;
          color: rgba(255, 255, 255, 0.75) !important;
        }
        .form-input.input-error, .form-select.input-error {
          border-color: #ef4444 !important;
        }
        .field-error-msg {
          font-size: 10px;
          color: #ef4444;
          margin-top: -2px;
          display: block;
        }
        .admin-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
          border-top: 1px solid #27272a;
          padding-top: 16px;
        }
        .btn-cancel {
          background: transparent;
          border: 1px solid #27272a;
          color: #a1a1aa;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover {
          background: #27272a;
          color: #fff;
        }
        .btn-submit {
          background: #fff;
          border: none;
          color: #09090b;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-submit:hover {
          opacity: 0.9;
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* ── Sliding Side Drawer ── */
        .role-drawer-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(9, 9, 11, 0);
          backdrop-filter: blur(0px);
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
          pointer-events: none;
          z-index: 9999;
        }
        .role-drawer-backdrop.open {
          background: rgba(9, 9, 11, 0.4);
          backdrop-filter: blur(4px);
          pointer-events: auto;
        }
        .role-drawer-content {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-left: 1px solid #e5e5e5;
          box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
          padding: 24px;
          box-sizing: border-box;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        [dir="ltr"] .role-drawer-content {
          right: 0;
          transform: translateX(100%);
        }
        [dir="ltr"] .role-drawer-content.open {
          transform: translateX(0);
        }
        [dir="rtl"] .role-drawer-content {
          left: 0;
          transform: translateX(-100%);
          border-left: none;
          border-right: 1px solid #e5e5e5;
          box-shadow: 10px 0 25px -5px rgba(0,0,0,0.1);
        }
        [dir="rtl"] .role-drawer-content.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 16px;
          text-align: start;
        }
        .drawer-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #171717;
        }
        .drawer-subtitle {
          margin: 4px 0 0;
          font-size: 11px;
          color: #737373;
        }
        .drawer-close-btn {
          background: transparent;
          border: none;
          color: #737373;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }
        .drawer-close-btn:hover {
          color: #171717;
        }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .drawer-section-title {
          font-size: 11px;
          font-weight: 700;
          color: #737373;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .drawer-message {
          color: #737373;
          font-size: 12px;
          padding: 24px 0;
          margin: 0;
          text-align: center;
        }
        .drawer-message.error {
          color: #991b1b;
        }
        .drawer-members-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drawer-member-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          background: #fafafa;
        }
        .drawer-member-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .drawer-member-name {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #171717;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .drawer-member-email {
          margin: 2px 0 0;
          font-size: 10px;
          color: #737373;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .drawer-member-status {
          font-size: 9px;
          font-weight: 600;
          color: #15803d;
          background: #dcfce7;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
