import React from 'react';

export interface GroupedBarSeries {
  name: string;
  color: string;
  values: number[];
}

export interface GroupedBarChartProps {
  categories: string[];
  series: GroupedBarSeries[];
  height?: number;
  ariaLabel?: string;
  className?: string;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  categories,
  series,
  height = 200,
  ariaLabel = 'Grouped bar chart',
  className = '',
}) => {
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1);

  return (
    <div className={`ui-chart-grouped-bar ${className}`} role="img" aria-label={ariaLabel}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginBottom: 12 }}>
        {series.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: s.color,
              }}
            />
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bars container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 4,
          gap: 8,
        }}
      >
        {categories.map((cat, cIdx) => (
          <div
            key={cIdx}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%', width: '100%', justifyContent: 'center' }}>
              {series.map((s, sIdx) => {
                const val = s.values[cIdx] || 0;
                const pct = (val / max) * 100;
                return (
                  <div
                    key={sIdx}
                    title={`${s.name}: ${val}`}
                    style={{
                      width: '28%',
                      maxWidth: 14,
                      height: `${Math.max(4, pct)}%`,
                      backgroundColor: s.color,
                      borderRadius: '2px 2px 0 0',
                      transition: 'height var(--dur-base) var(--ease)',
                    }}
                  />
                );
              })}
            </div>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-faint)',
                whiteSpace: 'nowrap',
                marginTop: 4,
              }}
            >
              {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface LineChartProps {
  points: { x: number; y: number }[];
  labels?: string[];
  height?: number;
  color?: string;
  ariaLabel?: string;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  points,
  labels,
  height = 180,
  color = 'var(--chart-1)',
  ariaLabel = 'Line chart',
  className = '',
}) => {
  if (!points || points.length < 2) return null;

  const yValues = points.map((p) => p.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const rangeY = maxY - minY || 1;

  const width = 600;
  const paddingY = 16;
  const chartH = height - paddingY * 2;

  const svgPoints = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - paddingY - ((p.y - minY) / rangeY) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div role="img" aria-label={ariaLabel} className={className} style={{ width: '100%', height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="var(--chart-grid)" strokeWidth="1" />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
      </svg>
    </div>
  );
};
