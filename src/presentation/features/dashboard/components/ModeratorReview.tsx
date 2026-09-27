import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Card, Avatar, Button } from '../../../components/ui';
import type { VerificationSubmission } from '../../../../domain/repositories/MetricRepository';
import { ArrowRight } from 'lucide-react';

interface ModeratorReviewProps {
  submissions: VerificationSubmission[];
}

export const ModeratorReview: React.FC<ModeratorReviewProps> = ({ submissions }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  const formatRoleName = (key: string) => {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const clean = key.replace(/^role_/, '').replace(/_/g, ' ');
    return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Card
      title={t('sec_awaiting_moderator')}
      subtitle={t('sec_recent_verification')}
      headerAction={
        <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-muted)' }}>
          {t('open_queue') || 'Open queue'} ({submissions.length})
        </span>
      }
      className="moderator-review-card"
      style={{ width: '100%' }}
    >
      <div
        className="moderator-submissions-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--sp-3)',
          width: '100%',
        }}
      >
        {submissions.map((sub) => (
          <div
            key={sub.id}
            style={{
              padding: 'var(--sp-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 110,
              gap: 'var(--sp-3)',
              boxSizing: 'border-box',
              transition: 'border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
            }}
          >
            {/* Top row: Avatar & Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
              <Avatar src={sub.avatarUrl} name={sub.name} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                <span
                  style={{
                    fontSize: 'var(--fs-caption)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                  title={sub.name}
                >
                  {sub.name}
                </span>
                <span
                  style={{
                    fontSize: 'var(--fs-micro)',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {formatRoleName(sub.roleKey)}
                </span>
              </div>
            </div>

            {/* Bottom row: Time & Action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--sp-2)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>
                {t(sub.timeKey)}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('verification')}
                iconTrailing={
                  <ArrowRight
                    size={12}
                    style={{ transform: language === 'ar' || language === 'he' ? 'scaleX(-1)' : 'none' }}
                  />
                }
              >
                {t('btn_review')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ModeratorReview;
