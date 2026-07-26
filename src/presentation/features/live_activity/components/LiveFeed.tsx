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
  Pause,
  Play,
} from 'lucide-react';
import type { ActivityEvent, ActivityEventType } from '../../../../domain/entities/LiveActivity';

interface LiveFeedProps {
  events: ActivityEvent[];
  isPaused: boolean;
  onTogglePause: () => void;
}

const EVENT_ICON: Record<ActivityEventType, React.ReactNode> = {
  sos_triggered:          <AlertTriangle size={15} color="#FFFFFF" />,
  job_posted:             <Briefcase size={15} color="#18181B" />,
  craftsman_online:       <Zap size={15} color="#15803D" />,
  payment_processed:      <DollarSign size={15} color="#18181B" />,
  job_completed:          <CheckCircle size={15} color="#15803D" />,
  verification_submitted: <ShieldCheck size={15} color="#18181B" />,
  surge_detected:         <TrendingUp size={15} color="#B45309" />,
  flag_raised:            <Flag size={15} color="#B45309" />,
};

const EVENT_ICON_BG: Record<ActivityEventType, string> = {
  sos_triggered:          '#EF4444', // Solid red
  job_posted:             '#F4F4F5', // Light grey
  craftsman_online:       '#DCFCE7', // Light green
  payment_processed:      '#F4F4F5', // Light grey
  job_completed:          '#DCFCE7', // Light green
  verification_submitted: '#F4F4F5', // Light grey
  surge_detected:         '#FEF3C7', // Light yellow/orange
  flag_raised:            '#FEF3C7', // Light yellow/orange
};

const EVENT_BG: Partial<Record<ActivityEventType, string>> = {
  sos_triggered: 'rgba(220, 38, 38, 0.03)',
};

export const LiveFeed: React.FC<LiveFeedProps> = ({ events, isPaused, onTogglePause }) => {
  return (
    <div
      className="glass-card live-desktop-feed-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div 
        className="live-feed-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'start' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Live Activity Feed
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Last hour · auto-streaming
          </div>
        </div>

        <div className="live-feed-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live dot */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-success)' }}>
            <span style={{
              width: '6px', height: '6px',
              background: 'var(--color-success)',
              borderRadius: '50%',
              animation: isPaused ? 'none' : 'pulse 2s infinite',
            }} />
            Live
          </span>

          {/* Pause / Resume button */}
          <button
            onClick={onTogglePause}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              background: '#171717',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPaused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
          </button>
        </div>
      </div>

      {/* Event list */}
      <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '420px' }}>
        {events.filter(e => !e.isSOS && e.type !== 'sos_triggered').map((event) => (
          <div
            key={event.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              background: EVENT_BG[event.type] ?? 'transparent',
              transition: 'background 0.2s ease',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: EVENT_ICON_BG[event.type] ?? 'var(--bg-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {EVENT_ICON[event.type]}
            </div>

            {/* Text & Actions */}
            <div style={{ flex: 1, textAlign: 'start', minWidth: 0 }}>
              <div style={{
                fontSize: '0.83rem',
                fontWeight: event.isSOS ? 700 : 600,
                color: event.isSOS ? '#9F1239' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {event.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {event.subtitle}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    const el = document.getElementById('operational-map-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#171717',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Show event on map"
                >
                  🗺️ Map
                </button>
                <button
                  onClick={() => {
                    window.location.href = `/tasks?search=${encodeURIComponent(event.title)}`;
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Open task details"
                >
                  📋 Details
                </button>
              </div>
            </div>

            {/* Age */}
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--text-disabled)',
              flexShrink: 0,
              paddingTop: '2px',
            }}>
              {event.ageLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;
