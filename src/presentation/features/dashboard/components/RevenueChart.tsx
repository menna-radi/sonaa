import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { PaymentSummary } from '../../../../domain/entities/Payment';
import { GlassCard } from '../../../components/GlassCard';
import { ArrowUpRight } from 'lucide-react';

export const RevenueChart: React.FC = () => {
  const { t } = useLanguage();
  const { repositories } = useDependencies();
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  useEffect(() => {
    let isMounted = true;
    repositories.paymentRepository.getPaymentSummary().then(res => {
      if (isMounted && res.success) {
        setSummary(res.data);
      }
    });
    return () => { isMounted = false; };
  }, [repositories.paymentRepository]);

  const displayRevenue = summary ? `SAR ${summary.netRevenue.toLocaleString()}` : 'SAR 842,308';
  const displayGmv = summary ? `SAR ${(summary.gmvMtd / 1000000).toFixed(2)}M` : 'SAR 4.12M';
  const displayTakeRate = summary ? `${summary.takeRate}%` : '20.4%';

  // Coordinate paths representing the filled chart matching the images
  const chartsData = {
    '30d': {
      value: displayRevenue,
      trend: '+18.9%',
      points: '10,130 50,120 90,118 130,122 170,112 210,105 250,100 290,108 330,95 370,88 410,90 450,78 490,72 530,70 570,60 600,55',
      fillPoints: '10,130 50,120 90,118 130,122 170,112 210,105 250,100 290,108 330,95 370,88 410,90 450,78 490,72 530,70 570,60 600,55 600,160 10,160',
      sub: 'Last 30 days · Compared to prior month'
    },
    '90d': {
      value: summary ? `SAR ${(summary.netRevenue * 2.8).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : 'SAR 2,458,920',
      trend: '+22.4%',
      points: '10,140 70,135 140,110 210,118 280,95 350,102 420,82 490,68 560,50 600,42',
      fillPoints: '10,140 70,135 140,110 210,118 280,95 350,102 420,82 490,68 560,50 600,42 600,160 10,160',
      sub: 'Last 90 days · Compared to prior quarter'
    },
    'ytd': {
      value: summary ? `SAR ${(summary.netRevenue * 10 / 1000000).toFixed(2)}M` : 'SAR 8.42M',
      trend: '+34.1%',
      points: '10,150 100,130 200,112 300,90 400,68 500,52 600,30',
      fillPoints: '10,150 100,130 200,112 300,90 400,68 500,52 600,30 600,160 10,160',
      sub: 'Year to date · Compared to prior year'
    }
  };

  const activeData = chartsData[timeframe];

  return (
    <GlassCard 
      className="revenue-analytics-card" 
      status="normal"
    >
      
      {/* Chart Title / Filter Row */}
      <div className="revenue-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '16px' }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            color: '#737373', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {t('sec_revenue_analytics')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <h2 style={{ 
              fontSize: '30px', 
              fontWeight: 700, 
              fontFamily: 'var(--font-sans)', 
              color: '#171717',
              letterSpacing: '-0.6px',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {activeData.value}
            </h2>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              color: '#16A34A',
              fontWeight: 700,
              fontSize: '12px',
              marginTop: '4px'
            }}>
              <ArrowUpRight size={12} strokeWidth={3} />
              <span>{activeData.trend}</span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px', margin: '4px 0 0 0' }}>
            {activeData.sub}
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          background: '#F5F5F5', 
          padding: '2px', 
          borderRadius: '8px',
          height: '27px',
          boxSizing: 'border-box',
          alignItems: 'center'
        }}>
          {(['30d', '90d', 'ytd'] as const).map(tab => {
            const isActive = timeframe === tab;
            return (
              <button
                key={tab}
                onClick={() => setTimeframe(tab)}
                style={{
                  padding: '0 12px',
                  height: '23px',
                  fontSize: '10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#171717' : '#737373',
                  boxShadow: isActive ? '0px 1px 1px rgba(0, 0, 0, 0.05)' : 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                {tab === '30d' ? '30D' : tab === '90d' ? '90D' : 'YTD'}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Shaded Line Chart */}
      <div className="revenue-chart-container" style={{ position: 'relative', width: '100%', height: '176px', marginTop: '12px', overflow: 'hidden' }}>
        <svg width="100%" height="176" viewBox="0 0 600 160" preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Gradients definitions */}
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#171717" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#171717" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Shaded Area */}
          <polygon
            points={activeData.fillPoints}
            fill="url(#chartGlow)"
          />

          {/* Core Stroke Line */}
          <polyline
            fill="none"
            stroke="#171717"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={activeData.points}
          />
        </svg>
      </div>

      {/* Analytics stats row */}
      <div className="analytics-details-grid">
        <div style={{ textAlign: 'start' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#737373', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '0.5px' }}>GMV</span>
          <strong style={{ display: 'block', fontSize: '14px', color: '#171717', marginTop: '4px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{displayGmv}</strong>
        </div>
        <div style={{ textAlign: 'start' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#737373', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '0.5px' }}>Take Rate</span>
          <strong style={{ display: 'block', fontSize: '14px', color: '#171717', marginTop: '4px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{displayTakeRate}</strong>
        </div>
        <div style={{ textAlign: 'start' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#737373', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '0.5px' }}>Avg Order</span>
          <strong style={{ display: 'block', fontSize: '14px', color: '#171717', marginTop: '4px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>SAR 342</strong>
        </div>
        <div style={{ textAlign: 'start' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#737373', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '0.5px' }}>Disputes</span>
          <strong style={{ display: 'block', fontSize: '14px', color: '#171717', marginTop: '4px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>0.8%</strong>
        </div>
      </div>

      <style>{`
        .revenue-analytics-card {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          text-align: start;
          background: #FFFFFF !important;
          border: 1px solid #E5E5E5 !important;
          border-radius: 16px !important;
          padding: 24px !important;
          box-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.04) !important;
          box-sizing: border-box;
          width: 100%;
        }

        .analytics-details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          border-top: 1px solid #F5F5F5;
          padding-top: 20px;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .revenue-analytics-card {
            display: none !important;
          }
        }
      `}</style>

    </GlassCard>
  );
};
export default RevenueChart;
