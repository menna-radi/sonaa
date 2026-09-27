import React, { useRef } from 'react';

export interface SegmentedItem {
  value: string;
  label: React.ReactNode;
  count?: number;
  tone?: 'danger';
}

export interface SegmentedProps {
  value: string;
  onChange: (value: string) => void;
  items: SegmentedItem[];
  variant?: 'default' | 'solid';
  className?: string;
}

export const Segmented: React.FC<SegmentedProps> = ({
  value,
  onChange,
  items,
  variant = 'default',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % items.length;
      onChange(items[nextIndex].value);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + items.length) % items.length;
      onChange(items[prevIndex].value);
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`ui-segmented ui-segmented--${variant} ${className}`}
    >
      {items.map((item, idx) => {
        const isActive = item.value === value;
        const itemClasses = [
          'ui-segmented__item',
          isActive ? 'ui-segmented__item--active' : '',
          item.tone === 'danger' ? 'ui-segmented__item--danger' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={itemClasses}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span>{item.label}</span>
            {item.count != null && (
              <span className="ui-segmented__count">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
