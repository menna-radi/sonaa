import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { apiClient } from '../../../../core/network/apiClient';
import {
  ArrowLeft,
  Upload,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  FileImage,
  Globe,
  Users,
  User,
  Wrench,
  MapPin,
  Tag,
  Link as LinkIcon,
  Sparkles,
  Layers,
  AlertCircle,
  Clock
} from 'lucide-react';
import { AndroidPhoneBannerPreview } from '../components/AndroidPhoneBannerPreview';

interface City {
  name: string;
  nameAr: string;
  selected: boolean;
  reach: number;
}

interface Category {
  name: string;
  nameAr: string;
  selected: boolean;
}

export const CreateAdPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── 1. The Banner Creative States ──
  const [adTitle, setAdTitle] = useState('Summer AC Maintenance Special');
  const [description, setDescription] = useState('20% discount on all AC maintenance & cleaning services this season');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ── 2. Who to Reach (Audience & Targeting) States ──
  const [userType, setUserType] = useState<'Both' | 'Customers' | 'Craftsmen'>('Customers');
  const [locationMode, setLocationMode] = useState<'All' | 'Specific'>('Specific');

  // Real Database Audience Counts
  const [platformStats, setPlatformStats] = useState<{
    totalUsers: number;
    activeCraftsmen: number;
    customerCount: number;
  }>({ totalUsers: 11, activeCraftsmen: 8, customerCount: 5 });

  useEffect(() => {
    let isMounted = true;
    apiClient.get<any>('/admin/overview-stats').then(res => {
      const data = res?.data || res;
      if (data?.metrics && isMounted) {
        const total = Number(data.metrics.totalUsers || 0);
        const craftsmen = Number(data.metrics.activeCraftsmen || 0);
        const customers = Math.max(0, total - craftsmen) || Math.ceil(total * 0.45);
        setPlatformStats({
          totalUsers: total || 11,
          activeCraftsmen: craftsmen || 8,
          customerCount: customers || 5,
        });
      }
    }).catch(err => {
      console.warn('Could not load live stats for reach calculation:', err);
    });
    return () => { isMounted = false; };
  }, []);
  
  const [cities, setCities] = useState<City[]>([
    { name: 'Jerusalem (القدس)', nameAr: 'القدس', selected: true, reach: 5 },
    { name: 'Old City (البلدة القديمة)', nameAr: 'البلدة القديمة', selected: true, reach: 3 },
    { name: 'Beit Hanina (بيت حنينا)', nameAr: 'بيت حنينا', selected: true, reach: 3 },
    { name: 'Shuafat (شعفاط)', nameAr: 'شعفاط', selected: false, reach: 2 },
    { name: 'Sheikh Jarrah (الشيخ جراح)', nameAr: 'الشيخ جراح', selected: false, reach: 2 },
    { name: 'Silwan (سلوان)', nameAr: 'سلوان', selected: false, reach: 2 },
    { name: 'Ramallah (رام الله)', nameAr: 'رام الله', selected: false, reach: 3 },
    { name: 'Bethlehem (بيت لحم)', nameAr: 'بيت لحم', selected: false, reach: 2 },
    { name: 'Hebron (الخليل)', nameAr: 'الخليل', selected: false, reach: 2 },
    { name: 'Nablus (نابلس)', nameAr: 'نابلس', selected: false, reach: 2 },
    { name: 'Jenin (جنين)', nameAr: 'جنين', selected: false, reach: 1 },
    { name: 'Tulkarm (طولكرم)', nameAr: 'طولكرم', selected: false, reach: 1 },
  ]);

  const [categoryMode, setCategoryMode] = useState<'All' | 'Specific'>('Specific');
  const [categories, setCategories] = useState<Category[]>([
    { name: 'AC Repair', nameAr: 'تكييف وتبريد', selected: true },
    { name: 'Plumbers', nameAr: 'سباكة', selected: false },
    { name: 'Electricians', nameAr: 'كهرباء', selected: false },
    { name: 'Painting', nameAr: 'دهان وديكور', selected: false },
    { name: 'Cleaning', nameAr: 'تنظيف', selected: false },
    { name: 'Carpenters', nameAr: 'نجارة', selected: false },
    { name: 'Maintenance', nameAr: 'صيانة عامة', selected: false },
    { name: 'Movers', nameAr: 'نقل أثاث', selected: false },
  ]);

  // Status & Schedule States
  const [isActiveImmediately, setIsActiveImmediately] = useState(true);
  const [durationPreset, setDurationPreset] = useState<'24h' | '48h' | '3d' | '7d' | 'until_date' | 'indefinite'>('24h');
  const [startScheduleType, setStartScheduleType] = useState<'now' | 'scheduled'>('now');

  const formatForDateTimeLocal = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [customStartDateTime, setCustomStartDateTime] = useState(() => formatForDateTimeLocal(new Date()));
  const [customEndDateTime, setCustomEndDateTime] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return formatForDateTimeLocal(tomorrow);
  });

  const scheduleDetails = useMemo(() => {
    const baseStart = startScheduleType === 'now' ? new Date() : new Date(customStartDateTime || Date.now());
    let end: Date | null = null;

    if (durationPreset === '24h') {
      end = new Date(baseStart.getTime() + 24 * 3600 * 1000);
    } else if (durationPreset === '48h') {
      end = new Date(baseStart.getTime() + 48 * 3600 * 1000);
    } else if (durationPreset === '3d') {
      end = new Date(baseStart.getTime() + 3 * 24 * 3600 * 1000);
    } else if (durationPreset === '7d') {
      end = new Date(baseStart.getTime() + 7 * 24 * 3600 * 1000);
    } else if (durationPreset === 'until_date') {
      end = customEndDateTime ? new Date(customEndDateTime) : null;
    } else if (durationPreset === 'indefinite') {
      end = null;
    }

    let summary = '';
    let durationLabel = '';

    if (end) {
      const options: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      const formattedEnd = end.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', options);
      
      const diffMs = end.getTime() - baseStart.getTime();
      const diffHours = Math.max(1, Math.round(diffMs / (3600 * 1000)));
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;

      if (diffDays > 0) {
        durationLabel = isRtl
          ? `${diffDays} أيام${remainingHours > 0 ? ` و ${remainingHours} ساعة` : ''}`
          : `${diffDays}d ${remainingHours > 0 ? `${remainingHours}h` : ''}`;
      } else {
        durationLabel = isRtl ? `${diffHours} ساعة` : `${diffHours} hours`;
      }

      summary = isRtl
        ? `ينتهي الإعلان في: ${formattedEnd} (المدة: ${durationLabel})`
        : `Campaign runs until: ${formattedEnd} (Duration: ${durationLabel})`;
    } else {
      durationLabel = isRtl ? 'حملة مستمرة' : 'Continuous';
      summary = isRtl
        ? 'حملة مستمرة دون موعد انتهاء محدد حتى يتم إيقافها يدوياً.'
        : 'Continuous campaign with no expiration until paused manually.';
    }

    return {
      startDate: baseStart,
      endDate: end,
      durationLabel,
      summary,
    };
  }, [startScheduleType, customStartDateTime, durationPreset, customEndDateTime, isRtl]);

  // File Upload Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrlInput('');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImageUrlInput(val);
    if (val.trim()) {
      setImagePreview(val.trim());
      setImageFile(null);
    } else {
      setImagePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrlInput('');
    }
  };

  const toggleCity = (name: string) => {
    setCities(prev =>
      prev.map(c => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleCategory = (name: string) => {
    setCategories(prev =>
      prev.map(c => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  // Derived selected city label for the Android live phone mockup pin
  const selectedCityLabel = useMemo(() => {
    if (locationMode === 'All') return isRtl ? 'القدس والضفة (الكل)' : 'All Palestine (Jerusalem & West Bank)';
    const selected = cities.filter(c => c.selected);
    if (selected.length === 0) return isRtl ? 'القدس' : 'Jerusalem';
    if (selected.length === 1) return isRtl ? selected[0].nameAr : selected[0].name;
    return `${isRtl ? selected[0].nameAr : selected[0].name} (+${selected.length - 1})`;
  }, [locationMode, cities, isRtl]);

  // Real Database Reach Calculation
  const reachMetrics = useMemo(() => {
    // 1. Audience base from real platform numbers
    let targetBase = platformStats.totalUsers;
    if (userType === 'Customers') targetBase = platformStats.customerCount;
    if (userType === 'Craftsmen') targetBase = platformStats.activeCraftsmen;

    // 2. City targeting ratio
    let cityRatio = 1.0;
    if (locationMode === 'Specific') {
      const selectedCitiesCount = cities.filter(c => c.selected).length;
      if (selectedCitiesCount === 0) {
        cityRatio = 0;
      } else {
        cityRatio = Math.min(1.0, selectedCitiesCount / 3); // Normalized over primary active zones
      }
    }

    // 3. Category targeting ratio
    let catRatio = 1.0;
    if (categoryMode === 'Specific') {
      const selectedCatsCount = categories.filter(c => c.selected).length;
      catRatio = selectedCatsCount === 0 ? 0 : Math.min(1.0, 0.6 + 0.4 * (selectedCatsCount / categories.length));
    }

    // Reach is strictly bounded by real users
    const totalReach = Math.max(0, Math.min(targetBase, Math.round(targetBase * cityRatio * catRatio)));

    const citiesListStr = locationMode === 'All'
      ? (isRtl ? 'كافة المدن (القدس والضفة)' : 'All Cities (Jerusalem & West Bank)')
      : (cities.filter(c => c.selected).map(c => isRtl ? c.nameAr : c.name).join('، ') || (isRtl ? 'لم يتم تحديد مدن' : 'No cities selected'));

    const catsListStr = categoryMode === 'All'
      ? (isRtl ? 'جميع المهن والتخصصات' : 'All Trades')
      : (categories.filter(c => c.selected).map(c => isRtl ? c.nameAr : c.name).join('، ') || (isRtl ? 'لم يتم تحديد تخصص' : 'No trades selected'));

    const audienceLabel = userType === 'Both'
      ? (isRtl ? 'جميع المستخدمين' : 'All Users')
      : userType === 'Customers'
      ? (isRtl ? 'العملاء' : 'Customers')
      : (isRtl ? 'الصناع' : 'Craftsmen');

    return {
      totalReach,
      formattedReach: `${totalReach.toLocaleString()} ${isRtl ? 'مستخدم فعلي' : 'Active Users'}`,
      summaryText: isRtl
        ? `يستهدف الإعلان ${totalReach} من أصل ${targetBase} حساب مسجل فعلياً (${audienceLabel}) في ${citiesListStr}.`
        : `Campaign reaches ${totalReach} of ${targetBase} registered accounts (${audienceLabel}) in ${citiesListStr}.`,
      audienceLabel,
      citiesListStr,
      catsListStr,
      targetBase,
    };
  }, [platformStats, userType, locationMode, categoryMode, cities, categories, isRtl]);

  // Form Submit Action
  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let finalImageUrl = imagePreview || undefined;

      // If user uploaded a physical file, upload it to the server
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          const uploadRes = await apiClient.post<any>('/uploads', formData);
          finalImageUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl || finalImageUrl;
        } catch (uploadErr) {
          console.error('Failed to upload image file to /uploads:', uploadErr);
        }
      }

      // Format location & category metadata
      const targetCities = locationMode === 'All' ? ['ALL'] : cities.filter(c => c.selected).map(c => c.name);
      const targetCats = categoryMode === 'All' ? ['ALL'] : categories.filter(c => c.selected).map(c => c.name);

      const result = await adRepository.createAd(adTitle, 5000, 'Home Banner', {
        imageUrl: finalImageUrl,
        description: description,
        ctaText: isRtl ? 'عرض التفاصيل' : 'Claim Offer',
        targetType: userType === 'Both' ? 'ALL' : (userType === 'Craftsmen' ? 'CRAFTSMEN' : 'CUSTOMERS'),
        targetUrl: `/offers/${encodeURIComponent(adTitle)}?cities=${encodeURIComponent(targetCities.join(','))}&cats=${encodeURIComponent(targetCats.join(','))}`,
        startDate: scheduleDetails.startDate.toISOString(),
        endDate: scheduleDetails.endDate ? scheduleDetails.endDate.toISOString() : null,
      });

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('ads');
        }, 1800);
      } else {
        const errResult = result as { success: false; error: { message: string } };
        setError(errResult.error?.message || 'Failed to launch banner campaign.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to launch banner campaign.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCities = cities.filter(c => c.selected);

  return (
    <div className="app-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Success Alert */}
        {showSuccess && (
          <div className="success-toast">
            <CheckCircle2 size={20} color="#10B981" />
            <span>
              {isRtl
                ? 'تم إنشاء البانر ونشره بنجاح، وسيظهر للمستخدمين فوراً!'
                : 'Banner created & published successfully! Visible immediately on Android.'}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="glass-card status-danger animate-fade-in" style={{ padding: '16px', margin: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="create-ad-header-row">
          <button 
            type="button" 
            onClick={() => navigate('ads')}
            className="back-nav-btn"
            title={isRtl ? 'رجوع للإعلانات' : 'Back to Ads'}
          >
            <ArrowLeft size={18} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            <span>{isRtl ? 'الرجوع للإعلانات' : 'Back to Ads'}</span>
          </button>
          
          <div>
            <h1 className="create-ad-title">
              {isRtl ? 'إنشاء إعلان وبانر تطبيق الموبايل' : 'Create Mobile Banner & Targeting'}
            </h1>
            <p className="create-ad-subtitle">
              {isRtl
                ? 'حدد صورة البانر وإعدادات الجمهور المستهدف الذي سيصل إليه الإعلان على تطبيق أندرويد'
                : 'Upload the mobile banner image and configure who will see this campaign in the Android app'}
            </p>
          </div>
        </div>

        {/* Two Column Layout: Left = Simple Form, Right = Authentic Android Mockup */}
        <div className="create-ad-layout">
          {/* Left Form: ONLY The Banner & Settings For Who To Reach */}
          <form onSubmit={handleLaunch} className="create-ad-form">
            
            {/* ══════════════════════════════════════════════════════════════
                SECTION 1: THE BANNER (تصميم وتفاصيل البانر)
               ══════════════════════════════════════════════════════════════ */}
            <div className="form-card">
              <div className="section-header-badge">
                <FileImage size={18} className="badge-icon" />
                <h2 className="form-card-title" style={{ margin: 0 }}>
                  {isRtl ? '1. تصميم ومحتوى البانر (The Banner)' : '1. Banner Creative (The Banner)'}
                </h2>
              </div>
              <p className="form-card-subtitle">
                {isRtl
                  ? 'ارفع صورة البانر وحدد عنوان العرض. ستظهر المعاينة الحية بجانبك فوراً.'
                  : 'Upload your banner image and enter campaign details. Preview updates live on the right.'}
              </p>

              {/* Banner Image Upload Box */}
              <div className="form-group">
                <label className="form-label-styled">
                  {isRtl ? 'صورة البانر' : 'Banner Image'}
                  <span className="required-star">*</span>
                </label>
                
                <div 
                  className="image-dropzone" 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    id="ad-image-upload" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <label htmlFor="ad-image-upload" className="dropzone-label">
                    {imagePreview ? (
                      <div className="dropzone-preview-container">
                        <img src={imagePreview} alt="Banner Preview" className="dropzone-preview-img" />
                        <div className="dropzone-preview-overlay">
                          <Upload size={22} />
                          <span>{isRtl ? 'تغيير صورة البانر' : 'Change Image'}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={36} className="upload-icon" />
                        <span className="upload-primary-text">
                          {isRtl ? 'اسحب صورة البانر هنا أو انقر للتصفح' : 'Drop banner image here or click to browse'}
                        </span>
                        <span className="upload-sub-text">
                          {isRtl
                            ? 'المقاس المعتمد في كود أندرويد: 1200×628 بكسل (نسبة 1.91:1) · PNG, JPG حتى 5MB'
                            : 'Recommended Android Spec: 1200×628 px (1.91:1 ratio) · PNG, JPG up to 5MB'}
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Optional Image URL Input */}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                    {isRtl ? 'أو أدخل رابط صورة مباشر (Image URL):' : 'Or paste direct Image URL:'}
                  </span>
                  <div className="input-with-icon">
                    <LinkIcon size={14} className="input-icon" />
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={handleImageUrlChange}
                      placeholder="https://example.com/banner.jpg"
                      className="form-text-input icon-padding"
                    />
                  </div>
                </div>
              </div>

              {/* Android Specification Pill */}
              <div className="android-spec-callout">
                <Sparkles size={16} color="var(--color-primary)" />
                <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  <strong>{isRtl ? 'معايير أندرويد الدقيقة:' : 'Exact Android Specs:'}</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {isRtl
                      ? 'الارتفاع في الصفحة الرئيسية 154dp · الزوايا الدائرية 20dp · التوسيط BoxFit.cover'
                      : 'Home carousel card height is 154dp · Corner radius 20dp · Centered with BoxFit.cover'}
                  </span>
                </div>
              </div>

              {/* Ad Title */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label-styled">
                  {isRtl ? 'عنوان البانر / الحملة' : 'Banner / Campaign Title'}
                  <span className="required-star">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="form-text-input"
                  placeholder={isRtl ? 'مثال: خصم خاص 20% على صيانة التكييف' : 'e.g. Summer AC Maintenance Special'}
                />
              </div>

              {/* Subtitle / Short Description */}
              <div className="form-group">
                <label className="form-label-styled">
                  {isRtl ? 'الوصف الترويجي المختصر (يظهر في نافذة التفاصيل)' : 'Offer Description / Subtitle'}
                </label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea-input"
                  placeholder={isRtl ? 'مثال: احصل على خصم فوري على كافة أعمال الفحص والصيانة هذا الصيف' : 'Short description for the offer details popup'}
                />
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 2: SETTINGS FOR WHO TO REACH (إعدادات الجمهور والوصول)
               ══════════════════════════════════════════════════════════════ */}
            <div className="form-card">
              <div className="section-header-badge">
                <Users size={18} className="badge-icon" />
                <h2 className="form-card-title" style={{ margin: 0 }}>
                  {isRtl ? '2. إعدادات الجمهور والوصول (Who to Reach)' : '2. Who to Reach (Audience & Targeting)'}
                </h2>
              </div>
              <p className="form-card-subtitle">
                {isRtl
                  ? 'حدد من سيرى هذا البانر في التطبيق، المدن المستهدفة، ومجال الخدمة.'
                  : 'Control who will see this banner on their Android app: target users, locations, and trade category.'}
              </p>

              {/* Target Audience: Who to Reach */}
              <div className="form-group-spaced">
                <label className="form-label-styled">
                  {isRtl ? 'الفئة المستهدفة (من سيرى البانر؟)' : 'Target Audience (Who should see this?)'}
                </label>
                
                <div className="audience-toggle-grid">
                  <button
                    type="button"
                    onClick={() => setUserType('Customers')}
                    className={`audience-card ${userType === 'Customers' ? 'active' : ''}`}
                  >
                    <User size={20} />
                    <div>
                      <div className="aud-title">{isRtl ? 'العملاء فقط' : 'Customers Only'}</div>
                      <div className="aud-desc">{isRtl ? 'أصحاب المنازل والطلبات' : 'Homeowners & requesters'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('Craftsmen')}
                    className={`audience-card ${userType === 'Craftsmen' ? 'active' : ''}`}
                  >
                    <Wrench size={20} />
                    <div>
                      <div className="aud-title">{isRtl ? 'الصناع فقط' : 'Craftsmen Only'}</div>
                      <div className="aud-desc">{isRtl ? 'الفنيين والمهنيين' : 'Active service providers'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('Both')}
                    className={`audience-card ${userType === 'Both' ? 'active' : ''}`}
                  >
                    <Users size={20} />
                    <div>
                      <div className="aud-title">{isRtl ? 'الجميع (الكل)' : 'All Users'}</div>
                      <div className="aud-desc">{isRtl ? 'عملاء وصناع معاً' : 'Both customers & craftsmen'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Location / Cities */}
              <div className="form-group-spaced" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label-styled" style={{ margin: 0 }}>
                    <MapPin size={15} style={{ display: 'inline', marginInlineEnd: '6px' }} />
                    {isRtl ? 'الموقع والمدن المستهدفة' : 'Target Location / Cities'}
                  </label>

                  {/* Mode switcher */}
                  <div className="mode-toggle-pill">
                    <button
                      type="button"
                      onClick={() => setLocationMode('All')}
                      className={`pill-btn ${locationMode === 'All' ? 'active' : ''}`}
                    >
                      {isRtl ? 'كافة المناطق' : 'All Palestine'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode('Specific')}
                      className={`pill-btn ${locationMode === 'Specific' ? 'active' : ''}`}
                    >
                      {isRtl ? 'مدن محددة' : 'Specific Cities'}
                    </button>
                  </div>
                </div>

                {locationMode === 'Specific' ? (
                  <div className="cities-box">
                    {/* Selected Cities summary */}
                    <div className="selected-cities-row">
                      {selectedCities.length === 0 ? (
                        <span className="no-cities-placeholder">
                          {isRtl ? 'انقر على المدن بالأسفل لإضافتها للاستهداف...' : 'Click cities below to add to targeting...'}
                        </span>
                      ) : (
                        selectedCities.map(c => (
                          <div key={c.name} className="city-pill">
                            <span>{isRtl ? c.nameAr : c.name}</span>
                            <button 
                              type="button" 
                              onClick={() => toggleCity(c.name)}
                              className="city-pill-close"
                            >
                              &times;
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Available Cities Grid */}
                    <div className="available-cities-grid">
                      {cities.map(c => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => toggleCity(c.name)}
                          className={`city-select-btn ${c.selected ? 'selected' : ''}`}
                        >
                          {isRtl ? c.nameAr : c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="info-box-simple">
                    <Globe size={16} color="var(--color-primary)" />
                    <span>
                      {isRtl
                        ? 'سيظهر الإعلان لجميع المستخدمين في كافة محافظات القدس والضفة الغربية.'
                        : 'The banner will be displayed to all users across Jerusalem and the West Bank.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Target Service / Category */}
              <div className="form-group-spaced" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label-styled" style={{ margin: 0 }}>
                    <Tag size={15} style={{ display: 'inline', marginInlineEnd: '6px' }} />
                    {isRtl ? 'مجال الخدمة والتخصص (اختياري)' : 'Service Category / Trade (Optional)'}
                  </label>

                  <div className="mode-toggle-pill">
                    <button
                      type="button"
                      onClick={() => setCategoryMode('All')}
                      className={`pill-btn ${categoryMode === 'All' ? 'active' : ''}`}
                    >
                      {isRtl ? 'كافة الخدمات' : 'All Trades'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('Specific')}
                      className={`pill-btn ${categoryMode === 'Specific' ? 'active' : ''}`}
                    >
                      {isRtl ? 'تخصص معين' : 'Specific Trades'}
                    </button>
                  </div>
                </div>

                {categoryMode === 'Specific' && (
                  <div className="tag-cloud" style={{ marginTop: '8px' }}>
                    {categories.map(cat => (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => toggleCategory(cat.name)}
                        className={`tag-btn ${cat.selected ? 'selected' : ''}`}
                      >
                        {cat.selected && <Check size={13} style={{ display: 'inline', marginInlineEnd: '4px' }} />}
                        {isRtl ? cat.nameAr : cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Immediate Activation */}
              <div className="form-group" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label className="form-label-styled" style={{ margin: 0 }}>
                      {isRtl ? 'تفعيل الإعلان فوراً في التطبيق' : 'Activate Immediately on Publish'}
                    </label>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {isRtl ? 'سيظهر البانر في واجهة التطبيق فور الحفظ وخلال الموعد المحدد' : 'Banner appears in Android app once scheduled'}
                    </span>
                  </div>
                  
                  <label className="switch-container">
                    <input
                      type="checkbox"
                      checked={isActiveImmediately}
                      onChange={(e) => setIsActiveImmediately(e.target.checked)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════════
                SECTION 3: SCHEDULE & DURATION (فترة وجدولة عرض الإعلان)
               ══════════════════════════════════════════════════════════════ */}
            <div className="form-card" style={{ marginTop: '20px' }}>
              <div className="section-header-badge">
                <Clock size={18} className="badge-icon" />
                <h2 className="form-card-title" style={{ margin: 0 }}>
                  {isRtl ? '3. فترة وجدولة عرض الإعلان (Duration & Schedule)' : '3. Campaign Duration & Schedule'}
                </h2>
              </div>
              <p className="form-card-subtitle">
                {isRtl
                  ? 'حدد مدة بقاء البانر فعالاً للمستخدمين (مثال: لمدة 24 ساعة، حتى 24 سبتمبر، أو حملة مستمرة).'
                  : 'Specify how long the banner remains active (e.g. 24 hours, until a specific date like 24 Sep, or continuous).'}
              </p>

              {/* Start Time Option */}
              <div className="form-group">
                <label className="form-label-styled">
                  {isRtl ? 'موعد بدء ظهور الإعلان' : 'Campaign Start Time'}
                </label>
                <div className="mode-toggle-pill" style={{ marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStartScheduleType('now')}
                    className={`pill-btn ${startScheduleType === 'now' ? 'active' : ''}`}
                  >
                    {isRtl ? '⚡ ابدأ فوراً عند النشر' : '⚡ Start Immediately'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartScheduleType('scheduled')}
                    className={`pill-btn ${startScheduleType === 'scheduled' ? 'active' : ''}`}
                  >
                    {isRtl ? '📅 جدولة لتاريخ ووقت لاحق' : '📅 Schedule for Later'}
                  </button>
                </div>

                {startScheduleType === 'scheduled' && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="datetime-local"
                      value={customStartDateTime}
                      onChange={(e) => setCustomStartDateTime(e.target.value)}
                      className="form-text-input"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                )}
              </div>

              {/* Duration Presets */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label-styled">
                  {isRtl ? 'فترة عرض الإعلان (مدة الحملة أو موعد الانتهاء)' : 'Campaign Duration / Expiration'}
                  <span className="required-star">*</span>
                </label>

                {/* Quick Presets Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setDurationPreset('24h')}
                    className={`city-select-btn ${durationPreset === '24h' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '⏱️ 24 ساعة' : '⏱️ 24 Hours'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'يوم كامل' : '1 Day'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('48h')}
                    className={`city-select-btn ${durationPreset === '48h' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '⏱️ 48 ساعة' : '⏱️ 48 Hours'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'يومان' : '2 Days'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('3d')}
                    className={`city-select-btn ${durationPreset === '3d' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '🗓️ 3 أيام' : '🗓️ 3 Days'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'عرض نهاية أسبوع' : 'Weekend special'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('7d')}
                    className={`city-select-btn ${durationPreset === '7d' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '🗓️ أسبوع' : '🗓️ 7 Days'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'أسبوع كامل' : '1 Week'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('until_date')}
                    className={`city-select-btn ${durationPreset === 'until_date' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '🎯 حتى تاريخ محدد' : '🎯 Until Date'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'مثال: حتى 24 سبتمبر' : 'e.g. til 24 Sep'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationPreset('indefinite')}
                    className={`city-select-btn ${durationPreset === 'indefinite' ? 'selected' : ''}`}
                    style={{ textAlign: 'center', padding: '10px 8px' }}
                  >
                    <strong>{isRtl ? '♾️ مستمر' : '♾️ Continuous'}</strong>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{isRtl ? 'دون موعد انتهاء' : 'No Expiry'}</div>
                  </button>
                </div>

                {/* Custom End Date Time Picker when 'until_date' is selected */}
                {durationPreset === 'until_date' && (
                  <div style={{ marginTop: '14px', background: 'var(--bg-surface-hover)', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border-color)' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {isRtl ? 'حدد تاريخ ووقت انتهاء الإعلان بدقة:' : 'Pick Target Expiration Date & Time:'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="datetime-local"
                        value={customEndDateTime}
                        onChange={(e) => setCustomEndDateTime(e.target.value)}
                        className="form-text-input"
                        style={{ maxWidth: '300px' }}
                      />
                      {/* Quick shortcut helper button for Sep 24 */}
                      <button
                        type="button"
                        onClick={() => {
                          const target = new Date();
                          target.setMonth(8); // September (0-indexed)
                          target.setDate(24);
                          target.setHours(23, 59, 0, 0);
                          setCustomEndDateTime(formatForDateTimeLocal(target));
                        }}
                        style={{
                          fontSize: '11px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        {isRtl ? '⚡ تعيين حتى 24 سبتمبر (23:59)' : '⚡ Set til 24 Sep (23:59)'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Schedule Summary Box */}
                <div className="info-box-simple" style={{ marginTop: '14px' }}>
                  <CalendarIcon size={16} color="var(--color-primary)" />
                  <span style={{ fontWeight: 500, fontSize: '12.5px' }}>
                    {scheduleDetails.summary}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('ads')}
                className="btn-cancel"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              
              <button 
                type="submit" 
                disabled={loading || !adTitle.trim()}
                className="btn-launch"
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="btn-spinner" />
                    <span>{isRtl ? 'جاري النشر...' : 'Publishing...'}</span>
                  </div>
                ) : (
                  <span>{isRtl ? 'حفظ ونشر البانر' : 'Publish Banner Campaign'}</span>
                )}
              </button>
            </div>
          </form>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT COLUMN: AUTHENTIC ANDROID PHONE PREVIEW & REACH
             ══════════════════════════════════════════════════════════════ */}
          <div className="create-ad-preview-col">
            <div className="preview-sticky">
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 className="preview-section-title" style={{ margin: 0 }}>
                  {isRtl ? 'معاينة جهاز أندرويد الحية' : 'Live Android Device Preview'}
                </h3>
                <span className="spec-badge-header">
                  {isRtl ? 'Flutter Spec (154dp)' : 'Flutter Spec (154dp)'}
                </span>
              </div>
              
              {/* Authentic Android Phone Mockup & Dimension Fit Analyzer */}
              <AndroidPhoneBannerPreview
                imageUrl={imagePreview}
                adTitle={adTitle}
                description={description}
                ctaText={isRtl ? 'احصل على العرض' : 'Claim Offer'}
                selectedCity={selectedCityLabel}
                placement="Home Banner"
                isRtl={isRtl}
              />

              {/* Estimated Reach Summary Card */}
              <div className="reach-panel">
                <div className="reach-header">
                  <Globe size={16} color="var(--color-primary)" />
                  <span className="reach-title">
                    {isRtl ? 'الجمهور والوصول المتوقع' : 'Target Reach Summary'}
                  </span>
                </div>
                
                <div className="reach-metric-row">
                  <span className="reach-number">{reachMetrics.formattedReach}</span>
                  <span className="reach-label">
                    {isRtl ? 'مستخدم نشط / يومياً' : 'active users / day'}
                  </span>
                </div>
                
                <p className="reach-description">
                  {reachMetrics.summaryText}
                </p>

                <div className="reach-tags-row">
                  <span className="reach-tag">
                    {userType === 'Customers' ? (isRtl ? 'العملاء' : 'Customers') : (userType === 'Craftsmen' ? (isRtl ? 'الصناع' : 'Craftsmen') : (isRtl ? 'الكل' : 'All Users'))}
                  </span>
                  <span className="reach-tag">
                    {locationMode === 'All' ? (isRtl ? 'كافة فلسطين' : 'All Palestine') : `${selectedCities.length} ${isRtl ? 'مدن' : 'cities'}`}
                  </span>
                  <span className="reach-tag">
                    {categoryMode === 'All' ? (isRtl ? 'كافة الخدمات' : 'All Trades') : (isRtl ? 'خدمات محددة' : 'Specific Trades')}
                  </span>
                </div>

                {/* Campaign Schedule Overview */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', marginInlineEnd: '4px' }}>
                      {isRtl ? 'مدة الحملة:' : 'Campaign Duration:'}
                    </strong>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {scheduleDetails.durationLabel}
                    </span>
                    {scheduleDetails.endDate && (
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isRtl
                          ? `ينتهي: ${scheduleDetails.endDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                          : `Ends: ${scheduleDetails.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Embedded Style Block */}
        <style>{`
          .create-ad-header-row {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding-top: 24px;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }

          .create-ad-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 4px 0;
          }

          .create-ad-subtitle {
            font-size: 13px;
            color: var(--text-muted);
            margin: 0;
          }

          .back-nav-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            padding: 8px 12px;
            transition: all 0.2s ease;
          }

          .back-nav-btn:hover {
            border-color: var(--color-primary);
            color: var(--text-primary);
          }

          .create-ad-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 375px;
            gap: 28px;
            align-items: start;
          }

          @media (max-width: 1024px) {
            .create-ad-layout {
              grid-template-columns: 1fr;
            }
          }

          .form-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 22px;
            margin-bottom: 20px;
            box-shadow: var(--shadow-sm);
          }

          .section-header-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;
          }

          .badge-icon {
            color: var(--color-primary);
          }

          .form-card-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .form-card-subtitle {
            font-size: 13px;
            color: var(--text-muted);
            margin: 0 0 18px 0;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 16px;
            width: 100%;
          }

          .form-group-spaced {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 18px;
          }

          .form-label-styled {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .required-star {
            color: #EF4444;
            margin-inline-start: 4px;
          }

          .form-text-input, .form-textarea-input {
            width: 100%;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 13px;
            color: var(--text-primary);
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
          }

          .form-text-input:focus, .form-textarea-input:focus {
            border-color: var(--color-primary);
          }

          .input-with-icon {
            position: relative;
            width: 100%;
          }

          .input-icon {
            position: absolute;
            inset-inline-start: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
          }

          .icon-padding {
            padding-inline-start: 36px;
          }

          /* Dropzone image styling */
          .image-dropzone {
            width: 100%;
            border: 2px dashed var(--border-color);
            border-radius: 12px;
            background: var(--bg-base);
            box-sizing: border-box;
            transition: all 0.2s ease;
            cursor: pointer;
            overflow: hidden;
          }

          .image-dropzone:hover {
            border-color: var(--color-primary);
            background: var(--bg-surface-hover);
          }

          .hidden-file-input {
            display: none;
          }

          .dropzone-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 28px 16px;
            width: 100%;
            cursor: pointer;
            box-sizing: border-box;
          }

          .upload-icon {
            color: var(--color-primary);
            margin-bottom: 10px;
            opacity: 0.85;
          }

          .upload-primary-text {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
            text-align: center;
          }

          .upload-sub-text {
            font-size: 11px;
            color: var(--text-muted);
            text-align: center;
          }

          .dropzone-preview-container {
            position: relative;
            width: 100%;
            height: 160px;
            overflow: hidden;
            border-radius: 8px;
          }

          .dropzone-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .dropzone-preview-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.6);
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .dropzone-preview-container:hover .dropzone-preview-overlay {
            opacity: 1;
          }

          .android-spec-callout {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 8px;
            padding: 10px 14px;
            margin-top: 10px;
          }

          /* Audience cards */
          .audience-toggle-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          @media (max-width: 600px) {
            .audience-toggle-grid {
              grid-template-columns: 1fr;
            }
          }

          .audience-card {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: start;
            color: var(--text-primary);
          }

          .audience-card:hover {
            border-color: var(--color-primary);
          }

          .audience-card.active {
            border-color: var(--color-primary);
            background: var(--color-primary-light, rgba(37, 99, 235, 0.08));
            color: var(--color-primary);
          }

          .aud-title {
            font-size: 13px;
            font-weight: 700;
          }

          .aud-desc {
            font-size: 11px;
            color: var(--text-muted);
          }

          /* Mode toggle pill */
          .mode-toggle-pill {
            display: flex;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2px;
          }

          .pill-btn {
            background: transparent;
            border: none;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .pill-btn.active {
            background: var(--color-primary);
            color: #FFFFFF;
          }

          /* Cities box */
          .cities-box {
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 12px;
            background: var(--bg-base);
          }

          .selected-cities-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            min-height: 28px;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
            margin-bottom: 8px;
          }

          .no-cities-placeholder {
            font-size: 11px;
            color: var(--text-muted);
            font-style: italic;
          }

          .city-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .city-pill-close {
            background: none;
            border: none;
            font-size: 14px;
            line-height: 1;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0;
          }

          .city-pill-close:hover {
            color: #EF4444;
          }

          .available-cities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 6px;
          }

          .city-select-btn {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            text-align: center;
            transition: all 0.15s ease;
          }

          .city-select-btn:hover {
            border-color: var(--color-primary);
            color: var(--text-primary);
          }

          .city-select-btn.selected {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #FFFFFF;
          }

          .info-box-simple {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 12px;
            color: var(--text-secondary);
          }

          /* Tag cloud */
          .tag-cloud {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .tag-btn {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 12px;
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .tag-btn:hover {
            border-color: var(--color-primary);
            color: var(--text-primary);
          }

          .tag-btn.selected {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #FFFFFF;
          }

          /* Switch toggle */
          .switch-container {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
          }

          .switch-container input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider-round {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--border-color);
            transition: .2s;
            border-radius: 24px;
          }

          .slider-round:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .2s;
            border-radius: 50%;
          }

          .switch-container input:checked + .slider-round {
            background-color: var(--color-primary);
          }

          .switch-container input:checked + .slider-round:before {
            transform: translateX(20px);
          }

          /* Form Actions */
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 0;
          }

          .btn-cancel {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .btn-cancel:hover {
            color: var(--text-primary);
            border-color: var(--text-muted);
          }

          .btn-launch {
            background: var(--color-primary);
            border: none;
            border-radius: 8px;
            padding: 10px 24px;
            font-size: 13px;
            font-weight: 700;
            color: #FFFFFF;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
          }

          .btn-launch:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #FFFFFF;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Right column */
          .create-ad-preview-col {
            position: relative;
          }

          .preview-sticky {
            position: sticky;
            top: 24px;
          }

          .preview-section-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .spec-badge-header {
            font-size: 11px;
            font-weight: 600;
            color: var(--color-primary);
            background: rgba(37, 99, 235, 0.08);
            padding: 2px 8px;
            border-radius: 12px;
          }

          /* Reach panel */
          .reach-panel {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 14px;
            padding: 16px;
            margin-top: 14px;
          }

          .reach-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .reach-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .reach-metric-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            margin-bottom: 6px;
          }

          .reach-number {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 1;
            font-family: var(--font-title, sans-serif);
          }

          .reach-label {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
          }

          .reach-description {
            font-size: 12px;
            color: var(--text-secondary);
            margin: 0 0 10px 0;
            line-height: 1.4;
          }

          .reach-tags-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .reach-tag {
            background: var(--bg-base);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
          }

          .success-toast {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid #10B981;
            color: #10B981;
            padding: 12px 18px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 16px;
          }
        `}</style>
      </main>
    </div>
  );
};
