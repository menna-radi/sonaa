import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { GlassCard } from '../../../components/GlassCard';
import type { CategoryVolume } from '../../../../domain/repositories/MetricRepository';
import { MoreHorizontal } from 'lucide-react';

interface TopCategoriesProps {
  categories: CategoryVolume[];
}

export const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => {
  const { t } = useLanguage();
  const maxTasks = 2843;

  const formatCategoryName = (key: string) => {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const clean = key.replace(/^cat_/, '').replace(/_/g, ' ');
    if (clean === 'ac tech') return 'AC Repair';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return (
    <GlassCard 
      className="top-categories-card" 
      status="normal"
    >
      <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {t('sec_top_categories')}
          </span>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            marginTop: '2px', 
            color: 'var(--text-primary)',
            margin: '2px 0 0 0'
          }}>
            {t('sec_by_volume')}
          </h3>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
        {categories.map((cat, idx) => {
          const barWidth = `${(cat.tasksCount / maxTasks) * 84}%`;
          return (
            <div key={idx} className="category-progress-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="flex-between" style={{ fontSize: '12px' }}>
                {/* Category Name */}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatCategoryName(cat.nameKey)}
                </span>
                
                {/* Count and Trend pill (Desktop/Tablet only) */}
                <div className="category-details-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '10px' }}>
                    {cat.tasksCount.toLocaleString()} tasks
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    color: '#16A34A'
                  }}>
                    +{cat.trendPercentage}%
                  </span>
                </div>

                {/* Percentage (Mobile only) */}
                <div className="category-details-mobile" style={{ display: 'none' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)'
                  }}>
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Horizontal progress bar */}
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'var(--bg-surface-hover)', 
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: barWidth,
                  maxWidth: '100%',
                  height: '100%', 
                  background: 'var(--color-primary)', 
                  borderRadius: '9999px'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .top-categories-card {
          display: flex;
          flex-direction: column;
          text-align: start;
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 16px !important;
          padding: 24px !important;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04) !important;
          box-sizing: border-box;
          width: 100%;
        }

        .category-details-desktop {
          display: flex !important;
        }

        .category-details-mobile {
          display: none !important;
        }

        @media (max-width: 768px) {
          .top-categories-card {
            padding: 16px !important;
          }
          .category-details-desktop {
            display: none !important;
          }
          .category-details-mobile {
            display: block !important;
          }
          /* Hide Painting (4th item, index 3) on mobile to match Figma mobile */
          .category-progress-row:nth-child(4) {
            display: none !important;
          }
        }
      `}</style>
    </GlassCard>
  );
};
export default TopCategories;
