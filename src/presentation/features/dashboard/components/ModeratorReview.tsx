import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { GlassCard } from '../../../components/GlassCard';
import type { VerificationSubmission } from '../../../../domain/repositories/MetricRepository';

interface ModeratorReviewProps {
  submissions: VerificationSubmission[];
}

export const ModeratorReview: React.FC<ModeratorReviewProps> = ({ submissions }) => {
  const { t, language } = useLanguage();

  return (
    <GlassCard 
      className="moderator-review-card" 
      status="normal"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'start',
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >

      {/* Header section */}
      <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            color: '#737373', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {t('sec_recent_verification')}
          </span>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            marginTop: '2px', 
            color: '#171717',
            margin: '2px 0 0 0'
          }}>
            {t('sec_awaiting_moderator')}
          </h3>
        </div>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          color: '#171717',
          marginTop: '2px'
        }}>
          Open queue (129)
        </span>
      </div>

      {/* Grid items */}
      <div className="moderator-submissions-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {submissions.map((sub) => (
          <div 
            key={sub.id} 
            className="moderator-sub-item" 
            style={{
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              height: '101px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              width: '100%'
            }}
          >
            {/* Top row: Avatar & name/role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              {/* Profile Image */}
              <img
                src={sub.avatarUrl}
                alt={sub.name}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  color: '#171717', 
                  whiteSpace: 'nowrap', 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden',
                  width: '100%',
                  lineHeight: '1.3'
                }}>
                  {sub.name}
                </span>
                <span style={{ 
                  fontSize: '10px', 
                  color: '#737373',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  width: '100%',
                  marginTop: '1px'
                }}>
                  {t(sub.roleKey)}
                </span>
              </div>
            </div>

            {/* Bottom row: Time elapsed & Review link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '10px', color: '#737373', fontWeight: 400 }}>
                {t(sub.timeKey)}
              </span>

              <a
                href="#"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#171717',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                onClick={(e) => e.preventDefault()}
              >
                <span>{t('btn_review')}</span>
                <span style={{ transform: language === 'ar' || language === 'he' ? 'scaleX(-1)' : 'none' }}>
                  →
                </span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .moderator-submissions-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
            gap: 12px !important;
            justify-content: stretch !important;
          }
          .moderator-sub-item {
            width: 100% !important;
          }
        }
        @media (max-width: 768px) {
          .moderator-review-card {
            display: none !important;
          }
          .moderator-submissions-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </GlassCard>
  );
};
export default ModeratorReview;
