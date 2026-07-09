import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Layers, Mail, Lock, ShieldAlert, Globe, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login, error: authError, clearError } = useAuth();

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

  return (
    <div className="login-page-container" style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)'
    }}>
      {/* Dynamic language picker absolute top right */}
      <div className="login-lang-header" style={{
        position: 'absolute',
        top: '20px',
        insetInlineEnd: '20px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--bg-surface)',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <Globe size={14} style={{ color: 'var(--text-muted)' }} />
        {(['en', 'ar', 'he'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => {
              setLanguage(lang);
              setValidationError(null);
              clearError();
            }}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              borderRadius: '4px',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: language === lang ? 'var(--color-primary)' : 'transparent',
              color: language === lang ? 'var(--bg-surface)' : 'var(--text-secondary)'
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Brand illustration side (Hidden on mobile/tablet) */}
      <div className="login-sidebar" style={{
        flex: '1.2',
        background: '#171717',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8% 6%',
        position: 'relative',
        overflow: 'hidden',
        borderInlineEnd: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, rgba(0,0,0,0) 70%)' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/sonaa logo.svg" alt="Sonaa Logo" style={{ width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0 }} />
            <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#ffffff' }}>
              Sonaa Admin
            </h1>
          </div>
          <p style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.6, maxWidth: '440px' }}>
            {t('subtitle')}
          </p>

          {/* Quick Mock Statistics preview */}
          <div className="login-stats-preview" style={{ marginTop: 'var(--spacing-xl)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#737373' }}>{t('metrics_total_users')}</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', marginTop: '4px', fontFamily: 'var(--font-title)' }}>48,392</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#737373' }}>{t('metrics_revenue_mtd')}</span>
              <strong style={{ display: 'block', fontSize: '1.5rem', marginTop: '4px', fontFamily: 'var(--font-title)' }}>SAR 842K</strong>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '40px', right: '40px', fontSize: '0.75rem', color: '#525252', zIndex: 2 }}>
          © 2026 Sonaa Operations Portal • Developed by Qatfa Code
        </div>
      </div>

      {/* Main Login Form side */}
      <div className="login-form-side" style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 8%',
        background: 'var(--bg-base)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          {/* Brand header for mobile screens */}
          <div className="mobile-login-logo" style={{ display: 'none', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)' }}>
            <img src="/sonaa logo.svg" alt="Sonaa Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0 }} />
            <h2 style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}>Sonaa</h2>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              {t('login_welcome_title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              {t('login_welcome_subtitle')}
            </p>
          </div>

          {/* Localized Error Messages */}
          {(validationError || authError) && (
            <div className="login-error-banner" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '12px var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem'
            }}>
              <ShieldAlert size={16} />
              <span>
                {validationError || (authError === 'credentials_invalid' ? t('login_err_invalid') : authError)}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('login_label_email')}
                <span style={{ color: '#ef4444', marginInlineStart: '2px' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', top: '50%', insetInlineStart: '12px', transform: 'translateY(-50%)', color: fieldErrors.email ? '#ef4444' : 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: undefined })); }}
                  placeholder={t('login_placeholder_email')}
                  style={{
                    width: '100%',
                    background: '#f5f5f5',
                    border: `1px solid ${fieldErrors.email ? '#ef4444' : '#e4e4e7'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    paddingInlineStart: '36px',
                    paddingInlineEnd: '16px',
                    fontSize: '0.9rem',
                    color: '#171717',
                    outline: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  className="login-input"
                />
              </div>
              {fieldErrors.email && (
                <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="flex-between">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {t('login_label_password')}
                  <span style={{ color: '#ef4444', marginInlineStart: '2px' }}>*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '50%', insetInlineStart: '12px', transform: 'translateY(-50%)', color: fieldErrors.password ? '#ef4444' : 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: undefined })); }}
                  placeholder={t('login_placeholder_password')}
                  style={{
                    width: '100%',
                    background: '#f5f5f5',
                    border: `1px solid ${fieldErrors.password ? '#ef4444' : '#e4e4e7'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    paddingInlineStart: '36px',
                    paddingInlineEnd: '40px',
                    fontSize: '0.9rem',
                    color: '#171717',
                    outline: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    insetInlineEnd: '12px',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s'
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: 'var(--bg-base)',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 600,
                fontSize: '0.95rem',
                marginTop: 'var(--spacing-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              className="login-submit-btn"
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2.5px solid rgba(255,255,255,0.2)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : t('login_btn_submit')}
            </button>
          </form>

        </div>
      </div>

      <style>{`
        .login-input:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 2px rgba(23,23,23,0.05);
        }
        .login-submit-btn:hover:not(:disabled) {
          background: #333333 !important;
          transform: translateY(-1px);
        }
        @media (max-width: 1024px) {
          .login-sidebar {
            display: none !important;
          }
          .mobile-login-logo {
            display: flex !important;
          }
          .login-form-side {
            padding: 0 4% !important;
          }
        }
      `}</style>
    </div>
  );
};
export default LoginPage;
