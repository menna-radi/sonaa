import React, { useState } from 'react';
import { Segmented } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import type { CommissionPayment } from '../../../../domain/entities/Billing';
import { useCommissionLedger } from '../hooks/useBilling';
import { CommissionPaymentsTable } from './CommissionPaymentsTable';
import { CommissionPaymentDrawer } from './CommissionPaymentDrawer';
import { LedgerTable } from './LedgerTable';

type InnerSegment = 'receipts' | 'ledger';

function readInitialSearch(): string {
  try {
    const v = sessionStorage.getItem('billing_search');
    if (v) {
      sessionStorage.removeItem('billing_search');
      return v;
    }
  } catch {
    // storage unavailable — fall through to empty search
  }
  return '';
}

export const CommissionTab: React.FC = () => {
  const { t } = useLanguage();
  const [segment, setSegment] = useState<InnerSegment>('receipts');
  const [selected, setSelected] = useState<CommissionPayment | null>(null);
  const [initialSearch] = useState(readInitialSearch);

  // Capability probe: null ⇒ backend has no ledger endpoint → hide the tab.
  const ledgerProbe = useCommissionLedger({ status: 'ALL', page: 1, limit: 1 });
  const ledgerSupported = ledgerProbe.data !== null;

  return (
    <div className="ui-stack">
      <div>
        <Segmented
          value={segment}
          onChange={(v) => setSegment(v as InnerSegment)}
          items={[
            { value: 'receipts', label: t('commission_seg_receipts') },
            ...(ledgerSupported ? [{ value: 'ledger' as const, label: t('commission_seg_ledger') }] : []),
          ]}
        />
      </div>
      {segment === 'receipts' || !ledgerSupported ? (
        <CommissionPaymentsTable initialSearch={initialSearch} onDetails={setSelected} />
      ) : (
        <LedgerTable />
      )}
      <CommissionPaymentDrawer
        payment={selected}
        ledgerSupported={ledgerSupported}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default CommissionTab;
