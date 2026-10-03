import React from 'react';
import './charts.css';

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
      <div className="ui-chart-legend">
        {series.map((s, idx) => (
          <div key={idx} className="ui-chart-legend-item">
            <span
              className="ui-chart-legend-dot"
              style={{ backgroundColor: s.color }}
            />
            <span className="ui-chart-legend-label">
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bars container */}
      <div
        className="ui-chart-bars-wrap"
        style={{ height }}
      >
        {categories.map((cat, cIdx) => (
          <div
            key={cIdx}
            className="ui-chart-col"
          >
            <div className="ui-chart-col-bars">
              {series.map((s, sIdx) => {
                const val = s.values[cIdx] || 0;
                const pct = (val / max) * 100;
                return (
                  <div
                    key={sIdx}
                    title={`${s.name}: ${val}`}
                    className="ui-chart-bar"
                    style={{
                      height: `${Math.max(4, pct)}%`,
                      backgroundColor: s.color,
                    }}
                  />
                );
              })}
            </div>
            <span className="ui-chart-col-label">
              {cat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
