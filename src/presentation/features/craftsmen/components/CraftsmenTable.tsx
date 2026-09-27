import React from 'react';
import type { Craftsman } from '../hooks/useCraftsmen';
import {
  Card,
  SearchInput,
  Segmented,
  DataTable,
  EmptyState,
  Avatar,
  VerifiedMark,
  ScoreChip,
  StatusPill,
} from '../../../components/ui';
import { getCraftsmenColumns } from './columns';
import { Star, Users } from 'lucide-react';

interface CraftsmenTableProps {
  craftsmen: Craftsman[];
  loading?: boolean;
  selectedId: string;
  onSelect: (craftsman: Craftsman) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'all' | 'verified' | 'pending' | 'suspended';
  onTabChange: (tab: 'all' | 'verified' | 'pending' | 'suspended') => void;
  tabCounts: {
    all: number;
    verified: number;
    pending: number;
    suspended: number;
  };
}

export const CraftsmenTable: React.FC<CraftsmenTableProps> = ({
  craftsmen,
  loading = false,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  tabCounts,
}) => {
  const columns = getCraftsmenColumns(onSelect);

  const tabs = [
    { value: 'all', label: 'All', count: tabCounts.all },
    { value: 'verified', label: 'Verified', count: tabCounts.verified },
    { value: 'pending', label: 'Pending', count: tabCounts.pending },
    { value: 'suspended', label: 'Low trust', count: tabCounts.suspended, tone: 'danger' as const },
  ];

  const renderMobileRow = (c: Craftsman) => {
    const presence =
      c.status === 'suspended'
        ? 'flagged'
        : c.isAvailable
        ? 'online'
        : 'offline';

    const isVerified =
      c.verifications?.nationalId ||
      (c.verifications?.selfieMatch && c.verifications?.bankIban);

    const isSelected = c.id === selectedId;

    return (
      <div
        key={c.id}
        onClick={() => onSelect(c)}
        style={{
          padding: 'var(--sp-3)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-2)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <Avatar src={c.avatarUrl} name={c.name} size={32} presence={presence} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--fs-caption)', color: 'var(--text-primary)' }}>
                  {c.name}
                </span>
                {isVerified && <VerifiedMark size={14} />}
              </div>
              <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>{c.trade}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Star size={12} fill="var(--text-primary)" stroke="none" />
              <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600 }}>
                {Number(c.rating || 5.0).toFixed(1)}
              </span>
            </div>
            <ScoreChip score={Math.round(Number(c.trustScore ?? 0.85) * 100)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
          <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>
            {c.jobsCount || 0} jobs completed
          </span>
          <StatusPill
            variant={c.status === 'suspended' ? 'danger' : c.isAvailable ? 'success' : 'neutral'}
            label={c.status === 'suspended' ? 'Suspended' : c.isAvailable ? 'Online' : 'Offline'}
            dot={c.isAvailable && c.status !== 'suspended'}
          />
        </div>
      </div>
    );
  };

  return (
    <Card
      padding="none"
      className="craftsmen-table-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Controls Header */}
      <div
        style={{
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <Segmented
            value={activeTab}
            onChange={(val) => onTabChange(val as any)}
            items={tabs}
          />
          <div style={{ width: '100%', maxWidth: 300 }}>
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by name, trade, or ID…"
            />
          </div>
        </div>
      </div>

      {/* Table view */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DataTable
          columns={columns}
          rows={craftsmen}
          rowKey={(c) => c.id}
          selectedKey={selectedId}
          onRowClick={onSelect}
          loading={loading}
          mobile={renderMobileRow}
          empty={
            <EmptyState
              icon={<Users size={32} />}
              title="No craftsmen found"
              description="Try adjusting your search criteria or switching between the status tabs above."
            />
          }
        />
      </div>
    </Card>
  );
};

export default CraftsmenTable;
