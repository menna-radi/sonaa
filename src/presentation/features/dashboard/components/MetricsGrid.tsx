import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { GlassCard } from '../../../components/GlassCard';
import { Metric } from '../../../../domain/entities/Metric';
import { Users, Hammer, ClipboardList, Coins, Flame, UserCheck, ArrowUp, ArrowDown } from 'lucide-react';

interface MetricsGridProps {
  metrics: Metric[];
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const { t, language } = useLanguage();

  const getIcon = (id: string) => {
    switch (id) {
      case 'users': return <Users size={14} />;
      case 'craftsmen': return <Hammer size={14} />;
      case 'tasks': return <ClipboardList size={14} />;
      case 'revenue': return <Coins size={14} />;
      case 'emergency': return <Flame size={14} />;
      case 'verification': return <UserCheck size={14} />;
      default: return <ClipboardList size={14} />;
    }
  };

  const getSubtext = (id: string) => {
    switch (id) {
      case 'users': return 'vs last week';
      case 'craftsmen': return '312 online now';
      case 'tasks': return '47 emergencies';
      case 'revenue': return 'vs last month';
      case 'emergency': return 'last 24 hours';
      case 'verification': return 'pending review';
      default: return '';
    }
  };

  const getTrendText = (id: string) => {
    switch (id) {
      case 'users': return '12.4%';
      case 'craftsmen': return '8.2%';
      case 'tasks': return '5.6%';
      case 'revenue': return '18.9%';
      case 'emergency': return '23%';
      case 'verification': return '3.1%';
      default: return '';
    }
  };

  const isPositiveTrend = (id: string) => {
    return id !== 'verification';
  };

  const getLocalizedTitle = (id: string, name: string, lang: string) => {
    if (lang === 'ar') {
      if (id === 'craftsmen') {
        return (
          <>
            <span>الحرفيين</span>
            <span>النشطين</span>
          </>
        );
      }
      if (id === 'revenue') {
        return (
          <>
            <span>الأرباح</span>
            <span>(شهرياً)</span>
          </>
        );
      }
      if (id === 'emergency') {
        return (
          <>
            <span>طلبات</span>
            <span>الطوارئ</span>
          </>
        );
      }
      if (id === 'verification') {
        return (
          <>
            <span>طلبات</span>
            <span>التحقق</span>
          </>
        );
      }
    } else if (lang === 'he') {
      if (id === 'craftsmen') {
        return (
          <>
            <span>בעלי מקצוע</span>
            <span>פעילים</span>
          </>
        );
      }
      if (id === 'revenue') {
        return (
          <>
            <span>הכנסות</span>
            <span>(חודשי)</span>
          </>
        );
      }
      if (id === 'emergency') {
        return (
          <>
            <span>בקשות</span>
            <span>חירום</span>
          </>
        );
      }
      if (id === 'verification') {
        return (
          <>
            <span>בקשות</span>
            <span>אימות</span>
          </>
        );
      }
    }

    if (id === 'craftsmen') {
      return (
        <>
          <span>Active</span>
          <span>Craftsmen</span>
        </>
      );
    }
    if (id === 'revenue') {
      return (
        <>
          <span>Revenue</span>
          <span>(MTD)</span>
        </>
      );
    }
    if (id === 'emergency') {
      return (
        <>
          <span>Emergency</span>
          <span>Reqs</span>
        </>
      );
    }
    if (id === 'verification') {
      return (
        <>
          <span>Verification</span>
          <span>Reqs</span>
        </>
      );
    }
    return <span>{name}</span>;
  };

