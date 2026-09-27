import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Award,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { formatMoney } from '../../../../core/utils/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { KpiCard } from '../../../components/ui/KpiCard';
import { SearchInput } from '../../../components/ui/SearchInput';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Avatar } from '../../../components/ui/Avatar';
import { Modal } from '../../../components/ui/Modal';
import { TextField, Select } from '../../../components/ui/FormFields';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { PromotionPackage, PromotionFeature } from '../types';
import { PromotionPackageCards } from '../components/PromotionPackageCards';
import { PromotionFeaturesCard } from '../components/PromotionFeaturesCard';

interface CraftsmanPromotion {
  id: string;
  name: string;
  avatarInitials: string;
  category: string;
  city: string;
  packageName: 'Basic' | 'Featured' | 'Premium';
  daysLeft: number;
  views: number;
  clicks: number;
  conversionRate: number;
}

export const PromotionsPage: React.FC = () => {
  const { isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;
  const confirm = useConfirm();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Global Features Switches
  const [globalFeatures, setGlobalFeatures] = useState<PromotionFeature[]>([
    {
      id: 'sponsored_listings',
      name: 'Sponsored Listings',
      description: 'Paid placement in search and category results.',
      activeCount: 342,
      enabled: true,
    },
    {
      id: 'featured_badge',
      name: 'Featured Profile Badge',
      description: 'Premium badge displayed on craftsman profile.',
      activeCount: 128,
      enabled: true,
    },
    {
      id: 'priority_placement',
      name: 'Priority Search Placement',
      description: 'Higher ranking in search results.',
      activeCount: 218,
      enabled: true,
    },
    {
      id: 'category_boost',
      name: 'Category Boost',
      description: 'Boost visibility in specific categories.',
      activeCount: 156,
      enabled: true,
    },
    {
      id: 'location_boost',
      name: 'Location Boost',
      description: 'Boost visibility in selected cities.',
      activeCount: 92,
      enabled: true,
    },
  ]);

  // Packages State
  const [packages, setPackages] = useState<PromotionPackage[]>([
    {
      id: 'Basic',
      name: 'Basic',
      price: 199,
      durationDays: 7,
      reachText: '~12K',
      visibilityBoost: '+18% search visibility',
      features: ['Search priority bump', 'Standard listing boost', 'Basic analytics', 'Email support'],
      activeCount: 184,
    },
    {
      id: 'Featured',
      name: 'Featured',
      price: 499,
      durationDays: 30,
      reachText: '~58K',
      visibilityBoost: '+48% search visibility',
      features: [
        'Everything in Basic',
        'Featured profile badge',
        'Top of search results',
        'Category boost (1 category)',
        'Priority support',
      ],
      activeCount: 94,
      mostPopular: true,
    },
    {
      id: 'Premium',
      name: 'Premium',
      price: 1499,
      durationDays: 90,
      reachText: '~210K',
      visibilityBoost: '+128% search visibility',
      features: [
        'Everything in Featured',
        'Location boost (multi-city)',
        'Homepage rotation slot',
        'Category boost (all)',
        'Dedicated account manager',
        'Advanced analytics dashboard',
      ],
      activeCount: 64,
    },
  ]);

  // Sponsored Craftsmen State
  const [sponsoredCraftsmen, setSponsoredCraftsmen] = useState<CraftsmanPromotion[]>([
    {
      id: '1',
      name: 'Ahmad Al-Dawsari',
      avatarInitials: 'AD',
      category: 'Electrician',
      city: 'Jerusalem',
      packageName: 'Premium',
      daysLeft: 62,
      views: 8420,
      clicks: 342,
      conversionRate: 6.2,
    },
    {
      id: '2',
      name: 'Mohammed Al-Zahrani',
      avatarInitials: 'MZ',
      category: 'Plumber',
      city: 'Ramallah',
      packageName: 'Featured',
      daysLeft: 18,
      views: 4128,
      clicks: 218,
      conversionRate: 5.8,
    },
    {
      id: '3',
      name: 'Saif Al-Otaibi',
      avatarInitials: 'SO',
      category: 'AC Repair',
      city: 'Bethlehem',
      packageName: 'Featured',
      daysLeft: 24,
      views: 5612,
      clicks: 298,
      conversionRate: 7.1,
    },
    {
      id: '4',
      name: 'Bandar Al-Qahtani',
      avatarInitials: 'BQ',
      category: 'Carpenter',
      city: 'Jerusalem',
      packageName: 'Basic',
      daysLeft: 4,
      views: 1820,
      clicks: 94,
      conversionRate: 4.4,
    },
    {
      id: '5',
      name: 'Hassan Al-Harbi',
      avatarInitials: 'HH',
      category: 'Painter',
      city: 'Hebron',
      packageName: 'Premium',
      daysLeft: 74,
      views: 9240,
      clicks: 412,
      conversionRate: 6.8,
    },
    {
      id: '6',
      name: 'Yousef Al-Maliki',
      avatarInitials: 'YM',
      category: 'Cleaner',
      city: 'Jerusalem',
      packageName: 'Featured',
      daysLeft: 12,
      views: 3520,
      clicks: 184,
      conversionRate: 5.2,
    },
    {
      id: '7',
      name: 'Khalid Al-Ghamdi',
      avatarInitials: 'KG',
      category: 'Mover',
      city: 'Nablus',
      packageName: 'Basic',
      daysLeft: 2,
      views: 980,
      clicks: 52,
      conversionRate: 3.8,
    },
  ]);

  const stats = useMemo(() => {
    const activeCount = sponsoredCraftsmen.length;
    const featuredCount = sponsoredCraftsmen.filter(
      (c) => c.packageName === 'Featured' || c.packageName === 'Premium'
    ).length;
    const boostRevenue = sponsoredCraftsmen.reduce((sum, c) => {
      const pkg = packages.find((p) => p.name === c.packageName);
      return sum + (pkg ? pkg.price : 499);
    }, 0);
    const avgLift =
      sponsoredCraftsmen.length > 0
        ? Math.round(
            sponsoredCraftsmen.reduce((sum, c) => sum + (c.conversionRate || 5.0) * 10, 0) /
              sponsoredCraftsmen.length
          )
        : 0;

    return {
      activeSponsorships: activeCount,
      featuredProfiles: featuredCount,
      boostRevenueMtd: boostRevenue,
      avgBoostLift: avgLift,
    };
  }, [sponsoredCraftsmen, packages]);

  // Modals state
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null);
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newPackageReach, setNewPackageReach] = useState('');
  const [newPackageBoost, setNewPackageBoost] = useState('');

  const [isNewPromoOpen, setIsNewPromoOpen] = useState(false);
  const [newCraftsmanName, setNewCraftsmanName] = useState('');
  const [newCraftsmanCat, setNewCraftsmanCat] = useState('Electrician');
  const [newCraftsmanCity, setNewCraftsmanCity] = useState('Jerusalem');
  const [newCraftsmanPack, setNewCraftsmanPack] = useState<'Basic' | 'Featured' | 'Premium'>('Basic');

  const handleToggleFeature = (id: string) => {
    setGlobalFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
    success('Feature switch updated');
  };

  const handleOpenEditPackage = (pkg: PromotionPackage) => {
    setEditingPackage(pkg);
    setNewPackagePrice(String(pkg.price));
    setNewPackageReach(pkg.reachText);
    setNewPackageBoost(pkg.visibilityBoost);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    const numPrice = parseFloat(newPackagePrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      toastError('Please enter a valid price');
      return;
    }

    setPackages((prev) =>
      prev.map((p) =>
        p.id === editingPackage.id
          ? {
              ...p,
              price: numPrice,
              reachText: newPackageReach,
              visibilityBoost: newPackageBoost,
            }
          : p
      )
    );
    success(`Updated ${editingPackage.name} package successfully`);
    setEditingPackage(null);
  };

  const handleCreateSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCraftsmanName.trim()) {
      toastError('Craftsman name is required');
      return;
    }

    const initials = newCraftsmanName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newPromo: CraftsmanPromotion = {
      id: String(Date.now()),
      name: newCraftsmanName.trim(),
      avatarInitials: initials,
      category: newCraftsmanCat,
      city: newCraftsmanCity,
      packageName: newCraftsmanPack,
      daysLeft: newCraftsmanPack === 'Basic' ? 7 : newCraftsmanPack === 'Featured' ? 30 : 90,
      views: 0,
      clicks: 0,
      conversionRate: 0,
    };

    setSponsoredCraftsmen((prev) => [newPromo, ...prev]);
    success('Craftsman sponsorship launched successfully');
    setNewCraftsmanName('');
    setIsNewPromoOpen(false);
  };

  const handleDeletePromotion = async (promo: CraftsmanPromotion) => {
    const ok = await confirm({
      title: 'Remove Sponsorship',
      body: `Are you sure you want to cancel the sponsorship for ${promo.name}?`,
      confirmLabel: 'Cancel Sponsorship',
      tone: 'danger',
    });
    if (!ok) return;

    setSponsoredCraftsmen((prev) => prev.filter((p) => p.id !== promo.id));
    success('Sponsorship cancelled successfully');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Craftsman', 'Category', 'City', 'Package', 'Days Left', 'Views', 'Clicks', 'Conv Rate'];
    const rows = sponsoredCraftsmen.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.category,
      c.city,
      c.packageName,
      c.daysLeft,
      c.views,
      c.clicks,
      `${c.conversionRate}%`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sponsored_craftsmen_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCraftsmen = useMemo(() => {
    if (!searchQuery.trim()) return sponsoredCraftsmen;
    const q = searchQuery.toLowerCase();
    return sponsoredCraftsmen.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.packageName.toLowerCase().includes(q)
    );
  }, [sponsoredCraftsmen, searchQuery]);

  const getPackageVariant = (pkg: string) => {
    switch (pkg) {
      case 'Premium':
        return 'warning';
      case 'Featured':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const columns: Column<CraftsmanPromotion>[] = [
    {
      key: 'craftsman',
      header: 'Craftsman',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <Avatar name={c.name} size={32} />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {c.name}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (c) => (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {c.category}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (c) => (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {c.city}
        </span>
      ),
    },
    {
      key: 'package',
      header: 'Package',
      render: (c) => (
        <StatusPill variant={getPackageVariant(c.packageName)} label={c.packageName} />
      ),
    },
    {
      key: 'daysLeft',
      header: 'Days Left',
      align: 'end',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          {c.daysLeft}d
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      align: 'end',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {c.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'clicks',
      header: 'Clicks',
      align: 'end',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {c.clicks.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'end',
      render: (c) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          {c.conversionRate}%
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      width: 60,
      render: (c) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeletePromotion(c)}
          title="Remove Sponsorship"
        >
          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
      <PageHeader
        title={isRtl ? 'ترقيات وباقات الصناع' : 'Craftsman Promotions & Badges'}
        subtitle={
          isRtl
            ? 'إدارة الباقات الترويجية، الشارات المميزة، والرعايات المدفوعة للمهنيين'
            : 'Manage sponsored listings, profile badges, search boosts and promotion packages'
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} />
              <span>Export</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsNewPromoOpen(true)}>
              <Plus size={14} />
              <span>New Sponsorship</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--sp-4)',
          width: '100%',
        }}
      >
        <KpiCard
          icon={<Award size={16} />}
          label="Active Sponsorships"
          value={stats.activeSponsorships}
          caption="Current sponsored pros"
        />
        <KpiCard
          icon={<ShieldCheck size={16} />}
          label="Featured Profiles"
          value={stats.featuredProfiles}
          caption="Priority search profiles"
        />
        <KpiCard
          icon={<Zap size={16} />}
          label="Boost Revenue MTD"
          value={formatMoney(stats.boostRevenueMtd, 'ILS')}
          caption="Direct monetization"
        />
        <KpiCard
          icon={<Star size={16} />}
          label="Avg Boost Lift"
          value={`+${stats.avgBoostLift}%`}
          caption="Conversion increase"
        />
      </div>

      {/* Promotion Package Cards */}
      <PromotionPackageCards packages={packages} onEditPackage={handleOpenEditPackage} />

      {/* Global Feature Switches */}
      <PromotionFeaturesCard features={globalFeatures} onToggle={handleToggleFeature} />

      {/* Active Sponsored Craftsmen Table Card */}
      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--sp-2)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Active Sponsored Craftsmen
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Currently boosted technician profiles across search and categories
            </span>
          </div>

          <div style={{ width: '260px' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search craftsmen..."
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filteredCraftsmen}
          rowKey={(c) => c.id}
          loading={loading}
          empty={
            <EmptyState
              title="No sponsored craftsmen"
              description="Craftsmen with active promotions will appear here."
              action={
                <Button variant="primary" size="sm" onClick={() => setIsNewPromoOpen(true)}>
                  <Plus size={14} />
                  <span>New Sponsorship</span>
                </Button>
              }
            />
          }
          mobile={(c) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                padding: 'var(--sp-3)',
                background: 'var(--surface-base)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Avatar name={c.name} size={32} />
                  <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{c.name}</span>
                </div>
                <StatusPill variant={getPackageVariant(c.packageName)} label={c.packageName} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                <span>{c.category} &bull; {c.city}</span>
                <span>{c.daysLeft}d left</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-1)' }}>
                <Button variant="danger" size="sm" onClick={() => handleDeletePromotion(c)}>
                  Remove
                </Button>
              </div>
            </div>
          )}
        />
      </Card>

      {/* Edit Package Modal */}
      <Modal
        isOpen={Boolean(editingPackage)}
        onClose={() => setEditingPackage(null)}
        title={editingPackage ? `Edit ${editingPackage.name} Package` : 'Edit Package'}
      >
        <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <TextField
            label="Package Price (ILS)"
            type="number"
            value={newPackagePrice}
            onChange={(e) => setNewPackagePrice(e.target.value)}
            required
            min={1}
          />
          <TextField
            label="Estimated Reach"
            value={newPackageReach}
            onChange={(e) => setNewPackageReach(e.target.value)}
            placeholder="e.g. ~58K"
            required
          />
          <TextField
            label="Visibility Boost Text"
            value={newPackageBoost}
            onChange={(e) => setNewPackageBoost(e.target.value)}
            placeholder="e.g. +48% search visibility"
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <Button variant="outline" type="button" onClick={() => setEditingPackage(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Sponsorship Modal */}
      <Modal
        isOpen={isNewPromoOpen}
        onClose={() => setIsNewPromoOpen(false)}
        title="Launch Craftsman Sponsorship"
      >
        <form onSubmit={handleCreateSponsorship} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <TextField
            label="Craftsman Full Name"
            value={newCraftsmanName}
            onChange={(e) => setNewCraftsmanName(e.target.value)}
            placeholder="e.g. Tarek Al-Husseini"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)' }}>
            <Select
              label="Trade Category"
              value={newCraftsmanCat}
              onChange={(e) => setNewCraftsmanCat(e.target.value)}
              options={[
                { value: 'Electrician', label: 'Electrician' },
                { value: 'Plumber', label: 'Plumber' },
                { value: 'AC Repair', label: 'AC Repair' },
                { value: 'Carpenter', label: 'Carpenter' },
                { value: 'Painter', label: 'Painter' },
                { value: 'Cleaner', label: 'Cleaner' },
              ]}
            />
            <Select
              label="City"
              value={newCraftsmanCity}
              onChange={(e) => setNewCraftsmanCity(e.target.value)}
              options={[
                { value: 'Jerusalem', label: 'Jerusalem (القدس)' },
                { value: 'Ramallah', label: 'Ramallah (رام الله)' },
                { value: 'Bethlehem', label: 'Bethlehem (بيت لحم)' },
                { value: 'Hebron', label: 'Hebron (الخليل)' },
                { value: 'Nablus', label: 'Nablus (نابلس)' },
              ]}
            />
          </div>
          <Select
            label="Promotion Package"
            value={newCraftsmanPack}
            onChange={(e) => setNewCraftsmanPack(e.target.value as 'Basic' | 'Featured' | 'Premium')}
            options={[
              { value: 'Basic', label: 'Basic (7 Days - 199 ₪)' },
              { value: 'Featured', label: 'Featured (30 Days - 499 ₪)' },
              { value: 'Premium', label: 'Premium (90 Days - 1,499 ₪)' },
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <Button variant="outline" type="button" onClick={() => setIsNewPromoOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Activate Sponsorship
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;
