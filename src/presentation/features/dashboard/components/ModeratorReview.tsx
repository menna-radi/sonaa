import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Card, Avatar, Button, EmptyState } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import type { VerificationSubmission } from '../../../../domain/repositories/MetricRepository';
import { ArrowRight } from 'lucide-react';

interface ModeratorReviewProps {
  submissions: VerificationSubmission[];
  /** Full queue size from the backend (may exceed the previewed submissions). */
  total?: number;
}

export const ModeratorReview: React.FC<ModeratorReviewProps> = ({ submissions, total }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  const formatRoleName = (key: string) => {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const clean = key.replace(/^role_/, '').replace(/_/g, ' ');
    return clean
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <Card
      title={t('sec_awaiting_moderator')}
      subtitle={t('sec_recent_verification')}
      headerAction={
        <Button variant="ghost" size="sm" onClick={() => navigate('verification')}>
          {t('open_queue')} ({total ?? submissions.length})
        </Button>
      }
      className="moderator-review-card"
    >
      {submissions.length === 0 ? (
        <EmptyState title={t('empty_verification')} />
      ) : (
        <div className="ov-rail">
          {submissions.map((sub) => (
            <div key={sub.id} className="ov-rail__card">
              <div className="ov-rail__top">
                <Avatar src={sub.avatarUrl} name={sub.name} size={40} />
                <div className="ov-rail__identity">
                  <span className="ov-rail__name" title={sub.name}>
                    {sub.name}
                  </span>
                  <span className="ov-rail__role">{formatRoleName(sub.roleKey)}</span>
                </div>
              </div>
              <div className="ov-rail__bottom">
                <span className="ov-rail__time">
                  {sub.submittedAt ? formatRelativeTime(sub.submittedAt, language) : t(sub.timeKey)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('verification')}
                  iconTrailing={<ArrowRight size={12} className="ui-icon--directional" />}
                >
                  {t('btn_review')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ModeratorReview;
