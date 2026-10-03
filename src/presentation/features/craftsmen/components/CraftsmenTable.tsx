import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, DataTable, EmptyState, ErrorState } from '../../../components/ui';
import type { Craftsman } from '../hooks/useCraftsmen';
import type { CraftsmenCounts, CraftsmanStatusFilter } from '../../../../domain/repositories/CraftsmanRepository';
import { getCraftsmenColumns, CraftsmanMobileCard } from './columns';
import { CRAFTSMEN_PAGE_SIZE } from '../hooks/useCraftsmen';
import { Users } from 'lucide-react';

interface CraftsmenTableProps {
  rows: Craftsman[];
  total: number;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  onPageChange: (page: number) => void;
  selectedId: string;
  onSelect: (craftsman: Craftsman) => void;
}

export const CraftsmenTable: React.FC<CraftsmenTableProps> = ({
  rows,
  total,
  loading,
  error,
  onRetry,
  page,
  onPageChange,
  selectedId,
  onSelect,
}) => {
  const { t, language } = useLanguage();
  const columns = getCraftsmenColumns(t, language);
  const totalPages = Math.max(1, Math.ceil(total / CRAFTSMEN_PAGE_SIZE));

  return (
    <Card padding="none">
      {error ? (
        <ErrorState title={t('status_error_title')} message={error.message} onRetry={onRetry} retryLabel={t('btn_retry')} />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          selectedKey={selectedId}
          onRowClick={onSelect}
          loading={loading}
          empty={<EmptyState icon={<Users size={20} />} title={t('empty_craftsmen')} />}
            pagination={{ page, totalPages, totalItems: total, pageSize: CRAFTSMEN_PAGE_SIZE, onPageChange }}
          mobile={(c: Craftsman) => (
            <CraftsmanMobileCard craftsman={c} selected={c.id === selectedId} onSelect={onSelect} t={t} />
          )}
        />
      )}
    </Card>
  );
};

export type { CraftsmenCounts, CraftsmanStatusFilter };
export default CraftsmenTable;
