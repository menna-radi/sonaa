import React from 'react';
import { Check, MapPin, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/** Shared trust-highlight chips (SSL + region). Auto-fit grid for panel & band. */
export const TrustChips: React.FC = () => {
  return (
    <div className="login-trust-chips">
      <div className="login-trust-chip">
        <span className="login-trust-chip__icon login-trust-chip__icon--green">
          <ShieldCheck size={16} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="login-trust-chip__title">
            256-Bit SSL
          </span>
          <span className="login-trust-chip__desc">
            Secure Encrypted Access
          </span>
        </span>
      </div>

      <div className="login-trust-chip">
        <span className="login-trust-chip__icon login-trust-chip__icon--indigo">
          <MapPin size={16} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="login-trust-chip__title">
            Jerusalem & WB
          </span>
          <span className="login-trust-chip__desc">
            Regional Operations
          </span>
        </span>
      </div>
    </div>
  );
};

/** Live-status pill shown at the top of the brand surfaces. */
const StatusPill: React.FC = () => {
  const { t } = useLanguage();
  return (
    <span className="login-status-pill">
      <span className="login-status-pill__dot" />
      {t('system_healthy')}
    </span>
  );
};

/** Logo lockup (tile + wordmark). */
const BrandLockup: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`login-brand-lockup ${compact ? 'login-brand-lockup--compact' : ''}`}>
    <div className={`login-brand-lockup__icon-box ${compact ? 'login-brand-lockup__icon-box--compact' : ''}`}>
      <img
        src="/arox-icon.svg"
        alt="Arox Logo"
        className={`login-brand-lockup__img ${compact ? 'login-brand-lockup__img--compact' : ''}`}
      />
    </div>
    <div>
      <span className={`login-brand-lockup__title ${compact ? 'login-brand-lockup__title--compact' : ''}`}>
        AROX
      </span>
      <span className="login-brand-lockup__subtitle">
        Operations &bull; Admin
      </span>
    </div>
  </div>
);

/** Capability checklist under the headline. */
const FeatureList: React.FC = () => {
  const { t } = useLanguage();
  const items = [
    t('login_feat_live'),
    t('login_feat_verify'),
    t('login_feat_payments'),
  ];
  return (
    <ul className="login-features">
      {items.map((label) => (
        <li key={label} className="login-features__item">
          <span className="login-features__check">
            <Check size={12} strokeWidth={3} />
          </span>
          <span className="login-features__text">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
};

/** Full-height brand panel — desktop login layout. */
export const LoginBrandPanel: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="login-brand-panel">
      {/* Ambient decoration */}
      <div className="login-brand-glow login-brand-glow--1" />
      <div className="login-brand-glow login-brand-glow--2" />

      <StatusPill />

      <div className="ui-col" style={{ gap: '22px', position: 'relative', zIndex: 1 }}>
        <BrandLockup />

        <div>
          <h2 className="login-brand-headline">
            {t('login_brand_headline')}
          </h2>
          <p className="login-brand-desc">
            {t('login_welcome_subtitle')}
          </p>
        </div>

        <FeatureList />
        <TrustChips />
      </div>

      <div className="login-brand-footer">
        &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
      </div>
    </div>
  );
};

/** Compact brand band — tablet login layout. */
export const LoginBrandBand: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="login-brand-band">
      <div className="login-brand-glow login-brand-glow--band" />

      <div className="ui-row ui-row--between" style={{ gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <BrandLockup compact />
        <StatusPill />
      </div>

      <p className="login-brand-desc" style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {t('login_welcome_subtitle')}
      </p>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <TrustChips />
      </div>
    </section>
  );
};

export default LoginBrandPanel;
