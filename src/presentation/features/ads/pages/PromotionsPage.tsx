import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import {
  Download,
  Search,
  Bell,
  TrendingUp,
  Plus,
  Edit2,
  Check,
  X,
  Megaphone,
  DollarSign,
  Award,
  ShieldCheck,
  Zap,
  Star,
  Crown
} from 'lucide-react';

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

interface PromotionPackage {
  id: 'Basic' | 'Featured' | 'Premium';
  name: string;
  price: number;
  durationDays: number;
  reachText: string;
  visibilityBoost: string;
  features: string[];
  activeCount: number;
  mostPopular?: boolean;
}

interface PromotionFeature {
  id: string;
  name: string;
  description: string;
  activeCount: number;
  enabled: boolean;
}

export const PromotionsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stats Metrics State
  const [stats, setStats] = useState({
    activeSponsorships: 342,
    activeSponsorshipsTrend: '+18.4%',
    featuredProfiles: 128,
    featuredProfilesTrend: '+12.0%',
    boostRevenueMtd: 184000,
    boostRevenueMtdTrend: '+24.6%',
    avgBoostLift: 62,
    avgBoostLiftTrend: '+4pp'
  });

  // Global Features Toggles State
  const [globalFeatures, setGlobalFeatures] = useState<PromotionFeature[]>([
    {
      id: 'sponsored_listings',
      name: 'Sponsored Listings',
      description: 'Paid placement in search and category results.',
      activeCount: 342,
      enabled: true
    },
    {
      id: 'featured_badge',
      name: 'Featured Profile Badge',
      description: 'Premium badge displayed on craftsman profile.',
      activeCount: 128,
      enabled: true
    },
    {
      id: 'priority_placement',
      name: 'Priority Search Placement',
      description: 'Higher ranking in search results.',
      activeCount: 218,
      enabled: true
    },
    {
      id: 'category_boost',
      name: 'Category Boost',
      description: 'Boost visibility in specific categories.',
      activeCount: 156,
      enabled: true
    },
    {
      id: 'location_boost',
      name: 'Location Boost',
      description: 'Boost visibility in selected cities.',
      activeCount: 92,
      enabled: true
    }
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
      features: [
        'Search priority bump',
        'Standard listing boost',
        'Basic analytics',
        'Email support'
      ],
      activeCount: 184
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
        'Priority support'
      ],
      activeCount: 94,
      mostPopular: true
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
        'Advanced analytics dashboard'
      ],
      activeCount: 64
    }
  ]);

  // Sponsored Craftsmen State
  const [sponsoredCraftsmen, setSponsoredCraftsmen] = useState<CraftsmanPromotion[]>([
    {
      id: '1',
      name: 'Ahmad Al-Dawsari',
      avatarInitials: 'AD',
      category: 'Electrician',
      city: 'Riyadh',
      packageName: 'Premium',
      daysLeft: 62,
      views: 8420,
      clicks: 342,
      conversionRate: 6.2
    },
    {
      id: '2',
      name: 'Mohammed Al-Zahrani',
      avatarInitials: 'MZ',
      category: 'Plumber',
      city: 'Jeddah',
      packageName: 'Featured',
      daysLeft: 18,
      views: 4128,
      clicks: 218,
      conversionRate: 5.8
    },
    {
      id: '3',
      name: 'Saif Al-Otaibi',
      avatarInitials: 'SO',
      category: 'AC Repair',
      city: 'Dammam',
      packageName: 'Featured',
      daysLeft: 24,
      views: 5612,
      clicks: 298,
      conversionRate: 7.1
    },
    {
      id: '4',
      name: 'Bandar Al-Qahtani',
      avatarInitials: 'BQ',
      category: 'Carpenter',
      city: 'Riyadh',
      packageName: 'Basic',
      daysLeft: 4,
      views: 1820,
      clicks: 94,
      conversionRate: 4.4
    },
    {
      id: '5',
      name: 'Hassan Al-Harbi',
      avatarInitials: 'HH',
      category: 'Painter',
      city: 'Makkah',
      packageName: 'Premium',
      daysLeft: 74,
      views: 9240,
      clicks: 412,
      conversionRate: 6.8
    },
    {
      id: '6',
      name: 'Yousef Al-Maliki',
      avatarInitials: 'YM',
      category: 'Cleaner',
      city: 'Riyadh',
      packageName: 'Featured',
      daysLeft: 12,
      views: 3520,
      clicks: 184,
      conversionRate: 5.2
    },
    {
      id: '7',
      name: 'Khalid Al-Ghamdi',
      avatarInitials: 'KG',
      category: 'Mover',
      city: 'Jeddah',
      packageName: 'Basic',
      daysLeft: 2,
      views: 980,
      clicks: 52,
      conversionRate: 3.8
    }
  ]);

  // Edit Package Modal State
  const [editingPackage, setEditingPackage] = useState<PromotionPackage | null>(null);
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newPackageReach, setNewPackageReach] = useState('');
  const [newPackageBoost, setNewPackageBoost] = useState('');

  // New Promotion Modal State
  const [isNewPromoOpen, setIsNewPromoOpen] = useState(false);
  const [newCraftsmanName, setNewCraftsmanName] = useState('');
  const [newCraftsmanCat, setNewCraftsmanCat] = useState('Electrician');
  const [newCraftsmanCity, setNewCraftsmanCity] = useState('Riyadh');
  const [newCraftsmanPack, setNewCraftsmanPack] = useState<'Basic' | 'Featured' | 'Premium'>('Basic');
  const [newCraftsmanDays, setNewCraftsmanDays] = useState('30');

  // Show dynamic toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Toggle Features State
  const handleToggleFeature = (featureId: string) => {
    const updatedFeatures = globalFeatures.map(feature => {
      if (feature.id === featureId) {
        const nextState = !feature.enabled;
        showToast(
          isRtl 
            ? `تم ${nextState ? 'تفعيل' : 'تعطيل'} ميزة "${feature.name}" بنجاح.` 
            : `Feature "${feature.name}" successfully ${nextState ? 'enabled' : 'disabled'}.`
        );
        
        // Dynamically adjust statistics based on toggle state
        if (featureId === 'sponsored_listings') {
          setStats(prev => ({
            ...prev,
            activeSponsorships: nextState ? prev.activeSponsorships + 342 : prev.activeSponsorships - 342
          }));
        } else if (featureId === 'featured_badge') {
          setStats(prev => ({
            ...prev,
            featuredProfiles: nextState ? prev.featuredProfiles + 128 : prev.featuredProfiles - 128
          }));
        }
        
        return { ...feature, enabled: nextState };
      }
      return feature;
    });
    setGlobalFeatures(updatedFeatures);
  };

  // Edit Package action trigger
  const handleOpenEditPackage = (pkg: PromotionPackage) => {
    setEditingPackage(pkg);
    setNewPackagePrice(pkg.price.toString());
    setNewPackageReach(pkg.reachText);
    setNewPackageBoost(pkg.visibilityBoost);
  };

  // Save Package changes
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    const priceNum = parseFloat(newPackagePrice) || 0;
    
    setPackages(packages.map(p => 
      p.id === editingPackage.id 
        ? { ...p, price: priceNum, reachText: newPackageReach, visibilityBoost: newPackageBoost }
        : p
    ));

    showToast(
      isRtl
        ? `تم تحديث أسعار ومميزات باقة "${editingPackage.name}" بنجاح.`
        : `Package "${editingPackage.name}" tiers successfully updated.`
    );
    
    // Update boost revenue stats if Premium or Featured is edited
    if (editingPackage.id === 'Premium') {
      setStats(prev => ({ ...prev, boostRevenueMtd: prev.boostRevenueMtd + 15000 }));
    }

    setEditingPackage(null);
  };

  // Create New Promotion listing
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCraftsmanName.trim()) return;

    const initials = newCraftsmanName.trim()
      .split(' ')
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');

    const newPromo: CraftsmanPromotion = {
      id: (sponsoredCraftsmen.length + 1).toString(),
      name: newCraftsmanName,
      avatarInitials: initials || 'CM',
      category: newCraftsmanCat,
      city: newCraftsmanCity,
      packageName: newCraftsmanPack,
      daysLeft: parseInt(newCraftsmanDays) || 30,
      views: 0,
      clicks: 0,
      conversionRate: 0.0
    };

    setSponsoredCraftsmen([newPromo, ...sponsoredCraftsmen]);
    
    // Increment active count in package and metrics stats
    setPackages(packages.map(p => p.id === newCraftsmanPack ? { ...p, activeCount: p.activeCount + 1 } : p));
    setStats(prev => ({
      ...prev,
      activeSponsorships: prev.activeSponsorships + 1,
      boostRevenueMtd: prev.boostRevenueMtd + (newCraftsmanPack === 'Premium' ? 1499 : newCraftsmanPack === 'Featured' ? 499 : 199)
    }));

    showToast(
      isRtl
        ? `تم إضافة الحرفي "${newCraftsmanName}" ممولاً بنجاح.`
        : `Craftsman "${newCraftsmanName}" successfully added to sponsorship.`
    );

    // Reset Form
    setNewCraftsmanName('');
    setIsNewPromoOpen(false);
  };

  // Delete/Cancel promotion listing
  const handleDeletePromotion = (id: string) => {
    const item = sponsoredCraftsmen.find(c => c.id === id);
    if (!item) return;

    setSponsoredCraftsmen(sponsoredCraftsmen.filter(c => c.id !== id));
    
    // Decrement stats
    setPackages(packages.map(p => p.id === item.packageName ? { ...p, activeCount: Math.max(0, p.activeCount - 1) } : p));
    setStats(prev => ({
      ...prev,
      activeSponsorships: Math.max(0, prev.activeSponsorships - 1)
    }));

    showToast(
      isRtl
        ? `تم إلغاء ترويج الحرفي "${item.name}".`
        : `Sponsorship cancelled for craftsman "${item.name}".`
    );
  };

  // Export listings button
  const handleExportData = () => {
    // Generate simple mock CSV export
    const headers = 'ID,Name,Category,City,Package,Days Left,Views,Clicks,ConversionRate\n';
    const rows = sponsoredCraftsmen.map(c => 
      `${c.id},"${c.name}","${c.category}","${c.city}",${c.packageName},${c.daysLeft},${c.views},${c.clicks},${c.conversionRate}%`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'craftsman_promotions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      isRtl 
        ? 'تم تصدير البيانات إلى ملف CSV بنجاح.' 
        : 'Data successfully exported to CSV.'
    );
  };

  // Filter list by search query
  const filteredCraftsmen = useMemo(() => {
    return sponsoredCraftsmen.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.packageName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sponsoredCraftsmen, searchQuery]);

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="custom-toast-notification">
            <ShieldCheck size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Mobile Header (standard Sonaa mobile template) */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-logo-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'start',
                fontFamily: 'inherit'
              }}
            >
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text">
                <strong>Sonaa</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader */}
        <div className="mobile-subheader mobile-only">
          <h2>{t('promotions_title') || 'Craftsman Promotions'}</h2>
          <span>{t('promotions_subtitle') || 'Manage sponsored listings, featured profiles and custom tiers'}</span>
        </div>

        {/* Desktop & Tablet Top Action Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ textAlign: 'start' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.7px' }}>
              {t('promotions_title') || 'Craftsman Promotions'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              {t('promotions_subtitle') || 'Manage sponsored listings, featured profiles and custom tiers'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Export CSV Data */}
            <button className="promotions-secondary-btn" onClick={handleExportData}>
              <Download size={14} />
              <span>{isRtl ? 'تصدير البيانات' : 'Export Data'}</span>
            </button>

            {/* New Promotion Trigger */}
            <button className="promotions-primary-btn" onClick={() => setIsNewPromoOpen(true)}>
              <Plus size={16} />
              <span>{t('promotions_new_promotion') || 'New Promotion'}</span>
            </button>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="promotions-page-body animate-fade-in">
          
          {/* Mobile Quick Action Float Buttons */}
          <div className="mobile-only mobile-action-row" style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '16px' }}>
            <button className="promotions-primary-btn" style={{ flex: 1 }} onClick={() => setIsNewPromoOpen(true)}>
              <Plus size={16} />
              <span>{t('promotions_new_promotion') || 'New Promotion'}</span>
            </button>
            <button className="promotions-secondary-btn" style={{ padding: '8px 12px' }} onClick={handleExportData}>
              <Download size={16} />
            </button>
          </div>

          {/* Grid Area 1: Stats Metric Cards */}
          <div className="metrics-grid">
            {/* Metric 1 */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <div className="icon-wrapper">
                  <Megaphone size={16} style={{ color: '#171717' }} />
                </div>
                <span className="trend-badge positive">{stats.activeSponsorshipsTrend}</span>
              </div>
              <span className="metric-label">{t('promotions_active_sponsorships') || 'Active Sponsorships'}</span>
              <span className="metric-value">{stats.activeSponsorships}</span>
            </div>

            {/* Metric 2 */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <div className="icon-wrapper">
                  <Award size={16} style={{ color: '#171717' }} />
                </div>
                <span className="trend-badge positive">{stats.featuredProfilesTrend}</span>
              </div>
              <span className="metric-label">{t('promotions_featured_profiles') || 'Featured Profiles'}</span>
              <span className="metric-value">{stats.featuredProfiles}</span>
            </div>

            {/* Metric 3 */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <div className="icon-wrapper">
                  <DollarSign size={16} style={{ color: '#171717' }} />
                </div>
                <span className="trend-badge positive">{stats.boostRevenueMtdTrend}</span>
              </div>
              <span className="metric-label">{t('promotions_boost_revenue_mtd') || 'Boost Revenue (MTD)'}</span>
              <span className="metric-value">
                {isRtl ? `ريال ${stats.boostRevenueMtd.toLocaleString()}` : `SAR ${(stats.boostRevenueMtd / 1000).toFixed(0)}K`}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="metric-card glass-card">
              <div className="metric-header">
                <div className="icon-wrapper">
                  <TrendingUp size={16} style={{ color: '#171717' }} />
                </div>
                <span className="trend-badge positive">{stats.avgBoostLiftTrend}</span>
              </div>
              <span className="metric-label">{t('promotions_avg_boost_lift') || 'Avg Boost Lift'}</span>
              <span className="metric-value">+{stats.avgBoostLift}%</span>
            </div>
          </div>

          {/* Grid Area 2: Promotion Packages Comparison */}
          <div className="section-container">
            <div className="section-header-block" style={{ textAlign: 'start' }}>
              <h2 className="section-title">{t('promotions_packages_title') || 'Promotion Packages'}</h2>
              <p className="section-subtitle">{t('promotions_packages_subtitle') || 'Subscription tiers available to craftsmen to boost their visibility.'}</p>
            </div>

            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className={`package-card ${pkg.id.toLowerCase()} ${pkg.mostPopular ? 'most-popular' : ''}`}>
                  {pkg.mostPopular && (
                    <div className="popular-badge-pill">
                      <span>{isRtl ? 'الأكثر شيوعاً' : 'Most Popular'}</span>
                    </div>
                  )}

                  <div className="package-card-header">
                    <div className="icon-wrapper">
                      {pkg.id === 'Basic' && <Zap size={16} />}
                      {pkg.id === 'Featured' && <Star size={16} />}
                      {pkg.id === 'Premium' && <Crown size={16} />}
                    </div>
                    <span className="package-active-badge">
                      {pkg.activeCount} {isRtl ? 'نشط' : 'active'}
                    </span>
                  </div>

                  <h3 className="package-tier-name">{pkg.name}</h3>

                  <div className="price-container">
                    <span className="price-value">SAR {pkg.price}</span>
                    <span className="price-duration">/ {pkg.durationDays} {isRtl ? 'أيام' : 'days'}</span>
                  </div>

                  {/* Highlights */}
                  <div className="highlights-row">
                    <div className="highlight-item">
                      <span className="hl-label">{isRtl ? 'الوصول' : 'Reach'}</span>
                      <span className="hl-value">{pkg.reachText}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="hl-label">{isRtl ? 'الأداء' : 'Performance'}</span>
                      <span className="hl-value highlight-green">{pkg.visibilityBoost}</span>
                    </div>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="package-features-list">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check size={14} className="check-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Edit Tier Action */}
                  <button className="package-edit-btn" onClick={() => handleOpenEditPackage(pkg)}>
                    <Edit2 size={13} />
                    <span>{t('promotions_edit_package') || 'Edit Package'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Area 3: Active Sponsored Craftsmen Table & Toggles Row */}
          <div className="layout-two-columns">
            {/* Table Column */}
            <div className="column-table glass-card" style={{ padding: 0 }}>
              <div className="table-header-block" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ textAlign: 'start' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      {t('promotions_active_sponsored_title') || 'Active Sponsored Craftsmen'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '13px' }}>
                      {t('promotions_active_sponsored_subtitle') || 'Currently boosted profiles across categories and cities.'}
                    </p>
                  </div>
                  
                  <button className="view-all-table-btn" style={{ fontSize: '13px', fontWeight: 600, color: '#171717', border: 'none', background: 'none', cursor: 'pointer' }}>
                    {t('promotions_view_all') || 'View all'}
                  </button>
                </div>

                {/* Table Search */}
                <div className="table-search-wrapper" style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('promotions_search_placeholder') || 'Search craftsmen, categories, packages...'}
                    style={{
                      width: '100%',
                      height: '36px',
                      paddingLeft: isRtl ? '12px' : '36px',
                      paddingRight: isRtl ? '36px' : '12px',
                      boxSizing: 'border-box',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#FAFAFA'
                    }}
                  />
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: isRtl ? 'auto' : '12px',
                      right: isRtl ? '12px' : 'auto',
                      transform: 'translateY(-50%)',
                      color: '#9CA3AF'
                    }}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="table-scroll-container">
                <table className="promotions-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'start' }}>{t('promotions_craftsman') || 'Craftsman'}</th>
                      <th style={{ textAlign: 'start' }}>{t('promotions_category') || 'Category'}</th>
                      <th style={{ textAlign: 'start' }}>{t('promotions_city') || 'City'}</th>
                      <th style={{ textAlign: 'start' }}>{t('promotions_package') || 'Package'}</th>
                      <th style={{ textAlign: 'end' }}>{t('promotions_days_left') || 'Days Left'}</th>
                      <th style={{ textAlign: 'end' }}>{t('promotions_views') || 'Views'}</th>
                      <th style={{ textAlign: 'end' }}>{t('promotions_clicks') || 'Clicks'}</th>
                      <th style={{ textAlign: 'end' }}>{t('promotions_conv') || 'Conv.'}</th>
                      <th style={{ textAlign: 'center', width: '70px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCraftsmen.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="empty-table-cell">
                          {isRtl ? 'لا يوجد حرفيين مروجين يطابقون البحث.' : 'No sponsored craftsmen match your search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCraftsmen.map((craftsman) => (
                        <tr key={craftsman.id}>
                          <td style={{ textAlign: 'start' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <div className="craftsman-avatar">
                                <span>{craftsman.avatarInitials}</span>
                              </div>
                              <div style={{ textAlign: 'start' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#171717' }}>{craftsman.name}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign: 'start', color: '#525252', fontSize: '13px' }}>{craftsman.category}</td>
                          <td style={{ textAlign: 'start', color: '#525252', fontSize: '13px' }}>{craftsman.city}</td>
                          <td style={{ textAlign: 'start' }}>
                            <span className={`pkg-badge-pill ${craftsman.packageName.toLowerCase()}`}>
                              {craftsman.packageName}
                            </span>
                          </td>
                          <td style={{ textAlign: 'end', fontWeight: 600, fontSize: '13px' }}>
                            <span className={craftsman.daysLeft <= 7 ? 'alert-danger-text' : ''}>
                              {craftsman.daysLeft} {isRtl ? 'يوم' : 'd'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'end', color: '#525252', fontSize: '13px' }}>
                            {craftsman.views.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'end', color: '#525252', fontSize: '13px' }}>
                            {craftsman.clicks.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'end', color: '#16A34A', fontWeight: 600, fontSize: '13px' }}>
                            {craftsman.conversionRate}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="table-row-delete-btn"
                              onClick={() => handleDeletePromotion(craftsman.id)}
                              title={isRtl ? 'إلغاء الترويج' : 'Cancel Promotion'}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features Sidebar Column */}
            <div className="column-features glass-card">
              <div style={{ textAlign: 'start', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  {t('promotions_features_title') || 'Promotion Features'}
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '13px' }}>
                  {t('promotions_features_subtitle') || 'Globally enable or disable available promotion features.'}
                </p>
              </div>

              <div className="features-list">
                {globalFeatures.map((feature) => (
                  <div key={feature.id} className="feature-item-row">
                    <div className="feature-item-details" style={{ textAlign: 'start' }}>
                      <span className="feature-name-label">{feature.name}</span>
                      <span className="feature-desc-label">{feature.description}</span>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="feature-stat-indicator" />
                        <span style={{ fontSize: '11px', color: '#737373', fontWeight: 500 }}>
                          {feature.activeCount} {isRtl ? 'حساب نشط' : 'active listings'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Button Switch */}
                    <button
                      className={`toggle-switch-btn ${feature.enabled ? 'checked' : ''}`}
                      onClick={() => handleToggleFeature(feature.id)}
                    >
                      <span className="switch-slider" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Package Modal ── */}
        {editingPackage && (
          <div className="custom-modal-backdrop animate-fade-in">
            <div className="custom-modal-content glass-card">
              <div className="modal-header-row">
                <h3 className="modal-title-label">
                  {t('promotions_edit_modal_title') || 'Edit Package Rates'} - {editingPackage.name}
                </h3>
                <button className="modal-close-btn" onClick={() => setEditingPackage(null)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="modal-form-body">
                <div className="input-group">
                  <label>{isRtl ? 'السعر (ريال سعودي)' : 'Price (SAR)'}</label>
                  <input
                    type="number"
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'الوصول المتوقع' : 'Expected Reach'}</label>
                  <input
                    type="text"
                    value={newPackageReach}
                    onChange={(e) => setNewPackageReach(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'زيادة الظهور' : 'Visibility Boost'}</label>
                  <input
                    type="text"
                    value={newPackageBoost}
                    onChange={(e) => setNewPackageBoost(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="cancel-btn" onClick={() => setEditingPackage(null)}>
                    {t('promotions_cancel') || 'Cancel'}
                  </button>
                  <button type="submit" className="save-btn">
                    {t('promotions_save_changes') || 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── New Promotion Modal ── */}
        {isNewPromoOpen && (
          <div className="custom-modal-backdrop animate-fade-in">
            <div className="custom-modal-content glass-card">
              <div className="modal-header-row">
                <h3 className="modal-title-label">
                  {isRtl ? 'إضافة ترويج لحرفي جديد' : 'Sponsor New Craftsman'}
                </h3>
                <button className="modal-close-btn" onClick={() => setIsNewPromoOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePromo} className="modal-form-body">
                <div className="input-group">
                  <label>{isRtl ? 'اسم الحرفي' : 'Craftsman Name'}</label>
                  <input
                    type="text"
                    value={newCraftsmanName}
                    onChange={(e) => setNewCraftsmanName(e.target.value)}
                    placeholder={isRtl ? 'أدخل اسم الحرفي...' : 'Enter craftsman full name...'}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'الفئة / المهنة' : 'Category'}</label>
                  <select
                    value={newCraftsmanCat}
                    onChange={(e) => setNewCraftsmanCat(e.target.value)}
                  >
                    <option value="Electrician">{isRtl ? 'كهربائي' : 'Electrician'}</option>
                    <option value="Plumber">{isRtl ? 'سباك' : 'Plumber'}</option>
                    <option value="AC Repair">{isRtl ? 'فني تكييف' : 'AC Repair'}</option>
                    <option value="Carpenter">{isRtl ? 'نجار' : 'Carpenter'}</option>
                    <option value="Painter">{isRtl ? 'دهان' : 'Painter'}</option>
                    <option value="Cleaner">{isRtl ? 'عامل نظافة' : 'Cleaner'}</option>
                    <option value="Mover">{isRtl ? 'نقل عفش' : 'Mover'}</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'المدينة' : 'City'}</label>
                  <select
                    value={newCraftsmanCity}
                    onChange={(e) => setNewCraftsmanCity(e.target.value)}
                  >
                    <option value="Riyadh">{isRtl ? 'الرياض' : 'Riyadh'}</option>
                    <option value="Jeddah">{isRtl ? 'جدة' : 'Jeddah'}</option>
                    <option value="Dammam">{isRtl ? 'الدمام' : 'Dammam'}</option>
                    <option value="Makkah">{isRtl ? 'مكة المكرمة' : 'Makkah'}</option>
                    <option value="Medina">{isRtl ? 'المدينة المنورة' : 'Medina'}</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'باقة الاشتراك' : 'Sponsorship Package'}</label>
                  <select
                    value={newCraftsmanPack}
                    onChange={(e) => setNewCraftsmanPack(e.target.value as any)}
                  >
                    <option value="Basic">{isRtl ? 'الباقة الأساسية (Basic)' : 'Basic'}</option>
                    <option value="Featured">{isRtl ? 'باقة التميز (Featured)' : 'Featured'}</option>
                    <option value="Premium">{isRtl ? 'الباقة الممتازة (Premium)' : 'Premium'}</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{isRtl ? 'المدة بالأيام' : 'Duration (Days)'}</label>
                  <input
                    type="number"
                    value={newCraftsmanDays}
                    onChange={(e) => setNewCraftsmanDays(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="cancel-btn" onClick={() => setIsNewPromoOpen(false)}>
                    {t('promotions_cancel') || 'Cancel'}
                  </button>
                  <button type="submit" className="save-btn">
                    {isRtl ? 'تفعيل الترويج' : 'Activate Sponsorship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <MobileBottomTabs />
      </main>

      {/* Scoped CSS Stylesheet (Figma Precise & Premium Dark Mode Harmonious Palette) */}
      <style>{`
        /* ── Base Spacing & Layout Structure ── */
        .promotions-page-body {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .section-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #171717;
          margin: 0;
          letter-spacing: -0.4px;
        }

        .section-subtitle {
          font-size: 13px;
          color: #6B7280;
          margin: 4px 0 0 0;
        }

        /* ── Toast Notification ── */
        .custom-toast-notification {
          position: fixed;
          top: 80px;
          inset-inline-end: 24px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 12px 18px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #171717;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        [dir="rtl"] .custom-toast-notification {
          animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* ── Action Buttons ── */
        .promotions-primary-btn {
          background: #171717;
          color: #FFFFFF;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
        }

        .promotions-primary-btn:hover {
          background: #2D2D2D;
        }

        .promotions-secondary-btn {
          background: #FFFFFF;
          color: #171717;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: 1px solid #D1D5DB;
          transition: background 0.15s;
        }

        .promotions-secondary-btn:hover {
          background: #F9FAFB;
        }

        /* ── Metrics Grid ── */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
        }

        .metric-card {
          padding: 24px !important;
          border-radius: 16px !important;
          border: 1px solid #E5E7EB !important;
          background: #FFFFFF !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 8px;
        }

        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }


        .trend-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .trend-badge.positive {
          background: #DCFCE7;
          color: #15803D;
        }

        .metric-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #171717;
          letter-spacing: -0.8px;
        }

        /* ── Package Comparison Cards ── */
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          width: 100%;
        }

        .package-card {
          padding: 28px !important;
          border-radius: 16px !important;
          border: 1px solid #E5E7EB !important;
          display: flex;
          flex-direction: column;
          position: relative;
          text-align: start;
        }

        .package-card.basic {
          background: #FFFFFF !important;
          color: #171717;
        }

        .package-card.featured {
          background: #171717 !important;
          border-color: #171717 !important;
          color: #FFFFFF;
        }

        .package-card.premium {
          background: #FFFFFF !important;
          color: #171717;
        }

        .popular-badge-pill {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          color: #171717;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          white-space: nowrap;
        }

        .package-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F4F4F5;
          color: #171717;
        }

        .package-card.featured .icon-wrapper {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
        }

        .package-active-badge {
          font-size: 12px;
          color: #71717A;
          font-weight: 500;
        }

        .package-card.featured .package-active-badge {
          color: rgba(255, 255, 255, 0.5);
        }

        .package-card.premium .package-active-badge {
          color: #71717A;
        }

        .package-tier-name {
          font-size: 18px;
          font-weight: 700;
          color: #171717;
          margin: 0 0 8px 0;
        }

        .package-card.featured .package-tier-name {
          color: #FFFFFF;
        }

        .price-container {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 24px;
        }

        .price-value {
          font-size: 26px;
          font-weight: 700;
          color: #171717;
        }

        .package-card.featured .price-value {
          color: #FFFFFF;
        }

        .price-duration {
          font-size: 12px;
          color: #71717A;
          font-weight: 500;
        }

        .package-card.featured .price-duration {
          color: rgba(255, 255, 255, 0.5);
        }

        .highlights-row {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .highlight-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hl-label {
          font-size: 11px;
          color: #71717A;
          font-weight: 500;
        }

        .package-card.featured .hl-label {
          color: rgba(255, 255, 255, 0.5);
        }

        .hl-value {
          font-size: 13px;
          font-weight: 700;
          color: #171717;
        }

        .package-card.featured .hl-value {
          color: #FFFFFF;
        }

        .package-features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .package-features-list li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: #27272A;
          line-height: 1.3;
        }

        .package-card.featured .package-features-list li {
          color: rgba(255, 255, 255, 0.8);
        }

        .package-features-list li .check-icon {
          color: #171717;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .package-card.featured .package-features-list li .check-icon {
          color: #FFFFFF;
        }

        .package-edit-btn {
          width: 100%;
          background: #F4F4F5;
          border: none;
          color: #171717;
          font-size: 13px;
          font-weight: 600;
          padding: 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .package-edit-btn:hover {
          background: #E4E4E7;
        }

        .package-card.featured .package-edit-btn {
          background: #FFFFFF;
          color: #171717;
        }

        .package-card.featured .package-edit-btn:hover {
          background: #F4F4F5;
        }

        /* ── Split Grid Columns ── */
        .layout-two-columns {
          display: grid;
          grid-template-columns: 3fr 1fr;
          gap: 20px;
          width: 100%;
          align-items: start;
        }

        .column-table {
          border-radius: 16px !important;
          border: 1px solid #E5E7EB !important;
          background: #FFFFFF !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
          overflow: hidden;
        }

        .column-features {
          padding: 24px !important;
          border-radius: 16px !important;
          border: 1px solid #E5E7EB !important;
          background: #FFFFFF !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03) !important;
        }

        /* ── Craftsmen Sponsored Table ── */
        .table-scroll-container {
          overflow-x: auto;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .promotions-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .promotions-table th {
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
          padding: 14px 20px;
          border-bottom: 1px solid #E5E7EB;
          background: #F9FAFB;
          white-space: nowrap;
        }

        .promotions-table td {
          padding: 14px 20px;
          font-size: 13px;
          border-bottom: 1px solid #E5E7EB;
          color: #171717;
          vertical-align: middle;
          white-space: nowrap;
        }

        .promotions-table tbody tr:last-child td {
          border-bottom: none;
        }

        .promotions-table tr:hover td {
          background: #FAFAFA;
        }

        .craftsman-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #171717;
          flex-shrink: 0;
        }

        .pkg-badge-pill {
          display: inline-flex;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pkg-badge-pill.basic {
          background: #F4F4F5;
          color: #171717;
        }

        .pkg-badge-pill.featured {
          background: #171717;
          color: #FFFFFF;
        }

        .pkg-badge-pill.premium {
          background: #FEF3C7;
          color: #92400E;
        }

        .alert-danger-text {
          color: #DC2626;
        }

        .table-row-delete-btn {
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.15s, color 0.15s;
        }

        .table-row-delete-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
        }

        .empty-table-cell {
          text-align: center;
          padding: 48px !important;
          color: #6B7280;
          font-size: 13px;
        }

        /* ── Promotion Features List ── */
        .features-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feature-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid #F3F4F6;
        }

        .feature-item-row:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .feature-item-details {
          flex: 1;
        }

        .feature-name-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #171717;
          margin-bottom: 2px;
        }

        .feature-desc-label {
          display: block;
          font-size: 12px;
          color: #737373;
          line-height: 1.4;
        }

        .feature-stat-indicator {
          width: 6px;
          height: 6px;
          background: #22C55E;
          border-radius: 50%;
          display: inline-block;
        }

        /* ── Toggle Switch Button ── */
        .toggle-switch-btn {
          width: 36px;
          height: 20px;
          border-radius: 9999px;
          background: #E5E7EB;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
          border: none;
          flex-shrink: 0;
        }

        .toggle-switch-btn.checked {
          background: #171717;
        }

        .switch-slider {
          position: absolute;
          top: 2px;
          inset-inline-start: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .toggle-switch-btn.checked .switch-slider {
          transform: translateX(16px);
        }

        [dir="rtl"] .toggle-switch-btn.checked .switch-slider {
          transform: translateX(-16px);
        }

        /* ── Premium Modal Layout ── */
        .custom-modal-backdrop {
          position: fixed;
          top: 0;
          bottom: 0;
          inset-inline-start: 0;
          inset-inline-end: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .custom-modal-content {
          width: 100%;
          max-width: 480px;
          background: #FFFFFF !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04) !important;
          padding: 24px !important;
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalPop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }

        .modal-title-label {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #171717;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: #9CA3AF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
        }

        .modal-close-btn:hover {
          background: #F3F4F6;
          color: #4B5563;
        }

        .modal-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: start;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 600;
          color: #4B5563;
        }

        .input-group input,
        .input-group select {
          height: 38px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          padding: 0 12px;
          font-size: 13px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: #171717;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .modal-actions-row .cancel-btn {
          background: #FAFAFA;
          border: 1px solid #E5E7EB;
          color: #171717;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .modal-actions-row .cancel-btn:hover {
          background: #F4F4F5;
        }

        .modal-actions-row .save-btn {
          background: #171717;
          color: #FFFFFF;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .modal-actions-row .save-btn:hover {
          background: #2D2D2D;
        }

        /* ── Media Queries Responsive Grid Override ── */
        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .packages-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .layout-two-columns {
            grid-template-columns: 1fr;
          }
        }

        /* Tablet Width Alignment */
        @media (min-width: 769px) and (max-width: 1024px) {
          .main-content {
            padding-inline-start: var(--spacing-md) !important;
            padding-inline-end: var(--spacing-md) !important;
            padding-top: var(--header-height) !important;
            box-sizing: border-box !important;
          }

          .promotions-page-body {
            max-width: 100% !important;
            box-sizing: border-box;
          }
        }

        /* Mobile Width Alignment & Spacing Adjustments */
        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
            width: 100% !important;
          }

          .promotions-page-body {
            padding: 16px 20px !important;
            margin-top: 0 !important;
            gap: 16px !important;
            max-width: 100% !important;
            box-sizing: border-box;
          }

          .mobile-action-row {
            margin-top: 16px !important; /* Move button away from mobile subheader */
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .packages-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .package-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};
