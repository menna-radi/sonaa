import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { GlassCard } from '../../../components/GlassCard';
import type { CohortData } from '../../../../domain/repositories/MetricRepository';

interface CohortVelocityProps {
  data: CohortData[];
}

export const CohortVelocity: React.FC<CohortVelocityProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <GlassCard 
      className="cohort-velocity-card" 
      status="normal"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'start',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      
      {/* Header and Legend checkboxes */}
      <div className="flex-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {t('sec_marketplace_growth')}
          </span>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            marginTop: '2px', 
            color: 'var(--text-primary)',
            margin: '2px 0 0 0'
          }}>
            {t('sec_weekly_cohort')}
          </h3>
        </div>

        {/* Custom checkboxes legend keys */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--text-primary)', borderRadius: '2px' }} />
            <span>Users</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--text-muted)', borderRadius: '2px' }} />
            <span>Craftsmen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--border-color)', borderRadius: '2px' }} />
            <span>Tasks</span>
          </div>
        </div>
      </div>

      {/* Clustered Bar Graphs Container */}
      <div className="bars-container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: '176px',
        width: '100%',
        paddingTop: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px'
      }}>
        {data.map((week, idx) => (
          <div key={idx} className="week-cluster-column" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            height: '100%',
            justifyContent: 'flex-end'
          }}>
            {/* Clustered bars side-by-side */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: '100%',
              width: '100%',
              justifyContent: 'center'
            }}>
              {/* Users Bar */}
              <div 
                style={{ 
                  width: '12px', 
                  height: `${week.users}%`, 
                  background: 'var(--text-primary)', 
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px'
                }} 
                title={`Users: ${week.users}%`}
              />
              {/* Craftsmen Bar */}
              <div 
                style={{ 
                  width: '12px', 
                  height: `${week.craftsmen}%`, 
                  background: 'var(--text-muted)', 
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px'
                }} 
                title={`Craftsmen: ${week.craftsmen}%`}
              />
              {/* Tasks Bar */}
              <div 
                style={{ 
                  width: '12px', 
                  height: `${week.tasks}%`, 
                  background: 'var(--border-color)', 
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px'
                }} 
                title={`Tasks: ${week.tasks}%`}
              />
            </div>

            {/* Label under bar cluster */}
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: '8px', fontWeight: 500 }}>
              {week.week}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cohort-velocity-card {
            display: none !important;
          }
        }
      `}</style>
    </GlassCard>
  );
};
export default CohortVelocity;
