import React from 'react';
import { Skeleton } from './Skeleton';
import { useBreakpoint } from './useBreakpoint';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'start' | 'center' | 'end';
  width?: string | number;
  hideOnTablet?: boolean;
}

export type ColumnDef<T> = Column<T>;

export interface DataTablePagination {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  selectedKey?: string | number | null;
  onRowClick?: (row: T) => void;
  rowTone?: (row: T) => 'alert' | undefined;
  loading?: boolean;
  empty?: React.ReactNode;
  pagination?: DataTablePagination;
  mobile?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectedKey,
  onRowClick,
  rowTone,
  loading = false,
  empty,
  pagination,
  mobile,
  className = '',
}: DataTableProps<T>): React.ReactElement {
  const { isMobile, isTablet } = useBreakpoint();

  // Mobile card view if provided
  if (isMobile && mobile) {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton.Card key={i} height={96} />
          ))}
        </div>
      );
    }

    if (rows.length === 0 && empty) {
      return <>{empty}</>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className={className}>
        {rows.map((row, index) => (
          <div
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {mobile(row, index)}
          </div>
        ))}
        {pagination && pagination.totalPages > 1 && (
          <div className="ui-table-pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                icon={<ChevronLeft size={16} className="ui-icon--directional" />}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                iconEnd={<ChevronRight size={16} className="ui-icon--directional" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Filter columns for tablet
  const visibleColumns = columns.filter((col) => !isTablet || !col.hideOnTablet);

  return (
    <div className={`ui-table-container ${className}`}>
      <table className="ui-table">
        <thead>
          <tr>
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align || 'start',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 8 }).map((_, rIdx) => (
              <tr key={rIdx}>
                {visibleColumns.map((col, cIdx) => (
                  <td key={cIdx}>
                    <Skeleton height={16} width={cIdx === 0 ? '70%' : '50%'} />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} style={{ padding: 0 }}>
                {empty || (
                  <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No records found
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, rIdx) => {
              const key = rowKey(row);
              const isSelected = selectedKey != null && selectedKey === key;
              const tone = rowTone?.(row);

              const rowClasses = [
                isSelected ? 'ui-table-row--selected' : '',
                tone === 'alert' ? 'ui-table-row--alert' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={key}
                  className={rowClasses}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {visibleColumns.map((col) => {
                    const content = col.render
                      ? col.render(row, rIdx)
                      : (row as Record<string, any>)[col.key];

                    return (
                      <td
                        key={col.key}
                        style={{
                          textAlign: col.align || 'start',
                          fontVariantNumeric: col.align === 'end' ? 'tabular-nums' : undefined,
                        }}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="ui-table-pagination">
          <span>
            {pagination.totalItems != null && pagination.pageSize != null ? (
              <>
                {(pagination.page - 1) * pagination.pageSize + 1}–
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems}
              </>
            ) : (
              <>
                Page {pagination.page} of {pagination.totalPages}
              </>
            )}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              icon={<ChevronLeft size={16} className="ui-icon--directional" />}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              iconEnd={<ChevronRight size={16} className="ui-icon--directional" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