  const getLocalizedValue = (id: string, value: number, unit: string, lang: string) => {
    if (id === 'revenue') {
      const formattedVal = value >= 1000000 
        ? `${(value / 1000000).toFixed(1)}M` 
        : value >= 1000 
        ? `${Math.floor(value / 1000)}K` 
        : `${value.toLocaleString()}`;
      return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', whiteSpace: 'nowrap' }}>
          <span className="value-number">{formattedVal}</span>
          <span className="currency-unit">ILS</span>
        </div>
      );
    }
    return <span className="value-number">{value.toLocaleString()}</span>;
  };

  return (
    <div className="grid-container dashboard-metrics-grid">
      {metrics.map(metric => {
        const trend = getTrendText(metric.id);
        const sub = getSubtext(metric.id);
        const positive = isPositiveTrend(metric.id);

        return (
          <GlassCard 
            key={metric.id} 
            className="stat-metric-card" 
            status="normal"
          >
            {/* Top row: Icon and Trend */}
            <div className="metric-card-top-row">
              <div className="metric-card-icon-wrapper">
                {getIcon(metric.id)}
              </div>

              {trend && (
                <div className={`metric-card-trend-wrapper ${positive ? 'trend-up' : 'trend-down'}`}>
                  {positive ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                  <span>{trend}</span>
                </div>
              )}
            </div>

            {/* Title Row */}
            <div className="metric-card-title-container">
              {getLocalizedTitle(metric.id, t(metric.nameKey), language)}
            </div>
            
            {/* Value Row */}
            <div className="metric-card-value-container">
              {getLocalizedValue(metric.id, metric.value, metric.unit, language)}
            </div>

            {/* Bottom: Subtext */}
            <div className="metric-card-subtext-container">
              {sub}
            </div>
          </GlassCard>
        );
      })}
      
      {/* Dynamic responsive grid overrides using styling block */}
      <style>{`
        .dashboard-metrics-grid {
          display: flex;
          width: 100%;
          height: 203px;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: var(--spacing-lg);
          box-sizing: border-box;
        }

        .stat-metric-card {
          flex: 1;
          height: 203px;
          background: var(--bg-surface, #FFFFFF) !important;
          border: 1px solid var(--border-color, #E5E5E5) !important;
          border-radius: 16px !important;
          padding: 20px !important;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: stretch !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          margin: 0 !important;
          transition: transform var(--transition-fast) !important;
        }

        .stat-metric-card:hover {
          transform: translateY(-2px) !important;
        }

        .metric-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          height: 32px;
        }

        .metric-card-icon-wrapper {
          background: var(--bg-surface-hover, #F5F5F5);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary, #171717);
        }

        .metric-card-trend-wrapper {
          display: flex;
          align-items: center;
          gap: 2px;
          font-weight: 700;
          font-size: 11px;
          font-family: var(--font-sans);
        }

        .metric-card-trend-wrapper.trend-up {
          color: #16A34A;
        }

        .metric-card-trend-wrapper.trend-down {
          color: #EF4444;
        }

        .metric-card-title-container {
          margin-top: 16px;
          height: 30px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          text-align: start;
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-muted, #737373);
          letter-spacing: 0.5px;
          line-height: 15px;
        }

        .metric-card-title-container span {
          display: block;
        }

        .metric-card-value-container {
          margin-top: 4px;
          height: 60px;
          display: flex;
          flex-direction: row;
          align-items: baseline;
          gap: 6px;
          justify-content: flex-start;
          text-align: start;
        }

        .metric-card-value-container .value-number {
          display: inline-block;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #171717);
          letter-spacing: -0.48px;
          line-height: 30px;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .metric-card-value-container .currency-unit {
          display: inline-block;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-secondary, #737373);
          letter-spacing: -0.2px;
          line-height: 24px;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .metric-card-subtext-container {
          margin-top: 4px;
          height: 15px;
          font-size: 10px;
          color: var(--text-disabled, #A3A3A3);
          text-align: start;
          line-height: 15px;
          font-family: var(--font-sans);
        }

        @media (max-width: 1024px) {
          .dashboard-metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            width: 100% !important;
            height: auto !important;
            gap: 16px !important;
          }
          .stat-metric-card {
            width: 100% !important;
            height: 100% !important;
            min-height: 173px !important;
            padding: 20px !important;
          }
          .stat-metric-card:nth-child(n+4) {
            min-height: 203px !important;
          }
        }

        @media (max-width: 768px) {
          .dashboard-metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            width: 100% !important;
            height: auto !important;
            gap: 12px !important;
            margin-bottom: 16px;
          }
          .stat-metric-card {
            width: 100% !important;
            height: 100% !important;
            min-height: 107.5px !important;
            padding: 14px !important;
            border-radius: 16px !important;
          }
          .stat-metric-card:nth-child(-n+2) {
            min-height: 123px !important;
          }
          .stat-metric-card:nth-child(n+5) {
            display: none !important;
          }
          
          .metric-card-title-container {
            margin-top: 8px !important;
            height: auto !important;
            line-height: 1.2 !important;
          }
          .metric-card-value-container {
            margin-top: 2px !important;
            height: auto !important;
          }
          .metric-card-value-container .value-number,
          .metric-card-value-container .currency-unit {
            font-size: 20px !important;
            line-height: 1.2 !important;
          }
          .metric-card-subtext-container {
            margin-top: 2px !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};
export default MetricsGrid;
