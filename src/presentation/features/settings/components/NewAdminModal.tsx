import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { TeamRole } from '../types';
import { Modal, TextField, Select, Button, Avatar } from '../../../components/ui';
import { Eye, EyeOff } from 'lucide-react';

export interface NewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: TeamRole[];
  defaultRole?: string;
  onSubmit: (data: { name: string; email: string; role: string; avatarUrl?: string }) => Promise<void>;
}

export const NewAdminModal: React.FC<NewAdminModalProps> = ({
  isOpen,
  onClose,
  roles,
  defaultRole = 'super-admin',
  onSubmit,
}) => {
  const { isRtl } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setName('');
      setEmail('');
      setPassword('');
      setAvatarUrl('');
      setErrors({});
    }
  }, [isOpen, defaultRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = isRtl ? 'الاسم بالكامل مطلوب' : 'Full name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = isRtl ? 'الاسم يجب أن يكون ٣ أحرف على الأقل' : 'Name must be at least 3 characters';
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = isRtl ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = isRtl ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = isRtl
        ? 'يجب أن تكون ٨ أحرف على الأقل وتحتوي على حروف وأرقام'
        : 'Must be at least 8 characters with letters and numbers';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = roles.map((r) => ({
    value: r.name,
    label: isRtl ? r.nameAr : r.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRtl ? 'إضافة حساب مشرف جديد' : 'Add New Admin Account'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {/* Avatar picker preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', paddingBottom: 'var(--sp-2)' }}>
          <Avatar
            src={avatarUrl}
            name={name || 'Admin'}
            size={48}
          />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)', marginBottom: 4 }}>
              {isRtl ? 'رابط الصورة الشخصية (اختياري)' : 'Avatar URL (optional)'}
            </label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--sp-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-base)',
                color: 'var(--on-surface)',
                fontSize: 'var(--font-xs)',
              }}
            />
          </div>
        </div>

        <TextField
          label={isRtl ? 'الاسم بالكامل' : 'Full Name'}
          placeholder={isRtl ? 'مثال: أحمد الفارس' : 'e.g. Ahmed Al-Farsi'}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          required
        />

        <TextField
          label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
          type="email"
          placeholder="admin@sonaa.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
        />

        <div>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)', marginBottom: 4 }}>
            {isRtl ? 'كلمة المرور المؤقتة' : 'Temporary Password'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 'var(--sp-2) var(--sp-3)',
                paddingInlineEnd: 40,
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border-subtle)'}`,
                background: 'var(--surface-base)',
                color: 'var(--on-surface)',
                fontSize: 'var(--font-sm)',
                boxSizing: 'border-box',
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '50%',
                insetInlineEnd: 10,
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--on-surface-subtle)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: 2, display: 'block' }}>
              {errors.password}
            </span>
          )}
        </div>

        <Select
          label={isRtl ? 'الدور الإداري والصلاحيات' : 'Administrative Role'}
          options={roleOptions}
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
          <Button variant="outline" size="md" type="button" onClick={onClose} disabled={submitting}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button variant="primary" size="md" type="submit" loading={submitting}>
            {isRtl ? 'إنشاء الحساب' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
