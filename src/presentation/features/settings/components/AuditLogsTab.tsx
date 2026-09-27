import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, DataTable, Column, SearchInput, Button, StatusPill, useToast } from '../../../components/ui';
import { RefreshCw, Sliders } from 'lucide-react';

interface AuditLogRecord {
  id: string;
  time: string;
  admin: string;
  action: string;
  target: string;
  ip: string;
}

const INITIAL_LOGS: AuditLogRecord[] = [
  { id: '1', time: '2026-09-27 19:45:12', admin: 'admin@sonaa.com', action: 'TOGGLE_AUTO_VERIFICATION', target: 'AUTO_VERIFY_CRAFTSMEN', ip: '197.230.12.8' },
  { id: '2', time: '2026-09-27 18:30:05', admin: 'operations@sonaa.com', action: 'DISPATCH_BACKUP', target: 'Task #SN-2418', ip: '197.230.14.2' },
  { id: '3', time: '2026-09-27 17:10:44', admin: 'moderator@sonaa.com', action: 'SUSPEND_CRAFTSMAN', target: 'Craftsman #CR-4821', ip: '197.230.12.8' },
  { id: '4', time: '2026-09-27 16:02:19', admin: 'admin@sonaa.com', action: 'CREATE_CATEGORY', target: 'HVAC Maintenance', ip: '197.230.12.8' },
  { id: '5', time: '2026-09-27 15:20:00', admin: 'finance@sonaa.com', action: 'APPROVE_WITHDRAWAL', target: 'Payout #PO-9012 (450 ₪)', ip: '197.230.19.4' },
  { id: '6', time: '2026-09-27 14:15:30', admin: 'admin@sonaa.com', action: 'UPDATE_COMMISSION_RATE', target: 'Platform Fee (20.4%)', ip: '197.230.12.8' },
  { id: '7', time: '2026-09-27 12:05:11', admin: 'operations@sonaa.com', action: 'RESOLVE_DISPUTE', target: 'Dispute #DP-8910', ip: '197.230.14.2' },
];

export const AuditLogsTab: React.FC = () => {
  const { isRtl } = useLanguage();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<AuditLogRecord[]>(INITIAL_LOGS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase().trim();
    return logs.filter(
      (l) =>
        l.admin.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.ip.includes(q)
    );
  }, [logs, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      success(isRtl ? 'تم تحديث سجل التدقيق' : 'Audit logs refreshed.');
    }, 500);
  };

  const columns: Column<AuditLogRecord>[] = [
    {
      key: 'time',
      header: isRtl ? 'الوقت والتاريخ' : 'Timestamp',
      width: 170,
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {row.time}
        </span>
      ),
    },
    {
      key: 'admin',
      header: isRtl ? 'المشرف المسؤول' : 'Admin Actor',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
          {row.admin}
        </span>
      ),
    },
    {
      key: 'action',
      header: isRtl ? 'الإجراء الإداري' : 'Action Performed',
      render: (row) => {
        const isDanger = row.action.includes('SUSPEND') || row.action.includes('BAN');
        const isSuccess = row.action.includes('APPROVE') || row.action.includes('CREATE');
        return (
          <StatusPill
            variant={isDanger ? 'danger' : isSuccess ? 'success' : 'info'}
            label={row.action}
          />
        );
      },
    },
    {
      key: 'target',
      header: isRtl ? 'الكيان المتأثر' : 'Target Entity',
      render: (row) => (
        <span style={{ color: 'var(--on-surface-subtle)' }}>
          {row.target}
        </span>
      ),
    },
    {
      key: 'ip',
      header: isRtl ? 'عنوان IP' : 'IP Address',
      width: 130,
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {row.ip}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--sp-4)',
          gap: 'var(--sp-3)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
            {isRtl ? 'سجل التدقيق الإداري' : 'Administrative Audit Logs'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
            {isRtl
              ? 'تتبع وتوثيق جميع التغييرات والإجراءات الإدارية في منصة صُنّاع'
              : 'Immutable chronological trace of administrative actions across Sonaa.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div style={{ width: 220 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={isRtl ? 'بحث في السجل...' : 'Search logs...'}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw size={14} />}
          >
            {isRtl ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredLogs}
        rowKey={(row) => row.id}
      />
    </Card>
  );
};
