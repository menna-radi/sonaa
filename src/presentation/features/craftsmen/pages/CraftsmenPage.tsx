import React, { useState } from 'react';
import { useCraftsmen, type Craftsman } from '../hooks/useCraftsmen';
import { PageHeader, Button, Drawer, AlertBanner, useBreakpoint } from '../../../components/ui';
import { CraftsmenTable } from '../components/CraftsmenTable';
import { CraftsmanDetailPanel } from '../components/CraftsmanDetailPanel';
import { Download, SlidersHorizontal, AlertTriangle } from 'lucide-react';

export const CraftsmenPage: React.FC = () => {
  const {
    craftsmen,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    selectedCraftsman,
    tabCounts,
    suspendCraftsman,
    unsuspendCraftsman,
    banCraftsman,
    approveVerification,
  } = useCraftsmen();

  const { isMobile, isTablet } = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelect = (c: Craftsman) => {
    setSelectedId(c.id);
    if (isMobile || isTablet) {
      setDrawerOpen(true);
    }
  };

  const handleExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Name,Trade,Rating,Jobs,TrustScore,Status\n';
    craftsmen.forEach((c) => {
      csvContent += `"${c.name}","${c.trade}","${c.rating}","${c.jobsCount}","${c.trustScore}","${c.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_craftsmen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="craftsmen-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        width: '100%',
        minHeight: '100%',
      }}
    >
      <PageHeader
        title="Craftsmen Management"
        subtitle={`${tabCounts.all} craftsmen registered`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<SlidersHorizontal size={14} />}
              onClick={() => {}}
            >
              Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeading={<Download size={14} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        }
      />

      {error && (
        <AlertBanner
          title="Craftsmen Data Error"
          body={error.message}
          icon={<AlertTriangle size={18} />}
        />
      )}

      {/* Main 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 400px',
          gap: 'var(--sp-4)',
          alignItems: 'start',
          flex: 1,
        }}
      >
        <div style={{ minWidth: 0, height: isMobile || isTablet ? 'auto' : 'calc(100vh - 180px)' }}>
          <CraftsmenTable
            craftsmen={craftsmen}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabCounts={tabCounts}
          />
        </div>

        {/* Desktop Sticky Detail Panel */}
        {!isMobile && !isTablet && (
          <div
            style={{
              position: 'sticky',
              top: 'var(--sp-4)',
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
            }}
          >
            <CraftsmanDetailPanel
              craftsman={selectedCraftsman}
              onSuspend={suspendCraftsman}
              onUnsuspend={unsuspendCraftsman}
              onBan={banCraftsman}
              onToggleVerification={approveVerification}
            />
          </div>
        )}
      </div>

      {/* Tablet & Mobile Detail Drawer */}
      {(isMobile || isTablet) && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={selectedCraftsman ? selectedCraftsman.name : 'Craftsman Details'}
          showBackOnMobile
          width={isMobile ? '100%' : 440}
        >
          <CraftsmanDetailPanel
            craftsman={selectedCraftsman}
            onSuspend={suspendCraftsman}
            onUnsuspend={unsuspendCraftsman}
            onBan={banCraftsman}
            onToggleVerification={approveVerification}
          />
        </Drawer>
      )}
    </div>
  );
};

export default CraftsmenPage;
