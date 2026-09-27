import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Globe, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/FormFields';
import { AlertBanner } from '../../../components/ui/AlertBanner';
import { Segmented } from '../../../components/ui/Segmented';
import { useBreakpoint } from '../../../components/ui/useBreakpoint';

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { login, error: authError, clearError } = useAuth();
  const { isMobile } = useBreakpoint();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    if (!email.trim()) {
      errors.email = t('login_err_empty') || 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = t('login_err_empty') || 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error('Login request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const errorMessage =
    validationError ||
    (authError === 'credentials_invalid'
      ? t('login_err_invalid') || 'Invalid email or password'
      : authError);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--surface-base)',
        color: 'var(--text-primary)',
        direction: isRtl ? 'rtl' : 'ltr',
        position: 'relative',
      }}
    >
      {/* Dynamic language picker in top corner */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--sp-4)',
          insetInlineEnd: 'var(--sp-4)',
          zIndex: 10,
        }}
      >
        <Segmented
          value={language}
          onChange={(val) => {
            setLanguage(val as 'en' | 'ar' | 'he');
            setValidationError(null);
            clearError();
          }}
          items={[
            { value: 'en', label: 'EN' },
            { value: 'ar', label: 'AR' },
            { value: 'he', label: 'HE' },
          ]}
        />
      </div>

      {/* Brand panel on start (Desktop & Tablet) */}
      {!isMobile && (
        <div
          style={{
            flex: '1.1',
            background: 'var(--surface-inverse)',
            color: 'var(--on-inverse)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '8% 6%',
            position: 'relative',
            overflow: 'hidden',
            borderInlineEnd: '1px solid var(--border-color)',
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-15%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <img
                src="/arox-icon.svg"
                alt="Arox Logo"
                style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--on-inverse)',
                }}
              >
                Arox Admin
              </span>
            </div>

            <p style={{ fontSize: 'var(--font-size-base)', opacity: 0.85, lineHeight: 1.6, maxWidth: '420px', margin: 0 }}>
              {t('login_welcome_subtitle') ||
                'Access platform analytics, technician verification, and operations control center.'}
            </p>

            {/* Platform Trust Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--sp-3)',
                marginTop: 'var(--sp-6)',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', color: 'var(--color-success)' }}>
                  <ShieldCheck size={16} />
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>256-Bit SSL</span>
                </div>
                <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', opacity: 0.7, marginTop: '2px' }}>
                  Secure Encrypted Access
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', color: 'var(--on-inverse)' }}>
                  <MapPin size={16} />
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Jerusalem & WB</span>
                </div>
                <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', opacity: 0.7, marginTop: '2px' }}>
                  Regional Operations
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.6, position: 'relative', zIndex: 1 }}>
            &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
          </div>
        </div>
      )}

      {/* Main Login Form side */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? 'var(--sp-6) var(--sp-4)' : '0 8%',
          background: 'var(--surface-base)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Mobile brand header */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)' }}>
              <img src="/arox-icon.svg" alt="Arox Logo" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)' }} />
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Arox Admin</span>
            </div>
          )}

          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('login_welcome_title') || 'Welcome back'}
            </h1>
            <p style={{ margin: 'var(--sp-1) 0 0 0', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {t('login_welcome_subtitle') || 'Enter your credentials to access the admin portal'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <AlertBanner
                tone="danger"
                icon={<ShieldAlert size={18} />}
                title={errorMessage}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ position: 'relative' }}>
              <TextField
                label={t('login_label_email') || 'Email Address'}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder={t('login_placeholder_email') || 'admin@sonaa.com'}
                error={fieldErrors.email}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <TextField
                label={t('login_label_password') || 'Password'}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder={t('login_placeholder_password') || '••••••••'}
                error={fieldErrors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  top: '38px',
                  insetInlineEnd: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              style={{ width: '100%', marginTop: 'var(--sp-2)' }}
            >
              {t('login_btn_submit') || 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
