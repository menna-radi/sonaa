import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category } from '../../../../domain/entities/Category';
import { Card, KpiCard, ProgressBar, StatusPill } from '../../../components/ui';
import { Layers, FolderTree, Users, Briefcase, TrendingUp, BarChart2 } from 'lucide-react';

export interface ServiceKpisProps {
  categories: Category[];
  activeCraftsmen: number;
  totalRequests: number;
}

export const ServiceKpis: React.FC<ServiceKpisProps> = ({
  categories,
  activeCraftsmen,
  totalRequests,
}) => {
  const { isRtl } = useLanguage();

  const totalSubcategories = categories.reduce(
    (sum, c) => sum + (c.subcategoriesCount || 0),
    0
  );

  const growingList = React.useMemo(() => {
    return categories
      .map((cat, idx) => ({
        rank: idx + 1,
        name: isRtl ? cat.nameAr : cat.name,
        grow:
          cat.requestVolume === 'High'
            ? '+24.5%'
            : cat.requestVolume === 'Medium'
            ? '+12.0%'
            : '+5.0%',
        pct:
          cat.requestVolume === 'High'
            ? 85
            : cat.requestVolume === 'Medium'
            ? 50
            : 25,
      }))
      .slice(0, 5);
  }, [categories, isRtl]);

  // Real volume distribution replacing the static donut placeholder
  const categoryDistribution = React.useMemo(() => {
    const totalSubs = Math.max(totalSubcategories, 1);
    return categories.slice(0, 5).map((c) => {
      const pct = Math.round(((c.subcategoriesCount || 1) / totalSubs) * 100);
      return {
        id: c.id,
        name: isRtl ? c.nameAr : c.name,
        count: c.subcategoriesCount || 0,
        pct: Math.min(pct, 100),
      };
    });
  }, [categories, totalSubcategories, isRtl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* 4 KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        <KpiCard
          label={isRtl ? 'إجمالي الفئات' : 'Total Categories'}
          value={categories.length}
          icon={<Layers size={18} />}
        />
        <KpiCard
          label={isRtl ? 'إجمالي الفئات الفرعية' : 'Total Subcategories'}
          value={totalSubcategories}
          icon={<FolderTree size={18} />}
        />
        <KpiCard
          label={isRtl ? 'الحرفيين النشطين' : 'Active Craftsmen'}
          value={activeCraftsmen.toLocaleString()}
          delta={5.4}
          icon={<Users size={18} />}
        />
        <KpiCard
          label={isRtl ? 'إجمالي الطلبات' : 'Total Requests'}
          value={totalRequests.toLocaleString()}
          delta={12.0}
          icon={<Briefcase size={18} />}
        />
      </div>

      {/* 2 Insight Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {/* Fastest Growing Categories */}
        <Card>
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <TrendingUp size={16} style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
                {isRtl ? 'الفئات الأكثر طلباً ونمواً' : 'Fastest Growing Categories'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
              {isRtl ? 'معدل نمو الطلبات على أساس شهري' : 'Month-over-month request demand trends'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {growingList.map((item) => (
              <div key={item.rank} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--surface-sunken)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--on-surface-subtle)',
                      }}
                    >
                      {item.rank}
                    </span>
                    <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                      {item.name}
                    </span>
                  </div>

                  <StatusPill variant="success" label={item.grow} />
                </div>
                <ProgressBar value={item.pct} max={100} />
              </div>
            ))}
          </div>
        </Card>

        {/* Category Share Distribution */}
        <Card>
          <div style={{ marginBottom: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
                {isRtl ? 'توزيع الخدمات والفئات الفرعية' : 'Category Service Distribution'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
              {isRtl ? 'نسبة الفئات الفرعية المخصصة لكل خدمة رئيسية' : 'Distribution of active service offerings across catalog'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {categoryDistribution.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--on-surface)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
                    {item.count} {isRtl ? 'خدمة فرعية' : 'services'} ({item.pct}%)
                  </span>
                </div>
                <ProgressBar value={item.pct} max={100} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
