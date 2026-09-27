import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Modal,
  SearchInput,
  Segmented,
  Avatar,
  StatusPill,
  Button,
  EmptyState,
  Skeleton,
} from '../../../components/ui';
import { Phone, Briefcase, MessageSquare, User } from 'lucide-react';

export interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => Promise<void>;
  searchUsers: (query?: string, role?: string) => Promise<any>;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  searchUsers,
}) => {
  const { isRtl } = useLanguage();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'ALL' | 'CUSTOMER' | 'CRAFTSMAN'>('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(query, role);
        if (isMounted) {
          if (res?.success) {
            setUsers(res.data || []);
          } else {
            setUsers([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setUsers([]);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, query, role, searchUsers]);

  const handleStart = async (user: any) => {
    setStartingUserId(user.id);
    try {
      await onSelectUser(user);
    } finally {
      setStartingUserId(null);
    }
  };

  const roleTabs = [
    { value: 'ALL', label: isRtl ? 'الكل' : 'All' },
    { value: 'CUSTOMER', label: isRtl ? 'العملاء' : 'Customers' },
    { value: 'CRAFTSMAN', label: isRtl ? 'الحرفيين' : 'Craftsmen' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'بدء محادثة مع أي مستخدم' : 'Message Any User'}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'تواصل مباشرة مع أي حرفي أو عميل مسجل في المنصة.'
            : 'Search and start a direct real-time chat with any customer or craftsman.'}
        </p>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={isRtl ? 'بحث بالاسم، رقم الهاتف، أو البريد...' : 'Search by name, phone, or email...'}
          autoFocus
        />

        <Segmented
          value={role}
          onChange={(v) => setRole(v as 'ALL' | 'CUSTOMER' | 'CRAFTSMAN')}
          items={roleTabs}
        />

        {/* Users list feed */}
        <div
          style={{
            maxHeight: 340,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-2)',
            paddingInlineEnd: 4,
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-2)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                  <Skeleton width={36} height={36} variant="circle" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Skeleton width="50%" height={14} />
                    <Skeleton width="30%" height={11} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<User size={32} style={{ color: 'var(--on-surface-subtle)' }} />}
              title={isRtl ? 'لم يتم العثور على مستخدمين' : 'No users found'}
              description={
                isRtl
                  ? 'لا توجد نتائج تطابق بحثك الحالي.'
                  : 'No users found matching your search or role filter.'
              }
            />
          ) : (
            users.map((usr) => (
              <div
                key={usr.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--sp-2) var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  gap: 'var(--sp-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
                  <Avatar
                    src={usr.avatarUrl}
                    name={usr.name}
                    size={32}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
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
                        {usr.name}
                      </span>
                      <StatusPill
                        variant={usr.role === 'CRAFTSMAN' ? 'info' : 'neutral'}
                        label={
                          usr.role === 'CRAFTSMAN'
                            ? (isRtl ? 'حرفي' : 'Craftsman')
                            : (isRtl ? 'عميل' : 'Customer')
                        }
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sp-3)',
                        fontSize: 'var(--font-xs)',
                        color: 'var(--on-surface-subtle)',
                      }}
                    >
                      {usr.phoneNumber && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} />
                          <span>{usr.phoneNumber}</span>
                        </span>
                      )}
                      {usr.trade && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={11} />
                          <span>{usr.trade}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStart(usr)}
                  loading={startingUserId === usr.id}
                  disabled={Boolean(startingUserId)}
                  icon={<MessageSquare size={13} />}
                >
                  {isRtl ? 'محادثة' : 'Chat'}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
