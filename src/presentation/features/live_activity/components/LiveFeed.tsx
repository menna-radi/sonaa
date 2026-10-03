import React from 'react';
import {
  AlertTriangle,
  Briefcase,
  Zap,
  DollarSign,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Flag,
} from 'lucide-react';
import type { ActivityEvent, ActivityEventType } from '../../../../domain/entities/LiveActivity';
import { Card, ListItem, IconCircle, Button } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';

interface LiveFeedProps {
  events: ActivityEvent[];
  isPaused: boolean;
  onTogglePause: () => void;
}

const getEventToneAndIcon = (type: ActivityEventType): { icon: React.ReactNode; tone: 'default' | 'danger' | 'warning' | 'success' | 'info' } => {
  switch (type) {
    case 'sos_triggered':
      return { icon: <AlertTriangle size={14} />, tone: 'danger' };
    case 'job_posted':
      return { icon: <Briefcase size={14} />, tone: 'info' };
    case 'craftsman_online':
      return { icon: <Zap size={14} />, tone: 'success' };
    case 'payment_processed':
      return { icon: <DollarSign size={14} />, tone: 'default' };
    case 'job_completed':
      return { icon: <CheckCircle size={14} />, tone: 'success' };
    case 'verification_submitted':
      return { icon: <ShieldCheck size={14} />, tone: 'default' };
    case 'surge_detected':
      return { icon: <TrendingUp size={14} />, tone: 'warning' };
    case 'flag_raised':
      return { icon: <Flag size={14} />, tone: 'warning' };
    default:
      return { icon: <Zap size={14} />, tone: 'default' };
  }
};

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, isPaused, onTogglePause }) => {
  const { t, language } = useLanguage();
  const displayEvents = events.filter((e) => !e.isSOS).slice(0, 50);

  return (
    <Card
      eyebrow={t('live_feed_eyebrow')}
      title={t('live_feed_title')}
      headerAction={
        <div className="ui-row">
          <span className={`live-feed__status${isPaused ? ' is-paused' : ''}`}>
            <span className="live-feed__dot" />
            {isPaused ? t('live_feed_paused') : t('live_live')}
          </span>
          <Button variant="ghost" size="sm" onClick={onTogglePause}>
            {isPaused ? t('live_feed_resume') : t('live_feed_pause')}
          </Button>
        </div>
      }
      className="live-feed"
    >
      <div className="live-feed__scroll">
        {displayEvents.length === 0 ? (
          <div className="live-empty">
            <Zap size={24} />
            <div className="live-empty__title">{t('live_feed_empty_title')}</div>
            <div className="live-empty__body">{t('live_feed_empty_body')}</div>
          </div>
        ) : (
          displayEvents.map((event) => {
            const { icon, tone } = getEventToneAndIcon(event.type);
            return (
              <ListItem
                key={event.id}
                leading={<IconCircle icon={icon} tone={tone} size={32} />}
                title={event.title}
                subtitle={event.subtitle}
                trailing={<span className="live-feed__time">{formatRelativeTime(event.timestamp, language)}</span>}
              />
            );
          })
        )}
      </div>
    </Card>
  );
};

export default LiveFeed;
