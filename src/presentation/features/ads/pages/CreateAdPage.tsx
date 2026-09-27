import React, { useState, useMemo, useEffect } from 'react';
import {
  Upload,
  Clock,
  ArrowLeft,
  Users,
  MapPin,
  Tag,
  Sparkles,
  FileImage,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { apiClient } from '../../../../core/network/apiClient';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { TextField, TextArea } from '../../../components/ui/FormFields';
import { Segmented } from '../../../components/ui/Segmented';
import { useToast } from '../../../components/ui/Toast';
import { AndroidPhoneBannerPreview } from '../components/AndroidPhoneBannerPreview';
import { CityTarget, CategoryTarget } from '../types';

export const CreateAdPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { isRtl } = useLanguage();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);

  // Creative states
  const [adTitle, setAdTitle] = useState('Summer AC Maintenance Special');
  const [description, setDescription] = useState(
    '20% discount on all AC maintenance & cleaning services this season'
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Targeting states
  const [userType, setUserType] = useState<'Customers' | 'Craftsmen' | 'Both'>('Customers');
  const [locationMode, setLocationMode] = useState<'All' | 'Specific'>('Specific');
  const [categoryMode, setCategoryMode] = useState<'All' | 'Specific'>('Specific');

  const [platformStats, setPlatformStats] = useState({
    totalUsers: 11,
    activeCraftsmen: 8,
    customerCount: 5,
  });

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ metrics?: { totalUsers?: number; activeCraftsmen?: number } }>('/admin/overview-stats')
      .then((res) => {
        const data = (res as { data?: { metrics?: { totalUsers?: number; activeCraftsmen?: number } } })?.data || res;
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
      })
      .catch((err) => {
        console.warn('Could not load live stats for reach calculation:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [cities, setCities] = useState<CityTarget[]>([
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

  const [categories, setCategories] = useState<CategoryTarget[]>([
    { name: 'AC Repair', nameAr: 'تكييف وتبريد', selected: true },
    { name: 'Plumbers', nameAr: 'سباكة', selected: false },
    { name: 'Electricians', nameAr: 'كهرباء', selected: false },
    { name: 'Painting', nameAr: 'دهان وديكور', selected: false },
    { name: 'Cleaning', nameAr: 'تنظيف', selected: false },
    { name: 'Carpenters', nameAr: 'نجارة', selected: false },
    { name: 'Maintenance', nameAr: 'صيانة عامة', selected: false },
    { name: 'Movers', nameAr: 'نقل أثاث', selected: false },
  ]);

  // Duration states
  const [durationPreset, setDurationPreset] = useState<'24h' | '48h' | '3d' | '7d' | 'until_date' | 'indefinite'>('24h');
  const [customEndDateTime, setCustomEndDateTime] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  });

  const scheduleDetails = useMemo(() => {
    const baseStart = new Date();
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
    if (end) {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      const formattedEnd = end.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', options);
      summary = isRtl
        ? `ينتهي الإعلان في: ${formattedEnd}`
        : `Campaign runs until: ${formattedEnd}`;
    } else {
      summary = isRtl
        ? 'حملة مستمرة دون موعد انتهاء محدد'
        : 'Continuous campaign with no expiration';
    }

    return { startDate: baseStart, endDate: end, summary };
  }, [durationPreset, customEndDateTime, isRtl]);

  const toggleCity = (name: string) => {
    setCities((prev) =>
      prev.map((c) => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleCategory = (name: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.name === name ? { ...c, selected: !c.selected } : c))
    );
  };

  const selectedCityLabel = useMemo(() => {
    if (locationMode === 'All') return isRtl ? 'القدس والضفة (الكل)' : 'All Palestine';
    const selected = cities.filter((c) => c.selected);
    if (selected.length === 0) return isRtl ? 'القدس' : 'Jerusalem';
    if (selected.length === 1) return isRtl ? selected[0].nameAr : selected[0].name;
    return `${isRtl ? selected[0].nameAr : selected[0].name} (+${selected.length - 1})`;
  }, [locationMode, cities, isRtl]);

  const reachMetrics = useMemo(() => {
    let targetBase = platformStats.totalUsers;
    if (userType === 'Customers') targetBase = platformStats.customerCount;
    if (userType === 'Craftsmen') targetBase = platformStats.activeCraftsmen;

    let cityRatio = 1.0;
    if (locationMode === 'Specific') {
      const selectedCitiesCount = cities.filter((c) => c.selected).length;
      cityRatio = selectedCitiesCount === 0 ? 0 : Math.min(1.0, selectedCitiesCount / 3);
    }

    let catRatio = 1.0;
    if (categoryMode === 'Specific') {
      const selectedCatsCount = categories.filter((c) => c.selected).length;
      catRatio = selectedCatsCount === 0 ? 0 : Math.min(1.0, 0.6 + 0.4 * (selectedCatsCount / categories.length));
    }

    const totalReach = Math.max(0, Math.min(targetBase, Math.round(targetBase * cityRatio * catRatio)));
    return {
      totalReach,
      formattedReach: `${totalReach.toLocaleString()} ${isRtl ? 'مستخدم فعلي' : 'Active Users'}`,
      summaryText: isRtl
        ? `يستهدف الإعلان ${totalReach} من أصل ${targetBase} حساب مسجل فعلياً.`
        : `Campaign reaches ${totalReach} of ${targetBase} registered accounts.`,
    };
  }, [platformStats, userType, locationMode, categoryMode, cities, categories, isRtl]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim()) {
      toastError('Campaign title is required');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imagePreview || undefined;

      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          const uploadRes = await apiClient.post<{ fileUrl?: string; data?: { fileUrl?: string } }>('/uploads', formData);
          finalImageUrl = uploadRes?.fileUrl || uploadRes?.data?.fileUrl || finalImageUrl;
        } catch (uploadErr) {
          console.error('Failed to upload image file to /uploads:', uploadErr);
        }
      }

      const targetCities = locationMode === 'All' ? ['ALL'] : cities.filter((c) => c.selected).map((c) => c.name);
      const targetCats = categoryMode === 'All' ? ['ALL'] : categories.filter((c) => c.selected).map((c) => c.name);

      const result = await adRepository.createAd(adTitle, 5000, 'Home Banner', {
        imageUrl: finalImageUrl,
        description: description,
        ctaText: isRtl ? 'عرض التفاصيل' : 'Claim Offer',
        targetType: userType === 'Both' ? 'ALL' : userType === 'Craftsmen' ? 'CRAFTSMEN' : 'CUSTOMERS',
        targetUrl: `/offers/${encodeURIComponent(adTitle)}?cities=${encodeURIComponent(targetCities.join(','))}&cats=${encodeURIComponent(targetCats.join(','))}`,
        startDate: scheduleDetails.startDate.toISOString(),
        endDate: scheduleDetails.endDate ? scheduleDetails.endDate.toISOString() : null,
      });

      if (result.success) {
        success('Campaign launched successfully');
        setTimeout(() => {
          navigate('ads');
        }, 1200);
      } else {
        toastError(result.error?.message || 'Failed to launch campaign');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to launch campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
      <PageHeader
        title={isRtl ? 'إنشاء إعلان بانر للموبايل' : 'Create Mobile Banner Campaign'}
        subtitle={
          isRtl
            ? 'تخصيص بانر إعلاني للصفحة الرئيسية للموبايل مع معاينة فورية'
            : 'Target home feed banner ad with live device preview'
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('ads')}>
            <ArrowLeft size={14} />
            <span>{isRtl ? 'رجوع' : 'Back to Ads'}</span>
          </Button>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Left column: Form */}
        <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Creative Card */}
          <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <FileImage size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                {isRtl ? '1. التصميم الإبداعي للبانر' : '1. Banner Creative'}
              </h3>
            </div>

            <TextField
              label={isRtl ? 'عنوان الإعلان' : 'Campaign Title'}
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              placeholder="e.g. Summer AC Maintenance Special"
              required
            />

            <TextArea
              label={isRtl ? 'نص البانر / الوصف' : 'Description / Subtitle'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% discount on all AC maintenance"
              rows={2}
            />

            {/* Dropzone Image Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isRtl ? 'صورة البانر الإعلاني' : 'Banner Creative Image'}
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setImageUrlInput('');
                  }
                }}
                style={{
                  border: '2px dashed var(--border-strong, var(--border-color))',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--sp-2)',
                  background: 'var(--surface-sunken)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                onClick={() => {
                  document.getElementById('banner-file-input')?.click();
                }}
              >
                <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {imageFile ? imageFile.name : isRtl ? 'اضغط لاختيار صورة أو اسحبها هنا' : 'Click to upload or drag image'}
                  </span>
                  <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    1200×628 (1.91:1) PNG / JPG
                  </span>
                </div>
                <input
                  id="banner-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setImageUrlInput('');
                    }
                  }}
                />
              </div>

              <TextField
                label={isRtl ? 'أو أدخل رابط صورة مباشر' : 'Or enter direct image URL'}
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  if (e.target.value.trim()) {
                    setImagePreview(e.target.value.trim());
                    setImageFile(null);
                  } else {
                    setImagePreview(null);
                  }
                }}
              />
            </div>
          </Card>

          {/* Targeting Card */}
          <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                {isRtl ? '2. الجمهور المستهدف والمناطق' : '2. Target Audience & Zones'}
              </h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
                {isRtl ? 'فئة المستخدمين' : 'User Audience'}
              </label>
              <Segmented
                value={userType}
                onChange={(val) => setUserType(val as typeof userType)}
                items={[
                  { value: 'Customers', label: isRtl ? 'العملاء' : 'Customers' },
                  { value: 'Craftsmen', label: isRtl ? 'الصناع' : 'Craftsmen' },
                  { value: 'Both', label: isRtl ? 'الكل' : 'Both' },
                ]}
              />
            </div>

            {/* City selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                  <MapPin size={14} />
                  <span>{isRtl ? 'المناطق الجغرافية' : 'Geographic Zones'}</span>
                </label>
                <Segmented
                  value={locationMode}
                  onChange={(val) => setLocationMode(val as typeof locationMode)}
                  items={[
                    { value: 'All', label: isRtl ? 'الكل' : 'All' },
                    { value: 'Specific', label: isRtl ? 'تحديد' : 'Specific' },
                  ]}
                />
              </div>

              {locationMode === 'Specific' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
                  {cities.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => toggleCity(city.name)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 500,
                        border: '1px solid var(--border-color)',
                        background: city.selected ? 'var(--primary)' : 'var(--surface-base)',
                        color: city.selected ? 'var(--on-primary, #ffffff)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      {isRtl ? city.nameAr : city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                  <Tag size={14} />
                  <span>{isRtl ? 'التخصصات والمهن' : 'Categories / Trades'}</span>
                </label>
                <Segmented
                  value={categoryMode}
                  onChange={(val) => setCategoryMode(val as typeof categoryMode)}
                  items={[
                    { value: 'All', label: isRtl ? 'الكل' : 'All' },
                    { value: 'Specific', label: isRtl ? 'تحديد' : 'Specific' },
                  ]}
                />
              </div>

              {categoryMode === 'Specific' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-1)' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 500,
                        border: '1px solid var(--border-color)',
                        background: cat.selected ? 'var(--primary)' : 'var(--surface-base)',
                        color: cat.selected ? 'var(--on-primary, #ffffff)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      {isRtl ? cat.nameAr : cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reach Summary */}
            <div
              style={{
                padding: 'var(--sp-3)',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {isRtl ? 'الوصول المتوقع' : 'Estimated Real Audience'}
                </span>
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {reachMetrics.formattedReach}
                </span>
              </div>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            </div>
          </Card>

          {/* Schedule Card */}
          <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                {isRtl ? '3. مدة الحملة والجدول' : '3. Campaign Duration'}
              </h3>
            </div>

            <Segmented
              value={durationPreset}
              onChange={(val) => setDurationPreset(val as typeof durationPreset)}
              items={[
                { value: '24h', label: '24h' },
                { value: '48h', label: '48h' },
                { value: '3d', label: '3 Days' },
                { value: '7d', label: '7 Days' },
                { value: 'until_date', label: 'Until Date' },
                { value: 'indefinite', label: 'Continuous' },
              ]}
            />

            {durationPreset === 'until_date' && (
              <TextField
                label={isRtl ? 'تاريخ ووقت الانتهاء' : 'End Date & Time'}
                type="datetime-local"
                value={customEndDateTime}
                onChange={(e) => setCustomEndDateTime(e.target.value)}
              />
            )}

            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {scheduleDetails.summary}
            </span>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)' }}>
            <Button variant="outline" type="button" onClick={() => navigate('ads')} disabled={loading}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              <Sparkles size={16} />
              <span>{isRtl ? 'إطلاق الحملة الآن' : 'Launch Campaign'}</span>
            </Button>
          </div>
        </form>

        {/* Right column: Sticky Device Preview */}
        <div style={{ position: 'sticky', top: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Live Mobile App Preview
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Android 14 (360×800)
            </span>
          </div>

          <AndroidPhoneBannerPreview
            adTitle={adTitle}
            description={description}
            imageUrl={imagePreview || undefined}
            selectedCity={selectedCityLabel}
            isRtl={isRtl}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAdPage;
