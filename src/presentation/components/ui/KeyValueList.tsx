import React from 'react';

export interface KeyValueItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface KeyValueListProps {
  items: KeyValueItem[];
  columns?: 1 | 2;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({ items, columns = 1 }) => {
  return (
    <dl className={`ui-kv${columns === 2 ? ' ui-kv--2' : ''}`}>
      {items.map((item, i) => (
        <div className="ui-kv__row" key={i}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default KeyValueList;
