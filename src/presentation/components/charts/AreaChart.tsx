import React from 'react';

export interface AreaChartProps {
  points: string; // e.g. "10,130 50,120 ... 600,55"
  fillPoints: string; // e.g. "10,130 ... 600,55 600,160 10,160"
  height?: number;
  viewBox?: string;
  ariaLabel?: string;
  className?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  points,
  fillPoints,
  height = 176,
  viewBox = '0 0 600 160',
  ariaLabel = 'Area chart',
  className = '',
}) => {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`ui-chart-area ${className}`}
      style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="uiAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Faint baseline */}
        <line
          x1="0"
          y1="159"
          x2="600"
          y2="159"
          stroke="var(--chart-grid)"
          strokeWidth="1"
        />

        {/* Shaded Area */}
        <polygon points={fillPoints} fill="url(#uiAreaGradient)" />

        {/* Stroke Line */}
        <polyline
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};
