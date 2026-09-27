import React from 'react';
import { Check, MapPin, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/** Shared trust-highlight chips (SSL + region). Auto-fit grid for panel & band. */
export const TrustChips: React.FC = () => {
  const chip: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  };
  const iconTile = (tint: string, glow: string): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: tint,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: glow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px',
        width: '100%',
      }}
    >
      <div style={chip}>
        <span style={iconTile('rgba(16, 185, 129, 0.12)', '0 0 16px rgba(16, 185, 129, 0.25)')}>
          <ShieldCheck size={16} style={{ color: '#34D399' }} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--fs-caption, 12px)', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
            256-Bit SSL
          </span>
          <span style={{ display: 'block', fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
            Secure Encrypted Access
          </span>
        </span>
      </div>

      <div style={chip}>
        <span style={iconTile('rgba(99, 102, 241, 0.14)', '0 0 16px rgba(99, 102, 241, 0.3)')}>
          <MapPin size={16} style={{ color: '#A5B4FC' }} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--fs-caption, 12px)', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
            Jerusalem & WB
          </span>
          <span style={{ display: 'block', fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        alignSelf: 'flex-start',
        padding: '6px 12px',
        borderRadius: '999px',
        border: '1px solid rgba(52, 211, 153, 0.25)',
        background: 'rgba(16, 185, 129, 0.08)',
        fontSize: 'var(--fs-micro, 11px)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: '#6EE7B7',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#34D399',
          boxShadow: '0 0 10px rgba(52, 211, 153, 0.9)',
          flexShrink: 0,
        }}
      />
      {t('system_healthy') || 'All healthy'}
    </span>
  );
};

/** Logo lockup (tile + wordmark). */
const BrandLockup: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '10px' : '14px' }}>
    <div
      style={{
        width: compact ? '44px' : '54px',
        height: compact ? '44px' : '54px',
        borderRadius: '15px',
        background: 'linear-gradient(135deg, #26262B 0%, #09090B 70%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5), 0 0 32px rgba(99, 102, 241, 0.12)',
      }}
    >
      <img src="/arox-icon.svg" alt="Arox Logo" style={{ width: compact ? '26px' : '30px', height: compact ? '26px' : '30px' }} />
    </div>
    <div>
      <span
        style={{
          fontSize: compact ? '22px' : '27px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          display: 'block',
          lineHeight: 1.05,
        }}
      >
        AROX
      </span>
      <span
        style={{
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.5)',
          fontWeight: 600,
        }}
      >
        Operations &bull; Admin
      </span>
    </div>
  </div>
);

/** Capability checklist under the headline. */
const FeatureList: React.FC = () => {
  const { t } = useLanguage();
  const items = [
    t('login_feat_live') || 'Real-time activity monitoring',
    t('login_feat_verify') || 'Craftsman verification queue',
    t('login_feat_payments') || 'Payments, payouts & plans',
  ];
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((label) => (
        <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={12} style={{ color: '#34D399' }} strokeWidth={3} />
          </span>
          <span style={{ fontSize: 'var(--fs-small, 13px)', color: 'rgba(255, 255, 255, 0.82)', fontWeight: 500 }}>
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
};

const glowBase: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
};

/** Full-height brand panel — desktop login layout. */
export const LoginBrandPanel: React.FC = () => {
  const { t } = useLanguage();
  return (
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
        gap: '32px',
        padding: '44px 40px',
        position: 'relative',
        overflow: 'hidden',
        borderInlineEnd: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Ambient decoration */}
      <div style={{ ...glowBase, top: '-18%', insetInlineEnd: '-20%', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, transparent 70%)' }} />
      <div style={{ ...glowBase, bottom: '-25%', insetInlineStart: '-25%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)' }} />

      <StatusPill />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', zIndex: 1 }}>
        <BrandLockup />

        <div>
          <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: '#FFFFFF', maxWidth: '360px' }}>
            {t('login_brand_headline') || 'Command center for your marketplace'}
          </h2>
          <p style={{ margin: '10px 0 0 0', fontSize: 'var(--fs-body, 14px)', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, maxWidth: '400px' }}>
            {t('login_welcome_subtitle') || 'Access platform analytics, technician verification, and operations control center.'}
          </p>
        </div>

        <FeatureList />
        <TrustChips />
      </div>

      <div style={{ fontSize: 'var(--fs-micro, 11px)', color: 'rgba(255, 255, 255, 0.4)', position: 'relative', zIndex: 1 }}>
        &copy; 2026 AROX Operations Portal &bull; All Rights Reserved
      </div>
    </div>
  );
};

/** Compact brand band — tablet login layout. */
export const LoginBrandBand: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section
      style={{
        width: '100%',
        background: '#09090B',
        color: '#FFFFFF',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '26px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ ...glowBase, top: '-60%', insetInlineEnd: '-10%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <BrandLockup compact />
        <StatusPill />
      </div>

      <p style={{ margin: 0, fontSize: 'var(--fs-body, 14px)', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.6, maxWidth: '640px', position: 'relative', zIndex: 1 }}>
        {t('login_welcome_subtitle') || 'Access platform analytics, technician verification, and operations control center.'}
      </p>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <TrustChips />
      </div>
    </section>
  );
};

export default LoginBrandPanel;
