import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import type { Language } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/FormFields';
import { AlertBanner } from '../../../components/ui/AlertBanner';
import { LanguageMenu } from '../../../components/ui/LanguageMenu';
import { useBreakpoint } from '../../../components/ui/useBreakpoint';
import { LoginBrandBand, LoginBrandPanel } from '../components/LoginBrandPanel';

/** Compact logo + wordmark used in the top bar (mobile/tablet). */
const BrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const box = size === 'sm' ? 34 : 40;
  const icon = size === 'sm' ? 20 : 24;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
      <div
        style={{
          width: `${box}px`,
          height: `${box}px`,
          borderRadius: 'var(--radius-sm)',
          background: '#09090B',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img src="/arox-icon.svg" alt="Arox Logo" style={{ width: `${icon}px`, height: `${icon}px` }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            fontSize: 'var(--fs-card-title, 16px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'block',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
          }}
        >
          AROX Admin
        </span>
        <span style={{ display: 'block', marginTop: '3px', fontSize: 'var(--fs-micro, 11px)', lineHeight: 1.4, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Operations Portal
        </span>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { login, error: authError, clearError } = useAuth();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

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

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setValidationError(null);
    clearError();
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
        flexDirection: isDesktop ? 'row' : 'column',
        minHeight: '100vh',
        background: 'var(--surface-base)',
        color: 'var(--text-primary)',
        direction: isRtl ? 'rtl' : 'ltr',
        position: 'relative',
      }}
    >
      {/* Desktop: language dropdown floats in the top corner */}
      {isDesktop && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--sp-4)',
            insetInlineEnd: 'var(--sp-4)',
            zIndex: 10,
          }}
        >
          <LanguageMenu value={language} onChange={handleLanguageChange} />
        </div>
      )}

      {/* Mobile & tablet: in-flow top bar with brand + language dropdown */}
      {!isDesktop && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: '100%',
            padding: isMobile ? '12px 16px' : '16px 28px',
          }}
        >
          <BrandMark size="sm" />
          <LanguageMenu value={language} onChange={handleLanguageChange} size="sm" />
        </header>
      )}

      {/* Brand panel (desktop only) */}
      {isDesktop && <LoginBrandPanel />}

      {/* Tablet: compact brand band above the form */}
      {isTablet && <LoginBrandBand />}

      {/* Main Login Form side */}
      <div
        style={{
          flex: '1.2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: isMobile ? '24px 16px 32px' : isTablet ? '36px 28px 48px' : 'var(--space-8)',
          background: 'var(--surface-base)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : isTablet ? '480px' : '420px',
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: isMobile ? 'var(--space-6) var(--space-5)' : 'var(--space-8)',
            boxShadow: 'var(--shadow-pop)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? '22px' : 'var(--fs-page-title, 24px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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

        {/* Mobile & tablet footer */}
        {!isDesktop && (
          <p
            style={{
              margin: '24px 0 0 0',
              fontSize: 'var(--fs-micro, 11px)',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
