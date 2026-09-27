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
            flex: '1',
            minWidth: '380px',
            maxWidth: '520px',
            background: '#09090B',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '8% 6%',
            position: 'relative',
            overflow: 'hidden',
            borderInlineEnd: '1px solid rgba(255, 255, 255, 0.08)',
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
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #1C1C1E 0%, #09090B 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                }}
              >
                <img
                  src="/arox-icon.svg"
                  alt="Arox Logo"
                  style={{ width: '26px', height: '26px' }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: 'var(--fs-page-title, 24px)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    display: 'block',
                    lineHeight: 1.1,
                  }}
                >
                  AROX
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontWeight: 600,
                  }}
                >
                  Operations &bull; Admin
                </span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--fs-body, 14px)', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6, maxWidth: '420px', margin: 0 }}>
              {t('login_welcome_subtitle') ||
                'Access platform analytics, technician verification, and operations control center.'}
            </p>

            {/* Platform Trust Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-3)',
                marginTop: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success, #10B981)' }}>
                  <ShieldCheck size={16} />
                  <span style={{ fontSize: 'var(--fs-caption, 12px)', fontWeight: 600, color: '#FFFFFF' }}>256-Bit SSL</span>
                </div>
                <span style={{ display: 'block', fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Secure Encrypted Access
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#FFFFFF' }}>
                  <MapPin size={16} style={{ color: 'var(--accent, #6366F1)' }} />
                  <span style={{ fontSize: 'var(--fs-caption, 12px)', fontWeight: 600, color: '#FFFFFF' }}>Jerusalem & WB</span>
                </div>
                <span style={{ display: 'block', fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                  Regional Operations
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.45)', position: 'relative', zIndex: 1 }}>
            &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
          </div>
        </div>
      )}

      {/* Main Login Form side */}
      <div
        style={{
          flex: '1.2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? 'var(--space-6) var(--space-4)' : 'var(--space-8)',
          background: 'var(--surface-base)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: isMobile ? 'var(--space-6) var(--space-5)' : 'var(--space-8)',
            boxShadow: 'var(--shadow-pop)',
          }}
        >
          {/* Mobile brand header */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#09090B',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img src="/arox-icon.svg" alt="Arox Logo" style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ fontSize: 'var(--fs-card-title, 16px)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                  AROX Admin
                </span>
                <span style={{ fontSize: 'var(--fs-micro, 11px)', color: 'var(--text-muted)' }}>
                  Operations Portal
                </span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--fs-page-title, 24px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {t('login_welcome_title') || 'Welcome back'}
            </h1>
            <p style={{ margin: 'var(--space-1) 0 0 0', color: 'var(--text-muted)', fontSize: 'var(--fs-small, 13px)' }}>
              {t('login_welcome_subtitle') || 'Enter your credentials to access the admin portal'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <AlertBanner
                tone="danger"
                icon={<ShieldAlert size={18} />}
                title={errorMessage}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ position: 'relative' }}>
              <TextField
                label={t('login_label_email') || 'Email Address'}
                type="email"
                autoComplete="username"
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
                autoComplete="current-password"
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
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
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
