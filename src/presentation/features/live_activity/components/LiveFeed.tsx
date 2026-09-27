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
  MapPin,
} from 'lucide-react';
import type { ActivityEvent, ActivityEventType } from '../../../../domain/entities/LiveActivity';
import { Card, ListItem, IconCircle, Button } from '../../../components/ui';

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
  const displayEvents = events.slice(0, 50);

  return (
    <Card
      eyebrow="Live Activity Feed"
      title="Last hour · auto-streaming"
      headerAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 'var(--fs-caption)',
              fontWeight: 600,
              color: isPaused ? 'var(--text-muted)' : 'var(--live)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isPaused ? 'var(--text-muted)' : 'var(--live)',
              }}
            />
            {isPaused ? 'Paused' : '● Live'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      }
      className="live-feed-card live-desktop-feed-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 560,
        boxSizing: 'border-box',
      }}
    >
      <div
        className="live-feed-scroll"
        style={{
          overflowY: 'auto',
          flex: 1,
          maxHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-1)',
        }}
      >
        {displayEvents.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--sp-8) var(--sp-4)',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Zap size={24} style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-2)' }} />
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Monitoring Operations
            </div>
            <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', maxWidth: 240, marginTop: 4 }}>
              Listening for real-time task creations, updates, and dispatches…
            </div>
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
                trailing={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                    <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                      {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('focus-map-job', {
                            detail: {
                              eventId: event.id,
                              title: event.title,
                            },
                          })
                        );
                      }}
                      title="Fly map view to location"
                    >
                      <MapPin size={12} />
                    </Button>
                  </div>
                }
              />
            );
          })
        )}
      </div>
    </Card>
  );
};

export default LiveFeed;
