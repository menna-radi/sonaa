import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { User as DomainUser } from '../../../../domain/entities/User';
import {
  PageHeader,
  Segmented,
  Card,
  useBreakpoint,
  useToast,
} from '../../../components/ui';
import {
  Users,
  Lock,
  Bell,
  Settings,
  Sliders,
  Palette,
  ChevronRight,
} from 'lucide-react';

import { SettingsTabKey, TeamRole, INITIAL_ROLES } from '../types';
import { RolesTab } from '../components/RolesTab';
import { AppearanceTab } from '../components/AppearanceTab';
import { SecurityTab } from '../components/SecurityTab';
import { NotificationsTab } from '../components/NotificationsTab';
import { PlatformConfigTab } from '../components/PlatformConfigTab';
import { AuditLogsTab } from '../components/AuditLogsTab';
import { RoleMembersDrawer } from '../components/RoleMembersDrawer';
import { NewAdminModal } from '../components/NewAdminModal';

export const SettingsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { authRepository } = dependencies;
  const { isMobile, isTablet } = useBreakpoint();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTabKey>(() => {
    const saved = localStorage.getItem('settings_active_tab') as SettingsTabKey;
    const valid: SettingsTabKey[] = [
      'roles',
      'appearance',
      'security',
      'notifications',
      'platform',
      'audit_logs',
    ];
    return saved && valid.includes(saved) ? saved : 'roles';
  });

  useEffect(() => {
    localStorage.setItem('settings_active_tab', activeTab);
  }, [activeTab]);

  const [roles, setRoles] = useState<TeamRole[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super-admin');

  // Admin users state
  const [adminsList, setAdminsList] = useState<DomainUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  // New admin modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Role members side drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRoleId
          ? { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } }
          : r
      )
    );
  };

  const handleCreateAdmin = async (data: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  }) => {
    try {
      const result = await authRepository.createAdmin(
        data.name,
        data.email,
        data.role,
        data.avatarUrl
      );
      if (result.success) {
        setAdminsList((prev) => [...prev, result.data]);
        success(
          isRtl ? 'تم إنشاء حساب المشرف بنجاح' : 'Admin account created successfully.'
        );
      } else {
        toastError(result.error.message || 'Failed to create admin');
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
  const membersOfSelectedRole = adminsList.filter((admin) => {
    const normAdminRole = admin.role.toLowerCase().replace(/\s+/g, '-');
    return normAdminRole === selectedRoleId;
  });

  const subNavItems = [
    {
      key: 'roles' as SettingsTabKey,
      label: isRtl ? 'الأدوار والصلاحيات' : 'Roles & Permissions',
      icon: <Users size={16} />,
    },
    {
      key: 'appearance' as SettingsTabKey,
      label: isRtl ? 'المظهر والسمة' : 'Appearance & Theme',
      icon: <Palette size={16} />,
    },
    {
      key: 'security' as SettingsTabKey,
      label: isRtl ? 'الأمن والحماية' : 'Security & Access',
      icon: <Lock size={16} />,
    },
    {
      key: 'notifications' as SettingsTabKey,
      label: isRtl ? 'تفضيلات الإشعارات' : 'Notification Routing',
      icon: <Bell size={16} />,
    },
    {
      key: 'platform' as SettingsTabKey,
      label: isRtl ? 'تهيئة المنصة' : 'Platform Configuration',
      icon: <Settings size={16} />,
    },
    {
      key: 'audit_logs' as SettingsTabKey,
      label: isRtl ? 'سجل التدقيق' : 'Audit Logs Explorer',
      icon: <Sliders size={16} />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        padding: 'var(--sp-4)',
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <PageHeader
        title={t('settings_page_title') || (isRtl ? 'إعدادات النظام والمنصة' : 'Platform Settings')}
        subtitle={
          t('settings_page_subtitle') ||
          (isRtl
            ? 'إدارة الأدوار والصلاحيات · المظهر والسمة · الحماية · تهيئة المعايير التشغيلية'
            : 'Roles & permissions · appearance · access security · platform operational parameters.')
        }
      />

      {/* Mobile/Tablet Sub-nav using Segmented */}
      {(isMobile || isTablet) && (
        <div style={{ overflowX: 'auto', paddingBottom: 'var(--sp-1)' }}>
          <Segmented
            value={activeTab}
            onChange={(val) => setActiveTab(val as SettingsTabKey)}
            items={subNavItems.map((item) => ({
              value: item.key,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {item.icon}
                  {item.label}
                </span>
              ),
            }))}
          />
        </div>
      )}

      {/* Desktop Layout: Sub-Nav Card on Left, Content on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '240px 1fr',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Left Sub-nav (Desktop Only) */}
        {!isMobile && !isTablet && (
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
              {subNavItems.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--sp-3)',
                      width: '100%',
                      padding: 'var(--sp-3)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--surface-sunken)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--on-surface-subtle)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 'var(--font-sm)',
                      cursor: 'pointer',
                      textAlign: 'start',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--primary)' : 'inherit' }}>
                      {tab.icon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <ChevronRight
                        size={14}
                        style={{
                          transform: isRtl ? 'rotate(180deg)' : 'none',
                          color: 'var(--primary)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Content Area */}
        <div style={{ minWidth: 0 }}>
          {activeTab === 'roles' && (
            <RolesTab
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onPermissionToggle={handlePermissionToggle}
              onOpenNewAdminModal={() => setIsModalOpen(true)}
              adminsList={adminsList}
            />
          )}

          {activeTab === 'appearance' && <AppearanceTab />}

          {activeTab === 'security' && <SecurityTab />}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'platform' && <PlatformConfigTab />}

          {activeTab === 'audit_logs' && <AuditLogsTab />}
        </div>
      </div>

      {/* Role Members Drawer */}
      <RoleMembersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        role={selectedRole}
        members={membersOfSelectedRole}
        loading={adminsLoading}
        error={adminsError}
        onAddMember={() => {
          setIsDrawerOpen(false);
          setIsModalOpen(true);
        }}
      />

      {/* Add New Admin Modal */}
      <NewAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roles={roles}
        defaultRole={selectedRoleId}
        onSubmit={handleCreateAdmin}
      />
    </div>
  );
};

export default SettingsPage;
