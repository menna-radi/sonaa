import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'end',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const getNextEnabledIndex = useCallback(
    (current: number, step: 1 | -1) => {
      if (items.length === 0) return -1;
      let next = current;
      for (let i = 0; i < items.length; i++) {
        next = (next + step + items.length) % items.length;
        if (!items[next]?.disabled) return next;
      }
      return current;
    },
    [items]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => getNextEnabledIndex(prev, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => getNextEnabledIndex(prev, -1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        const first = items.findIndex((it) => !it.disabled);
        if (first !== -1) setFocusedIndex(first);
      } else if (e.key === 'End') {
        e.preventDefault();
        let last = -1;
        for (let i = items.length - 1; i >= 0; i--) {
          if (!items[i]?.disabled) {
            last = i;
            break;
          }
        }
        if (last !== -1) setFocusedIndex(last);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDropdown, getNextEnabledIndex, items]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      const first = items.findIndex((it) => !it.disabled);
      setFocusedIndex(first >= 0 ? first : 0);
    }
  };

  return (
    <div ref={containerRef} className={`ui-dropdown ${className}`}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => {
            if (!prev) {
              const first = items.findIndex((it) => !it.disabled);
              setFocusedIndex(first >= 0 ? first : 0);
            }
            return !prev;
          });
        }}
        onKeyDown={handleTriggerKeyDown}
        className="ui-dropdown__trigger"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`ui-dropdown__menu ui-dropdown__menu--${align}`}
        >
          {items.map((item, idx) => (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              role="menuitem"
              tabIndex={focusedIndex === idx ? 0 : -1}
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                setFocusedIndex(-1);
                item.onClick();
              }}
              className={`ui-dropdown__item ${item.tone === 'danger' ? 'ui-dropdown__item--danger' : ''} ${focusedIndex === idx ? 'is-focused' : ''}`}
            >
              {item.icon && <span className="ui-dropdown__item-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
