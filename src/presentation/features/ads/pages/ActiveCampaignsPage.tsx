import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import {
  Search,
  Plus,
  Play,
  Pause,
  Trash2,
  Megaphone,
  X,
  ChevronDown,
  Bell,
  Calendar,
  Clock,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  placement: string;
  audience: string;
  startDate: string;
  endDate: string;
  daysLeft?: number;
  startsInDays?: number;
  endedText?: string;
  impressions: string;
  ctr: string;
  conversions: number;
  spend: string;
  budget?: number;
  status: 'Active' | 'Paused' | 'Scheduled' | 'Expired';
}

interface ActiveCampaignsPageProps {
  defaultTab?: 'Active' | 'Scheduled' | 'Expired';
}

export const ActiveCampaignsPage: React.FC<ActiveCampaignsPageProps> = ({ defaultTab = 'Active' }) => {
  const { isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Active' | 'Scheduled' | 'Expired'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'spend' | 'impressions'>('default');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampObjective, setNewCampObjective] = useState('Lead gen');
  const [newCampPlacement, setNewCampPlacement] = useState('Home Banner');
  const [newCampAudience, setNewCampAudience] = useState('Customers · All');
  const [newCampBudget, setNewCampBudget] = useState('');

  // Initial Campaigns List (Figma Exact Matches + additional items to match Figma counts)
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    // Active / Paused tab items (Active count = 10)
    {
      id: 'act-1',
      name: 'Summer AC Repair Promo',
      objective: 'Boost AC bookings',
      placement: 'Home Banner',
      audience: 'Customers · AC Repair',
      startDate: 'Oct 12',
      endDate: 'Nov 12',
      daysLeft: 24,
      impressions: '124K',
      ctr: '4.2%',
      conversions: 842,
      spend: '5,000 ILS',
      status: 'Active'
    },
    {
      id: 'act-2',
      name: 'Plumbing Emergency Boost',
      objective: 'Instant Leads',
      placement: 'Search Top',
      audience: 'Customers · Emergency',
      startDate: 'Oct 15',
      endDate: 'Nov 15',
      daysLeft: 22,
      impressions: '89K',
      ctr: '5.1%',
      conversions: 612,
      spend: '3,500 ILS',
      status: 'Active'
    },
    {
      id: 'act-3',
      name: 'Jerusalem Deep Cleaning',
      objective: 'Awareness',
      placement: 'Category Page',
      audience: 'Customers · Cleaning',
      startDate: 'Sep 28',
      endDate: 'Nov 28',
      daysLeft: 18,
      impressions: '210K',
      ctr: '3.9%',
      conversions: 1204,
      spend: '8,000 ILS',
      status: 'Active'
    },
    {
      id: 'act-4',
      name: 'Ramallah Movers Special',
      objective: 'Conversions',
      placement: 'Home Banner',
      audience: 'Customers · Movers',
      startDate: 'Oct 05',
      endDate: 'Nov 05',
      daysLeft: 12,
      impressions: '65K',
      ctr: '3.1%',
      conversions: 340,
      spend: '4,000 ILS',
      status: 'Active'
    },
    {
      id: 'act-5',
      name: 'Electricians Featured Slots',
      objective: 'Featured listings',
      placement: 'Featured Slots',
      audience: 'Customers · Electricians',
      startDate: 'Oct 10',
      endDate: 'Dec 10',
      daysLeft: 34,
      impressions: '152K',
      ctr: '6.4%',
      conversions: 980,
      spend: '6,200 ILS',
      status: 'Active'
    },
    {
      id: 'act-6',
      name: 'Painting Pros — Old City',
      objective: 'Lead gen',
      placement: 'Craftsmen Listing',
      audience: 'Customers · Painting',
      startDate: 'Oct 08',
      endDate: 'Nov 08',
      daysLeft: 15,
      impressions: '78K',
      ctr: '3.7%',
      conversions: 420,
      spend: '2,400 ILS',
      status: 'Active'
    },
    {
      id: 'act-7',
      name: 'New Craftsman Onboarding',
      objective: 'Sign-ups',
      placement: 'Popups',
      audience: 'Craftsmen · All',
      startDate: 'Sep 15',
      endDate: 'Dec 15',
      daysLeft: 38,
      impressions: '45K',
      ctr: '2.8%',
      conversions: 124,
      spend: '2,000 ILS',
      status: 'Paused'
    },
    {
      id: 'act-8',
      name: 'Bethlehem Maintenance Week',
      objective: 'Awareness',
      placement: 'Notifications',
      audience: 'Customers · Maintenance',
      startDate: 'Oct 14',
      endDate: 'Oct 28',
      daysLeft: 4,
      impressions: '28K',
      ctr: '4.6%',
      conversions: 186,
      spend: '1,500 ILS',
      status: 'Active'
    },
    {
      id: 'act-9',
      name: 'Carpenters Boost — Hebron',
      objective: 'Profile views',
      placement: 'Search Results',
      audience: 'Customers · Carpenters',
      startDate: 'Oct 02',
      endDate: 'Dec 02',
      daysLeft: 26,
      impressions: '38K',
      ctr: '3.3%',
      conversions: 142,
      spend: '1,800 ILS',
      status: 'Active'
    },
    {
      id: 'act-10',
      name: 'AC Maintenance Reminder',
      objective: 'Retention',
      placement: 'Notifications',
      audience: 'Both · AC Repair',
      startDate: 'Oct 11',
      endDate: 'Nov 11',
      daysLeft: 21,
      impressions: '96K',
      ctr: '4.0%',
      conversions: 512,
      spend: '3,200 ILS',
      status: 'Active'
    },

    // Scheduled tab items (Scheduled count = 8)
    {
      id: 'sch-1',
      name: 'Plumbing Seasonal Push',
      objective: 'Seasonal push',
      placement: 'Home Banner',
      audience: 'Customers · Plumbers',
      startDate: 'Nov 20',
      endDate: 'Dec 10',
      startsInDays: 14,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 6000,
      status: 'Scheduled'
    },
    {
      id: 'sch-2',
      name: 'Winter Heater Setup',
      objective: 'Awareness',
      placement: 'Search Results',
      audience: 'Customers · Plumbers',
      startDate: 'Dec 01',
      endDate: 'Jan 31',
      startsInDays: 25,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 8500,
      status: 'Scheduled'
    },
    {
      id: 'sch-3',
      name: 'Jerusalem Featured Electricians',
      objective: 'Featured slots',
      placement: 'Featured Slots',
      audience: 'Customers · Electricians',
      startDate: 'Nov 15',
      endDate: 'Dec 15',
      startsInDays: 9,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 7200,
      status: 'Scheduled'
    },
    {
      id: 'sch-4',
      name: 'Movers Promotion',
      objective: 'Conversions',
      placement: 'Home Banner',
      audience: 'Customers · Movers',
      startDate: 'Nov 24',
      endDate: 'Nov 30',
      startsInDays: 18,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 4000,
      status: 'Scheduled'
    },
    {
      id: 'sch-5',
      name: 'Painting Craftsmen Drive',
      objective: 'Sign-ups',
      placement: 'Popups',
      audience: 'Craftsmen · Painting',
      startDate: 'Nov 18',
      endDate: 'Dec 18',
      startsInDays: 12,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 3000,
      status: 'Scheduled'
    },
    {
      id: 'sch-6',
      name: 'Nablus Cleaning Launch',
      objective: 'Awareness',
      placement: 'Category Page',
      audience: 'Customers · Cleaning',
      startDate: 'Nov 22',
      endDate: 'Dec 22',
      startsInDays: 16,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 5500,
      status: 'Scheduled'
    },
    {
      id: 'sch-7',
      name: 'Carpenters Regional',
      objective: 'Lead gen',
      placement: 'Craftsmen Listing',
      audience: 'Customers · Carpenters',
      startDate: 'Dec 05',
      endDate: 'Jan 05',
      startsInDays: 29,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 6800,
      status: 'Scheduled'
    },
    {
      id: 'sch-8',
      name: 'Year-End Maintenance',
      objective: 'Retention',
      placement: 'Notifications',
      audience: 'Both · Maintenance',
      startDate: 'Dec 15',
      endDate: 'Dec 31',
      startsInDays: 39,
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: '0 ILS',
      budget: 2500,
      status: 'Scheduled'
    },

    // Expired tab items (Expired count = 7)
    {
      id: 'exp-1',
      name: 'Back to School Cleaning',
      objective: 'Awareness',
      placement: 'Home Banner',
      audience: 'Customers · Cleaning',
      startDate: 'Aug 01',
      endDate: 'Sep 15',
      endedText: 'ended 26d ago',
      impressions: '342K',
      ctr: '4.8%',
      conversions: 2180,
      spend: '9,500 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-2',
      name: 'Summer AC Tune-up',
      objective: 'Lead gen',
      placement: 'Search Results',
      audience: 'Customers · AC Repair',
      startDate: 'Jun 01',
      endDate: 'Aug 31',
      endedText: 'ended 71d ago',
      impressions: '628K',
      ctr: '5.2%',
      conversions: 4124,
      spend: '18,400 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-3',
      name: 'Seasonal Cleaning Push',
      objective: 'Conversions',
      placement: 'Popups',
      audience: 'Customers · Cleaning',
      startDate: 'Mar 10',
      endDate: 'Apr 09',
      endedText: 'ended 8mo ago',
      impressions: '512K',
      ctr: '6.1%',
      conversions: 3850,
      spend: '14,200 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-4',
      name: 'Jerusalem Movers Special',
      objective: 'Awareness',
      placement: 'Featured Slots',
      audience: 'Customers · Movers',
      startDate: 'May 20',
      endDate: 'Jul 10',
      endedText: 'ended 4mo ago',
      impressions: '218K',
      ctr: '4.4%',
      conversions: 1210,
      spend: '8,800 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-5',
      name: 'Plumbers Onboarding Q3',
      objective: 'Sign-ups',
      placement: 'Popups',
      audience: 'Craftsmen · Plumbers',
      startDate: 'Jul 01',
      endDate: 'Sep 30',
      endedText: 'ended 10d ago',
      impressions: '124K',
      ctr: '3.1%',
      conversions: 482,
      spend: '4,500 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-6',
      name: 'Painting Summer Sale',
      objective: 'Conversions',
      placement: 'Home Banner',
      audience: 'Customers · Painting',
      startDate: 'Jul 15',
      endDate: 'Aug 30',
      endedText: 'ended 42d ago',
      impressions: '186K',
      ctr: '4.0%',
      conversions: 912,
      spend: '6,400 ILS',
      status: 'Expired'
    },
    {
      id: 'exp-7',
      name: 'Electricians Boost — Jerusalem',
      objective: 'Featured listings',
      placement: 'Search Results',
      audience: 'Customers · Electricians',
      startDate: 'Aug 10',
      endDate: 'Sep 30',
      endedText: 'ended 11d ago',
      impressions: '198K',
      ctr: '5.6%',
      conversions: 1440,
      spend: '7,200 ILS',
      status: 'Expired'
    }
  ]);

  // Tab count selectors
  const tabCounts = useMemo(() => {
    const activeAndPaused = campaigns.filter(c => c.status === 'Active' || c.status === 'Paused').length;
    const scheduled = campaigns.filter(c => c.status === 'Scheduled').length;
    const expired = campaigns.filter(c => c.status === 'Expired').length;
    return { Active: activeAndPaused, Scheduled: scheduled, Expired: expired };
  }, [campaigns]);

  // Handle adding new campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName || !newCampBudget) return;

    const newCamp: Campaign = {
      id: `new-${Date.now()}`,
      name: newCampName,
      objective: newCampObjective,
      placement: newCampPlacement,
      audience: newCampAudience,
      startDate: 'Nov 01',
      endDate: 'Dec 01',
      impressions: '0',
      ctr: '0.0%',
      conversions: 0,
      spend: `${parseFloat(newCampBudget).toLocaleString()} ILS`,
      status: 'Scheduled' // New campaigns default to Scheduled timeframe
    };

    setCampaigns([newCamp, ...campaigns]);
    setNewCampName('');
    setNewCampBudget('');
    setIsModalOpen(false);
  };

  // Toggle status
  const toggleCampaignStatus = (id: string) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'Active' ? 'Paused' : 'Active'
        };
      }
      return c;
    }));
  };

  // Delete campaign
  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  // Filter and sort campaigns list
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(c => {
        // Tab mapping
        if (activeTab === 'Active') {
          return c.status === 'Active' || c.status === 'Paused';
        }
        return c.status === activeTab;
      })
      .filter(c => {
        // Search query
        const query = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.objective.toLowerCase().includes(query) ||
          c.placement.toLowerCase().includes(query) ||
          c.audience.toLowerCase().includes(query)
        );
      })
      .filter(c => {
        // Placement filter
        if (selectedPlacement === 'All') return true;
        return c.placement === selectedPlacement;
      })
      .filter(c => {
        // Category filter
        if (selectedCategory === 'All') return true;
        return c.audience.toLowerCase().includes(selectedCategory.toLowerCase());
      })
      .sort((a, b) => {
        // Sorting logic
        if (sortBy === 'default') {
          return 0; // Keep original insertion order (figma layout)
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'spend') {
          const spendA = parseFloat(a.spend.replace(/[^\d.]/g, '')) || 0;
          const spendB = parseFloat(b.spend.replace(/[^\d.]/g, '')) || 0;
          return spendB - spendA;
        } else {
          const impA = parseFloat(a.impressions.replace(/[^\d.]/g, '')) * (a.impressions.includes('K') ? 1000 : 1) || 0;
          const impB = parseFloat(b.impressions.replace(/[^\d.]/g, '')) * (b.impressions.includes('K') ? 1000 : 1) || 0;
          return impB - impA;
        }
      });
  }, [campaigns, activeTab, searchQuery, selectedPlacement, selectedCategory, sortBy]);

  const pageMeta = useMemo(() => {
    switch (activeTab) {
      case 'Scheduled':
        return {
          title: 'Scheduled Campaigns',
          subtitle: 'Campaigns queued to launch in the future',
          icon: <Calendar size={20} style={{ color: 'var(--text-primary)' }} />
        };
      case 'Expired':
        return {
          title: 'Expired Campaigns',
          subtitle: 'Past advertisement campaigns that have ended',
          icon: <Clock size={20} style={{ color: 'var(--text-primary)' }} />
        };
      case 'Active':
      default:
        return {
          title: 'Active Campaigns',
          subtitle: 'Currently running advertisements across the marketplace',
          icon: <Megaphone size={20} style={{ color: 'var(--text-primary)' }} />
        };
    }
  }, [activeTab]);

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header */}
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
              <div className="mobile-logo">A</div>
              <div className="mobile-logo-text">
                <strong>Arox</strong>
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
        <div className="mobile-subheader mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'start' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{pageMeta.title}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{pageMeta.subtitle}</span>
          </div>
        </div>

        {/* Desktop & Tablet Page Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Title Icon matching figma */}
            <div className="page-title-icon-wrap" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              {pageMeta.icon}
            </div>
            <div style={{ textAlign: 'start' }}>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.7px', color: 'var(--text-primary)' }}>
                {pageMeta.title}
              </h1>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                {pageMeta.subtitle}
              </p>
            </div>
          </div>

          <button className="ads-primary-btn" onClick={() => navigate('create_ad')}>
            <Plus size={16} />
            <span>New Campaign</span>
          </button>
        </div>

        {/* Page Content Body */}
        <div className="campaigns-page-body animate-fade-in">
          {/* Mobile Actions Row */}
          <div className="mobile-actions-row mobile-only" style={{ display: 'flex', gap: '8px', padding: '0 20px', boxSizing: 'border-box' }}>
            <button className="ads-primary-btn" style={{ flex: 1 }} onClick={() => navigate('create_ad')}>
              <Plus size={16} />
              <span>New Campaign</span>
            </button>
          </div>

          {/* Segmented Tabbing Selection Row */}
          <div className="segmented-tabs-wrapper" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px', position: 'relative' }}>
            {(['Active', 'Scheduled', 'Expired'] as const).map(tab => {
              const count = tabCounts[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  className={`tab-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '12px 4px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{tab}</span>
                  <span
                    className="tab-count-badge"
                    style={{
                      background: isActive ? 'var(--color-primary)' : 'var(--bg-surface-hover)',
                      color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      display: 'inline-block'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Filter, Sort Row */}
          <div className="table-controls-row">
            {/* Search Input wrapper */}
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  boxSizing: 'border-box',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  background: 'var(--bg-surface-hover)'
                }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>

            {/* Filter Dropdowns & Sort */}
            <div className="filters-group">
              {/* Placement Filter */}
              <div className="filter-select-wrapper">
                <div className="filter-button-overlay">
                  <div className="filter-button-overlay-left">
                    <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
                    <span>{selectedPlacement === 'All' ? 'Placement' : selectedPlacement}</span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <select
                  value={selectedPlacement}
                  onChange={(e) => setSelectedPlacement(e.target.value)}
                  className="real-select"
                >
                  <option value="All">All Placements</option>
                  <option value="Home Banner">Home Banner</option>
                  <option value="Search Results">Search Results</option>
                  <option value="Popups">Popups</option>
                  <option value="Category Page">Category Page</option>
                  <option value="Craftsmen Listing">Craftsmen Listing</option>
                  <option value="Notifications">Notifications</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="filter-select-wrapper">
                <div className="filter-button-overlay">
                  <div className="filter-button-overlay-left">
                    <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
                    <span>{selectedCategory === 'All' ? 'Category' : selectedCategory}</span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="real-select"
                >
                  <option value="All">All Categories</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                  <option value="AC & Heating">AC & Heating</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="filter-select-wrapper">
                <div className="filter-button-overlay">
                  <div className="filter-button-overlay-left">
                    <ArrowUpDown size={15} style={{ color: 'var(--text-secondary)' }} />
                    <span>{sortBy === 'default' ? 'Sort' : sortBy === 'name' ? 'Name' : sortBy === 'spend' ? 'Spend' : 'Impressions'}</span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="real-select"
                >
                  <option value="default">Default Sort</option>
                  <option value="name">Name</option>
                  <option value="spend">Spend</option>
                  <option value="impressions">Impressions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaigns Listing Card */}
          <div className="campaigns-table-card glass-card">
            <div className="table-scroll-container">
              <table className="campaigns-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px', textAlign: 'center' }}>
                      <input type="checkbox" className="custom-table-checkbox" />
                    </th>
                    <th style={{ textAlign: 'start' }}>Campaign</th>
                    <th style={{ textAlign: 'start' }}>Placement</th>
                    <th style={{ textAlign: 'start' }}>Audience</th>
                    <th style={{ textAlign: 'start' }}>Schedule</th>
                    <th style={{ textAlign: 'end' }}>Impressions</th>
                    <th style={{ textAlign: 'end' }}>CTR</th>
                    <th style={{ textAlign: 'end' }}>Conv.</th>
                    <th style={{ textAlign: 'end' }}>Spend</th>
                    <th style={{ textAlign: 'start' }}>Status</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="empty-table-cell">No campaigns found matching the filters.</td>
                    </tr>
                  ) : (
                    filteredCampaigns.map(camp => (
                      <tr key={camp.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" className="custom-table-checkbox" />
                        </td>
                        <td style={{ textAlign: 'start' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div className="campaign-avatar" style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: '20px', height: '12px', background: 'var(--border-color)', borderRadius: '2px' }} />
                            </div>
                            <div style={{ textAlign: 'start' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{camp.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{camp.objective}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'start', color: 'var(--text-secondary)', fontSize: '13px' }}>{camp.placement}</td>
                        <td style={{ textAlign: 'start', color: 'var(--text-secondary)', fontSize: '13px' }}>{camp.audience}</td>
                        <td style={{ textAlign: 'start' }}>
                          <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{camp.startDate} &rarr; {camp.endDate}</div>
                          {camp.status === 'Scheduled' && camp.startsInDays !== undefined ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>starts in {camp.startsInDays}d</div>
                          ) : camp.status === 'Expired' && camp.endedText !== undefined ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{camp.endedText}</div>
                          ) : camp.daysLeft !== undefined ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{camp.daysLeft} days left</div>
                          ) : null}
                        </td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {camp.status === 'Scheduled' ? '—' : camp.impressions}
                        </td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {camp.status === 'Scheduled' ? '—' : camp.ctr}
                        </td>
                        <td style={{ textAlign: 'end', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {camp.status === 'Scheduled' ? '—' : camp.conversions.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'end', fontWeight: 600, fontSize: '13px' }}>
                          {camp.status === 'Scheduled' && camp.budget !== undefined
                            ? `0 / ${camp.budget.toLocaleString()} ILS`
                            : camp.spend}
                        </td>
                        <td style={{ textAlign: 'start' }}>
                          <span className={`status-pill ${camp.status.toLowerCase()}`}>
                            {camp.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {(camp.status === 'Active' || camp.status === 'Paused') && (
                              <button
                                onClick={() => toggleCampaignStatus(camp.id)}
                                className={`action-icon-btn ${camp.status === 'Active' ? 'pause' : 'play'}`}
                                title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                              >
                                {camp.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                              </button>
                            )}
                            <button
                              onClick={() => deleteCampaign(camp.id)}
                              className="action-icon-btn delete"
                              title="Delete Campaign"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Control matching Figma */}
            <div className="table-pagination-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>
                Showing 1–{filteredCampaigns.length} of {filteredCampaigns.length}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled
                  style={{
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#9CA3AF',
                    borderRadius: '6px',
                    padding: '7px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                >
                  Previous
                </button>
                <button
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface-hover)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '7px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    minWidth: '29px',
                    textAlign: 'center'
                  }}
                >
                  1
                </button>
                <button
                  disabled
                  style={{
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    color: '#9CA3AF',
                    borderRadius: '6px',
                    padding: '7px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Launching a New Campaign */}
        {isModalOpen && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="modal-header">
                <h3 className="card-title">Launch New Campaign</h3>
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleCreateCampaign} className="modal-form">
                <div className="form-group">
                  <label className="form-label">Campaign Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jerusalem AC Repair Promo"
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Objective</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead gen"
                    value={newCampObjective}
                    onChange={(e) => setNewCampObjective(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placement</label>
                  <select
                    value={newCampPlacement}
                    onChange={(e) => setNewCampPlacement(e.target.value)}
                    className="form-select"
                  >
                    <option value="Home Banner">Home Banner</option>
                    <option value="Search Results">Search Results</option>
                    <option value="Popups">Popups</option>
                    <option value="Category Page">Category Page</option>
                    <option value="Craftsmen Listing">Craftsmen Listing</option>
                    <option value="Notifications">Notifications</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience / Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Customers · AC Repair"
                    value={newCampAudience}
                    onChange={(e) => setNewCampAudience(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Budget (ILS)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={newCampBudget}
                    onChange={(e) => setNewCampBudget(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="ads-secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="ads-primary-btn">Create Campaign</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <MobileBottomTabs />
      </main>

      {/* Styles for Desktop, Tablet, and Mobile */}
      <style>{`
        /* ── Page Body ── */
        .campaigns-page-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 24px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* ── Tabs ── */
        .segmented-tabs-wrapper {
          padding-inline-start: 0;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tab-item-btn {
          white-space: nowrap;
          flex-shrink: 0;
        }

        .tab-item-btn:hover {
          color: var(--text-primary) !important;
        }

        /* ── Controls Row ── */
        .table-controls-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .search-input-wrapper {
          flex: 1 1 200px;
          min-width: 0;
          position: relative;
        }

        /* The filters group: flex row on desktop/tablet, wraps on mobile */
        .filters-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          flex-shrink: 0;
        }

        .filter-select-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .filter-button-overlay {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          box-sizing: border-box;
          height: 41.5px;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          width: 100%;
        }

        .filter-button-overlay-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .real-select {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          appearance: none;
          box-sizing: border-box;
        }

        /* ── Table Card ── */
        .campaigns-table-card {
          border-radius: 16px;
          overflow: hidden;
          padding: 0 !important;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          box-shadow: var(--shadow-sm);
        }

        .table-scroll-container {
          overflow-x: auto;
          width: 100%;
          -webkit-overflow-scrolling: touch;
        }

        .campaigns-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .campaigns-table th {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
          white-space: nowrap;
        }

        .campaigns-table td {
          padding: 14px 16px;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
          vertical-align: middle;
          white-space: nowrap;
        }

        .campaigns-table tbody tr:last-child td {
          border-bottom: none;
        }

        .campaigns-table tr:hover td {
          background: var(--bg-surface-hover);
        }

        .empty-table-cell {
          text-align: center;
          padding: 48px !important;
          color: var(--text-muted);
          font-size: 14px;
          white-space: normal;
        }

        .custom-table-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }

        /* ── Status Pills ── */
        .status-pill {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px 3px 8px;
          border-radius: 9999px;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .status-pill::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-inline-end: 6px;
          flex-shrink: 0;
        }

        .status-pill.active    { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
        .status-pill.active::before  { background: #22c55e; }
        .status-pill.paused    { background: var(--bg-surface-hover); color: var(--text-muted); }
        .status-pill.paused::before  { background: var(--text-muted); }
        .status-pill.scheduled { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .status-pill.scheduled::before { background: #f59e0b; }
        .status-pill.expired   { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .status-pill.expired::before { background: #ef4444; }

        /* ── Action Buttons ── */
        .action-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .action-icon-btn:hover {
          background: var(--bg-surface);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .action-icon-btn.delete:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* ── Pagination ── */
        .pagination-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── Primary / Secondary Buttons ── */
        .ads-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          background: var(--color-primary);
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ads-primary-btn:hover { opacity: 0.87; }

        .ads-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ads-secondary-btn:hover { background: var(--bg-surface-hover); }

        /* ── Modal ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 16px;
          box-sizing: border-box;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          padding: 24px;
          box-sizing: border-box;
          box-shadow: var(--shadow-sm);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .modal-close-btn:hover { background: var(--bg-surface-hover); }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-input, .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface-hover);
          color: var(--text-primary);
          font-size: 13px;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--color-primary);
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        /* ── Tablet (769px – 1150px) ── */
        @media (min-width: 769px) and (max-width: 1150px) {
          .campaigns-page-body { gap: 20px; }
          .table-controls-row { gap: 8px; }
          .filter-select-wrapper select {
            font-size: 12px;
            padding: 8px 32px 8px 10px;
          }
        }

        /* ── Mobile (≤768px) ── */
        @media (max-width: 768px) {
          .main-content {
            margin-inline-start: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 84px !important;
            padding-inline-start: 0 !important;
            padding-inline-end: 0 !important;
          }

          .mobile-subheader {
            height: auto !important;
            padding: 14px 20px !important;
          }

          .campaigns-page-body {
            padding: 12px 16px 16px !important;
            margin-top: 0 !important;
            gap: 12px !important;
            max-width: 100% !important;
          }

          /* Tabs: equal width pills */
          .segmented-tabs-wrapper {
            gap: 0 !important;
            overflow-x: visible !important;
          }

          .tab-item-btn {
            flex: 1 !important;
            justify-content: center !important;
            padding: 10px 2px !important;
            font-size: 12px !important;
          }

          /* Controls: stack vertically */
          .table-controls-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .search-input-wrapper {
            flex: 1 1 auto;
            min-width: unset;
            width: 100%;
          }

          /* Filters group: 2-column grid on mobile */
          .filters-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }

          /* Last filter (Sort) spans full width if 3 items in 2-col grid */
          .filters-group .filter-select-wrapper:last-child {
            grid-column: 1 / -1;
          }

          .filter-select-wrapper {
            flex: unset;
            width: 100%;
          }

          .filter-select-wrapper select {
            width: 100%;
            box-sizing: border-box;
          }

          /* Mobile actions row */
          .mobile-actions-row {
            padding: 0 !important;
          }

          .mobile-actions-row .ads-primary-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

    </div>
  );
};

export default ActiveCampaignsPage;

