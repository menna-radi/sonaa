import React from 'react';

export interface LineChartSeries {
  id: string;
  name: string;
  data: number[];
  color?: string;
  active?: boolean;
}

export interface LineChartProps {
  series: LineChartSeries[];
  labels: string[];
  height?: number;
  width?: number;
  ariaLabel?: string;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  series,
  labels,
  height = 200,
  width = 900,
  ariaLabel = 'Performance trends line chart',
  className = '',
}) => {
  const paddingX = 40;
  const paddingY = 30;

  // Find global min and max across all active series
  const allValues = series
    .filter((s) => s.active !== false)
    .flatMap((s) => s.data);

  const maxVal = allValues.length > 0 ? Math.max(...allValues) * 1.1 : 100;
  const minVal = allValues.length > 0 ? Math.min(...allValues) * 0.9 : 0;
  const range = maxVal - minVal || 1;

  const getPoints = (data: number[]) => {
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - paddingX * 2) + paddingX;
      const y = height - ((val - minVal) / range) * (height - paddingY * 2) - paddingY;
      return { x, y, val };
    });
  };

  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * ((p1.x - p0.x) / 3);
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`ui-line-chart ${className}`}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 'var(--sp-2)' }}
    >
      <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ overflow: 'visible', display: 'block' }}
        >
          {/* Horizontal dashed grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = height - r * (height - paddingY * 2) - paddingY;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--chart-grid)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Render series lines */}
          {series.map((s, sIdx) => {
            if (s.active === false) return null;
            const pts = getPoints(s.data);
            const pathD = getBezierPath(pts);
            // Selected series uses primary or distinct monochrome, others muted
            const strokeColor = s.color || (sIdx === 0 ? 'var(--chart-1)' : 'var(--chart-2, var(--text-muted))');

            return (
              <path
                key={s.id}
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>

      {/* X-Axis labels */}
      {labels.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingInline: `${paddingX / 9}%`,
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          {labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      )}
    </div>
  );
};
