import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { User as DomainUser } from '../../../../domain/entities/User';
import { TeamRole } from '../types';
import { Drawer, Avatar, Button, StatusPill, EmptyState, Skeleton } from '../../../components/ui';
import { Plus, Users } from 'lucide-react';

export interface RoleMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role: TeamRole;
  members: DomainUser[];
  loading: boolean;
  error: string | null;
  onAddMember: () => void;
}

export const RoleMembersDrawer: React.FC<RoleMembersDrawerProps> = ({
  isOpen,
  onClose,
  role,
  members,
  loading,
  error,
  onAddMember,
}) => {
  const { isRtl } = useLanguage();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? role.nameAr : role.name}
      subtitle={isRtl ? role.descriptionAr : role.description}
      size="md"
      position={isRtl ? 'left' : 'right'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            {isRtl ? 'إغلاق' : 'Close'}
          </Button>
          <Button variant="primary" size="sm" onClick={onAddMember} icon={<Plus size={14} />}>
            {isRtl ? 'إضافة عضو' : 'Add Member'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)' }}>
            {isRtl ? `أعضاء الفريق (${members.length})` : `Assigned Members (${members.length})`}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', padding: 'var(--sp-2)' }}>
                <Skeleton width={36} height={36} variant="circle" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)', padding: 'var(--sp-3)' }}>
            {error}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users size={32} style={{ color: 'var(--on-surface-subtle)' }} />}
            title={isRtl ? 'لا يوجد أعضاء في هذا الدور' : 'No members assigned'}
            description={
              isRtl
                ? 'لم يتم تعيين أي مشرف لهذا الدور الإداري حتى الآن.'
                : 'No administrative users have been granted this role yet.'
            }
            action={
              <Button variant="outline" size="sm" onClick={onAddMember} icon={<Plus size={14} />}>
                {isRtl ? 'إضافة عضو جديد' : 'Add New Member'}
              </Button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  gap: 'var(--sp-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
                  <Avatar
                    src={member.avatarUrl}
                    name={member.name}
                    size={40}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 'var(--font-sm)',
                        fontWeight: 600,
                        color: 'var(--on-surface)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--font-xs)',
                        color: 'var(--on-surface-subtle)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.email}
                    </span>
                  </div>
                </div>

                <StatusPill variant="success" dot label={isRtl ? 'نشط' : 'Active'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
