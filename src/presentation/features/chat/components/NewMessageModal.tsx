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
import { ChatSearchUser } from '../../../../domain/entities/Chat';
import { Result } from '../../../../core/result/Result';

export interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: ChatSearchUser) => Promise<void>;
  searchUsers: (query?: string, role?: string) => Promise<Result<ChatSearchUser[]>>;
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
  const [users, setUsers] = useState<ChatSearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (isMounted) setLoading(true);
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
      } catch {
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

  const handleStart = async (user: ChatSearchUser) => {
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
      <div className="ui-col" style={{ gap: 'var(--sp-4)' }}>
        <p className="ui-caption ui-text-muted" style={{ margin: 0 }}>
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
        <div className="chat-users-modal-list">
          {loading ? (
            <div className="ui-col" style={{ gap: 'var(--sp-3)', padding: 'var(--sp-2)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="ui-row" style={{ gap: 'var(--sp-3)' }}>
                  <Skeleton width={36} height={36} variant="circle" />
                  <div className="ui-col" style={{ flex: 1, gap: 4 }}>
                    <Skeleton width="50%" height={14} />
                    <Skeleton width="30%" height={11} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={<User size={32} />}
              title={isRtl ? 'لم يتم العثور على مستخدمين' : 'No users found'}
              description={
                isRtl
                  ? 'لا توجد نتائج تطابق بحثك الحالي.'
                  : 'No users found matching your search or role filter.'
              }
            />
          ) : (
            users.map((usr) => (
              <div key={usr.id} className="chat-user-item">
                <div className="chat-user-item__info">
                  <Avatar
                    src={usr.avatarUrl}
                    name={usr.name || 'User'}
                    size={32}
                  />

                  <div className="chat-user-item__details">
                    <div className="chat-user-item__name-row">
                      <span className="chat-user-item__name">
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

                    <div className="chat-user-item__subtext">
                      {usr.phoneNumber && (
                        <span className="ui-row ui-row--tight">
                          <Phone size={11} />
                          <span>{usr.phoneNumber}</span>
                        </span>
                      )}
                      {usr.trade && (
                        <span className="ui-row ui-row--tight">
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
