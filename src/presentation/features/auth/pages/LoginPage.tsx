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
import { validate, tError } from '../../../../domain/validation';
import { loginSchema } from '../../../../domain/use_cases/auth/LoginUseCase';
import { UnauthorizedError, ForbiddenError, NetworkError } from '../../../../core/errors/AppError';
import '../auth.css';

/** Compact logo + wordmark used in the top bar (mobile/tablet). */
const BrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const icon = size === 'sm' ? 20 : 24;
  return (
    <div className="login-brand-mark">
      <div className={`login-brand-mark__box login-brand-mark__box--${size}`}>
        <img src="/arox-icon.svg" alt="Arox Logo" style={{ width: `${icon}px`, height: `${icon}px` }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <span className="login-brand-mark__title">
          AROX Admin
        </span>
        <span className="login-brand-mark__subtitle">
          Operations Portal
        </span>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { login, error: authError, clearError } = useAuth();
  const { isTablet, isDesktop } = useBreakpoint();

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

    const v = validate(loginSchema, { email, password });
    if (!v.ok) {
      setFieldErrors({
        email: tError(t, v.errors.email),
        password: tError(t, v.errors.password),
      });
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      if (err instanceof UnauthorizedError) {
        setValidationError(t('login_error_invalid'));
      } else if (err instanceof ForbiddenError) {
        setValidationError(authError === 'login_error_not_admin' ? t('login_error_not_admin') : t('login_error_forbidden'));
      } else if (err instanceof NetworkError) {
        setValidationError(t('err_network'));
      } else if (authError === 'login_error_not_admin') {
        setValidationError(t('login_error_not_admin'));
      } else {
        setValidationError(t('login_error_invalid'));
      }
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
    (authError
      ? t(authError) || authError
      : null);

  return (
    <div
      className={`login-page ${isDesktop ? 'login-page--desktop' : 'login-page--mobile'}`}
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Desktop: language dropdown floats in the top corner */}
      {isDesktop && (
        <div className="login-desktop-lang">
          <LanguageMenu value={language} onChange={handleLanguageChange} />
        </div>
      )}

      {/* Mobile & tablet: in-flow top bar with brand + language dropdown */}
      {!isDesktop && (
        <header className={`login-mobile-header ${isTablet ? 'login-mobile-header--tablet' : ''}`}>
          <BrandMark size="sm" />
          <LanguageMenu value={language} onChange={handleLanguageChange} size="sm" />
        </header>
      )}

      {/* Brand panel (desktop only) */}
      {isDesktop && <LoginBrandPanel />}

      {/* Tablet: compact brand band above the form */}
      {isTablet && <LoginBrandBand />}

      {/* Main Login Form side */}
      <div className={`login-form-side ${isTablet ? 'login-form-side--tablet' : isDesktop ? 'login-form-side--desktop' : ''}`}>
        <div className={`login-form-card ${isDesktop ? 'login-form-card--desktop' : ''}`}>
          <div className="login-form-header">
            <h1 className="login-form-title">
              {t('login_welcome_title')}
            </h1>
            <p className="login-form-subtitle">
              {t('login_welcome_subtitle')}
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

          <form onSubmit={handleSubmit} className="ui-col" style={{ gap: 'var(--sp-4)' }}>
            <div>
              <TextField
                label={t('login_label_email')}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder={t('login_placeholder_email')}
                error={fieldErrors.email}
                required
              />
            </div>

            <div className="login-pw-wrapper">
              <TextField
                label={t('login_label_password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder={t('login_placeholder_password')}
                error={fieldErrors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="login-pw-toggle"
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
              className="login-submit-btn"
            >
              {t('login_btn_submit')}
            </Button>
          </form>
        </div>

        {/* Mobile & tablet footer */}
        {!isDesktop && (
          <p className="login-mobile-footer">
            &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
