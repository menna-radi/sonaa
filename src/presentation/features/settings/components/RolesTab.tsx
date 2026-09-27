import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { User as DomainUser } from '../../../../domain/entities/User';
import { TeamRole, PERMISSION_GROUPS } from '../types';
import { Card, Button, Checkbox, StatusPill } from '../../../components/ui';
import { Plus, ChevronRight, Shield } from 'lucide-react';

export interface RolesTabProps {
  roles: TeamRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  onOpenDrawer: (roleId: string) => void;
  onPermissionToggle: (key: string) => void;
  onOpenNewAdminModal: () => void;
  adminsList: DomainUser[];
}

export const RolesTab: React.FC<RolesTabProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  onOpenDrawer,
  onPermissionToggle,
  onOpenNewAdminModal,
  adminsList,
}) => {
  const { isRtl } = useLanguage();
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const getEnabledCount = (role: TeamRole) =>
    Object.values(role.permissions).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Card 1: Team Roles */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--sp-4)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
              {isRtl ? 'أدوار الفريق' : 'Team Roles'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
              {isRtl
                ? `${adminsList.length} مشرف عبر ${roles.length} أدوار إدارية`
                : `${adminsList.length} admins across ${roles.length} operational roles`}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewAdminModal}
            icon={<Plus size={14} />}
          >
            {isRtl ? 'حساب مشرف جديد' : 'New Admin Account'}
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id;
            const roleMemberCount = adminsList.filter(
              (admin) => admin.role.toLowerCase().replace(/\s+/g, '-') === role.id
            ).length;

            return (
              <div
                key={role.id}
                onClick={() => {
                  onSelectRole(role.id);
                  onOpenDrawer(role.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-3)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--surface-sunken)' : 'var(--surface-base)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-base)';
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 'var(--radius-pill)',
                    background: role.color,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-sm)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}
                  >
                    {isRtl ? role.nameAr : role.name}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-xs)',
                      color: 'var(--on-surface-subtle)',
                    }}
                  >
                    {isRtl ? role.descriptionAr : role.description}
                  </span>
                </div>

                <StatusPill
                  variant="neutral"
                  label={
                    isRtl
                      ? `${roleMemberCount} مستخدم`
                      : `${roleMemberCount} users`
                  }
                />

                <ChevronRight
                  size={16}
                  style={{
                    color: 'var(--on-surface-subtle)',
                    transform: isRtl ? 'rotate(180deg)' : 'none',
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Card 2: Permissions Matrix */}
      <Card>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
            {isRtl ? 'مصفوفة الصلاحيات' : 'Permissions Matrix'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
            {isRtl
              ? `صلاحيات دور ${selectedRole.nameAr} · ${getEnabledCount(selectedRole)} صلاحية مفعلة`
              : `${selectedRole.name} role · ${getEnabledCount(selectedRole)} permissions enabled`}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
          {PERMISSION_GROUPS.map((group) => (
            <div
              key={group.label}
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  color: 'var(--on-surface)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  paddingBottom: 'var(--sp-1)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {isRtl ? group.labelAr : group.label}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                {group.perms.map((perm) => {
                  const isOn = Boolean(selectedRole.permissions[perm.key]);
                  return (
                    <div
                      key={perm.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                      }}
                    >
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface)' }}>
                        {isRtl ? perm.labelAr : perm.label}
                      </span>
                      <Checkbox
                        checked={isOn}
                        onChange={() => onPermissionToggle(perm.key)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
