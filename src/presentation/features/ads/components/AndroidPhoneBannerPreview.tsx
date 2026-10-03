import './androidPhonePreview.css';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sun,
  Moon,
FileImage,
  Search,
  Bell,
Maximize2
} from 'lucide-react';

export interface AndroidPhoneBannerPreviewProps {
  imageUrl?: string | null;
  adTitle?: string;
  description?: string;
  ctaText?: string;
  selectedCity?: string;
  placement?: string;
  badgeText?: string;
  isRtl?: boolean;
}

export const AndroidPhoneBannerPreview: React.FC<AndroidPhoneBannerPreviewProps> = ({
  imageUrl,
  adTitle = 'Summer AC Repair Special',
  description = 'Get 20% off on all AC maintenance and repair services this summer.',
  ctaText = 'Book Now',
  selectedCity = 'Jerusalem (القدس)',
  badgeText = 'PROMO',
  isRtl = false,
}) => {
  // Device & Preview Controls
  const [viewMode, setViewMode] = useState<'carousel' | 'dialog'>('carousel');
  const [phoneTheme, setPhoneTheme] = useState<'light' | 'dark'>('light');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [languageMode, setLanguageMode] = useState<'ar' | 'en'>(isRtl ? 'ar' : 'en');

  // Real Image Dimensions & Fit Analysis
  const [imgNaturalWidth, setImgNaturalWidth] = useState<number | null>(null);
  const [imgNaturalHeight, setImgNaturalHeight] = useState<number | null>(null);
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) return;
    let active = true;
    const img = new Image();
    img.onload = () => {
      if (!active) return;
      setImgNaturalWidth(img.naturalWidth);
      setImgNaturalHeight(img.naturalHeight);
      setImgLoadError(false);
    };
    img.onerror = () => {
      if (!active) return;
      setImgLoadError(true);
      setImgNaturalWidth(null);
      setImgNaturalHeight(null);
    };
    img.src = imageUrl;
    return () => {
      active = false;
    };
  }, [imageUrl]);

  const effectiveNaturalWidth = imageUrl ? imgNaturalWidth : null;
  const effectiveNaturalHeight = imageUrl ? imgNaturalHeight : null;
  const effectiveLoadError = imageUrl ? imgLoadError : false;

  // Dimension & Ratio Metrics (Android Truth)
  // Android ScreenUtilInit: 375x812 dp
  // Android HomeScreen horizontal padding: 24.w each side -> 327.w available
  // Carousel Height: 154.h (dp)
  // Multi-item Carousel Card Width: (327 * 0.93) - 10 = 294.11.w (dp) -> Aspect Ratio 1.91:1
  // Single-item Carousel Card Width: 327 - 10 = 317.w (dp) -> Aspect Ratio 2.06:1
  // OfferPreviewDialog Card: AspectRatio 16:9 (1.78:1)
  const fitAnalysis = useMemo(() => {
    if (!effectiveNaturalWidth || !effectiveNaturalHeight) {
      return {
        hasImage: false,
        ratio: 0,
        ratioStr: '—',
        fitStatus: 'none' as 'none' | 'perfect' | 'acceptable' | 'poor',
        title: languageMode === 'ar' ? 'بانتظار رفع صورة البانر' : 'Awaiting Banner Image',
        message:
          languageMode === 'ar'
            ? 'المقاس المعتمد في كود أندرويد هو 1200×628 بكسل (نسبة 1.91:1) بارتفاع 154dp وزوايا دائرية 20dp.'
            : 'Android target resolution is 1200×628 px (1.91:1 ratio) with 154dp card height and 20dp rounded corners.',
        cropWarning: null,
      };
    }

    const ratio = effectiveNaturalWidth / effectiveNaturalHeight;
    const ratioStr = `${ratio.toFixed(2)} : 1`;

    // Target is 1.91 (Carousel) and 1.78 (Dialog)
    if (ratio >= 1.70 && ratio <= 2.05) {
      return {
        hasImage: true,
        ratio,
        ratioStr,
        fitStatus: 'perfect' as const,
        title: languageMode === 'ar' ? 'مقاس مثالي مطابق لتطبيق أندرويد' : 'Perfect Fit for Android',
        message:
          languageMode === 'ar'
            ? `نسبة الأبعاد (${ratioStr}) تطابق أبعاد الكاروسيل في أندرويد (1.91:1). لن يحدث أي اقتصاص غير مرغوب.`
            : `Aspect ratio (${ratioStr}) perfectly matches the Android carousel (1.91:1). No critical cropping will occur.`,
        cropWarning: null,
      };
    } else if ((ratio >= 1.45 && ratio < 1.70) || (ratio > 2.05 && ratio <= 2.35)) {
      const isTooTall = ratio < 1.70;
      return {
        hasImage: true,
        ratio,
        ratioStr,
        fitStatus: 'acceptable' as const,
        title: languageMode === 'ar' ? 'مقبول مع اقتصاص طفيف' : 'Acceptable with Minor Crop',
        message: isTooTall
          ? languageMode === 'ar'
            ? `الصورة أطول قليلاً من الموصى به (${ratioStr}). سيتم اقتصاص أجزاء بسيطة من الأعلى والأسفل بواسطة BoxFit.cover.`
            : `Image is slightly tall (${ratioStr}). Subtle vertical cropping at top/bottom via BoxFit.cover.`
          : languageMode === 'ar'
            ? `الصورة أعرض قليلاً من الموصى به (${ratioStr}). سيتم اقتصاص أجزاء بسيطة من الجانبين بواسطة BoxFit.cover.`
            : `Image is slightly wide (${ratioStr}). Subtle horizontal cropping at sides via BoxFit.cover.`,
        cropWarning: isTooTall ? 'vertical' : 'horizontal',
      };
    } else {
      const isVeryTall = ratio < 1.45;
      return {
        hasImage: true,
        ratio,
        ratioStr,
        fitStatus: 'poor' as const,
        title: languageMode === 'ar' ? 'تحذير: نسبة الأبعاد غير متطابقة' : 'Warning: High Crop Risk',
        message: isVeryTall
          ? languageMode === 'ar'
            ? `الصورة رأسية أو مربعة (${ratioStr}). سيقوم أندرويد باقتصاص ما يصل إلى 40% من محتوى الصورة العلوي والسفلي لتعبئة الارتفاع (154dp).`
            : `Image is vertical or square (${ratioStr}). Android will crop up to 40% of top and bottom content to fill the 154dp height.`
          : languageMode === 'ar'
            ? `الصورة عريضة جداً (${ratioStr}). سيتم اقتطاع أجزاء واسعة من اليمين واليسار. يوصى بـ 1200×628 بكسل.`
            : `Image is too wide (${ratioStr}). Substantial side content will be cropped out. Target 1200×628 px.`,
        cropWarning: isVeryTall ? 'heavy-vertical' : 'heavy-horizontal',
      };
    }
  }, [effectiveNaturalWidth, effectiveNaturalHeight, languageMode]);

  // Clean City Display
  const cleanCity = useMemo(() => {
    if (!selectedCity) return languageMode === 'ar' ? 'القدس' : 'Jerusalem';
    if (selectedCity.includes('(')) {
      const match = selectedCity.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return languageMode === 'ar' ? match[2] : match[1];
      }
    }
    return selectedCity;
  }, [selectedCity, languageMode]);

  const isDark = phoneTheme === 'dark';
  const isAr = languageMode === 'ar';

  return (
    <div className="android-phone-preview-container" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Top Toolbar / Mode Controls */}
      <div className="preview-control-bar">
        <div className="control-tabs">
          <button
            type="button"
            className={`control-tab-btn ${viewMode === 'carousel' ? 'active' : ''}`}
            onClick={() => setViewMode('carousel')}
            title="Home Screen Carousel"
          >
            <Smartphone size={14} />
            <span>{isAr ? 'كاروسيل الرئيسية (154dp)' : 'Home Carousel (154dp)'}</span>
          </button>
          <button
            type="button"
            className={`control-tab-btn ${viewMode === 'dialog' ? 'active' : ''}`}
            onClick={() => setViewMode('dialog')}
            title="Offer Preview Dialog (16:9)"
          >
            <Maximize2 size={14} />
            <span>{isAr ? 'نافذة التفاصيل (16:9)' : 'Detail Dialog (16:9)'}</span>
          </button>
        </div>

        <div className="control-actions">
          {/* Safe Zone Toggle */}
          <button
            type="button"
            className={`tool-icon-btn ${showSafeZone ? 'active' : ''}`}
            onClick={() => setShowSafeZone(!showSafeZone)}
            title={isAr ? 'إظهار / إخفاء خطوط الأمان والاقتصاص' : 'Toggle Safe Zone & Crop Guides'}
          >
            <Layers size={14} />
            <span className="tool-btn-text">{isAr ? 'الأمان' : 'Safe Zone'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="tool-icon-btn"
            onClick={() => setPhoneTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            className="tool-icon-btn lang-btn"
            onClick={() => setLanguageMode(isAr ? 'en' : 'ar')}
            title="Toggle Arabic / English Mockup"
          >
            {isAr ? 'EN' : 'عربي'}
          </button>
        </div>
      </div>

      {/* Real-time Fit Analysis Badge */}
      <div className={`fit-status-card status-${fitAnalysis.fitStatus}`}>
        <div className="fit-status-header">
          <div className="fit-status-icon-wrap">
            {fitAnalysis.fitStatus === 'perfect' && <CheckCircle2 size={18} className="text-success" />}
            {fitAnalysis.fitStatus === 'acceptable' && <Info size={18} className="text-warning" />}
            {fitAnalysis.fitStatus === 'poor' && <AlertTriangle size={18} className="text-danger" />}
            {fitAnalysis.fitStatus === 'none' && <FileImage size={18} className="text-muted" />}
          </div>
          <div className="fit-status-text-block">
            <div className="fit-status-headline">
              <strong>{fitAnalysis.title}</strong>
              {fitAnalysis.hasImage && (
                <span className="fit-ratio-pill">
                  {fitAnalysis.ratioStr} ({effectiveNaturalWidth}×{effectiveNaturalHeight}px)
                </span>
              )}
            </div>
            <p className="fit-status-desc">{fitAnalysis.message}</p>
          </div>
        </div>

        {/* Dimension Specs Quick Reference */}
        <div className="android-spec-chips">
          <div className="spec-chip">
            <span className="chip-label">{isAr ? 'مستهدف أندرويد' : 'Android Target'}</span>
            <span className="chip-val">1200×628 px (1.91:1)</span>
          </div>
          <div className="spec-chip">
            <span className="chip-label">{isAr ? 'أبعاد الشاشة' : 'Card Viewport'}</span>
            <span className="chip-val">294.1 × 154 dp (r: 20dp)</span>
          </div>
          <div className="spec-chip">
            <span className="chip-label">{isAr ? 'طريقة الملاءمة' : 'Image Fit'}</span>
            <span className="chip-val">BoxFit.cover</span>
          </div>
        </div>
      </div>

      {/* Realistic Android Phone Device Shell */}
      <div className="phone-device-wrapper">
        <div className={`phone-chassis ${isDark ? 'chassis-dark' : 'chassis-light'}`}>
          {/* Hardware buttons on chassis border */}
          <div className="phone-hardware-volume"></div>
          <div className="phone-hardware-power"></div>

          {/* Phone Inner Screen ScreenUtil (375x812 scaled) */}
          <div className={`phone-screen ${isDark ? 'screen-dark' : 'screen-light'}`} style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            
            {/* Camera Punch Hole Cutout & Status Bar */}
            <div className="android-status-bar">
              <div className="status-time">09:41</div>
              <div className="camera-cutout"></div>
              <div className="status-icons">
                <span className="status-text-5g">5G</span>
                <svg className="status-icon-svg" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 15l-4.5-2.81C6.58 14.15 6 13.13 6 12c0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.13-.58 2.15-1.5 3.19L12 18z" />
                </svg>
                <div className="battery-icon">
                  <div className="battery-level"></div>
                </div>
              </div>
            </div>

            {viewMode === 'carousel' ? (
              /* VIEW MODE A: Customer Home Screen with Offers Carousel */
              <div className="mobile-home-content">
                {/* Header: Greeting, Location Selector & Actions */}
                <div className="mobile-home-header">
                  <div className="header-greeting-block">
                    <span className="header-greeting-title">
                      {isAr ? 'مرحباً، محمد' : 'Hello, Mohamed'}
                    </span>
                    <div className="header-location-pill">
                      <span className="location-pin-icon">📍</span>
                      <span className="location-city-name">{cleanCity}</span>
                      <span className="location-arrow">▾</span>
                    </div>
                  </div>

                  <div className="header-action-icons">
                    <div className="header-action-btn">
                      <Search size={15} />
                    </div>
                    <div className="header-action-btn badge-container">
                      <Bell size={15} />
                      <span className="action-badge-dot"></span>
                    </div>
                  </div>
                </div>

                {/* Sonaa Pill Search Field */}
                <div className="mobile-search-pill">
                  <Search size={13} className="search-placeholder-icon" />
                  <span className="search-placeholder-text">
                    {isAr ? 'ابحث عن خدمة أو صنايعي...' : 'Search for services or craftsmen...'}
                  </span>
                </div>

                {/* Section Title: Offers / العروض المميزة */}
                <div className="section-title-row">
                  <span className="section-title-text">
                    {isAr ? 'العروض المميزة' : 'Featured Offers'}
                  </span>
                  <span className="section-badge-count">1/3</span>
                </div>

                {/* Offers Carousel Container (Exact proportional 154dp height on 375dp width) */}
                <div className="mobile-offers-carousel-viewport">
                  {/* Left Neighbor Card Peek (simulating PageView viewportFraction: 0.93) */}
                  <div className="carousel-peek-card left-peek"></div>

                  {/* Main Active Banner Card */}
                  <div className="carousel-active-card">
                    {imageUrl && !effectiveLoadError ? (
                      <div className="banner-image-wrapper">
                        <img
                          src={imageUrl}
                          alt="Banner Preview"
                          className="banner-image-element"
                        />

                        {/* Optional Safe Zone & Crop Overlay */}
                        {showSafeZone && (
                          <div className="safe-zone-overlay">
                            {fitAnalysis.cropWarning && (
                              <div className={`crop-indicator-stripe ${fitAnalysis.cropWarning}`}>
                                <span className="crop-tag">
                                  {isAr ? 'منطقة اقتصاص أندرويد' : 'Android Crop Zone'}
                                </span>
                              </div>
                            )}
                            <div className="safe-content-box">
                              <span className="safe-box-label">
                                {isAr ? 'منطقة الأمان (80%)' : '80% Safe Area'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Top Badge Overlay (e.g. SOS or PROMO) */}
                        <div className="banner-badge-tag">
                          {badgeText || (isAr ? 'عرض خاص' : 'PROMO')}
                        </div>
                      </div>
                    ) : (
                      <div className="banner-placeholder-fallback">
                        <div className="fallback-art-icon">
                          <FileImage size={32} />
                        </div>
                        <span className="fallback-primary">
                          {isAr ? 'ارفع صورة لمعاينة البانر' : 'Upload image to preview'}
                        </span>
                        <span className="fallback-secondary">1200×628 px · 1.91:1</span>
                      </div>
                    )}
                  </div>

                  {/* Right Neighbor Card Peek */}
                  <div className="carousel-peek-card right-peek"></div>
                </div>

                {/* Carousel Pagination Dots */}
                <div className="carousel-dots-row">
                  <div className="dot-pill active"></div>
                  <div className="dot-circle"></div>
                  <div className="dot-circle"></div>
                </div>

                {/* Popular Services Section Mockup */}
                <div className="section-title-row" style={{ marginTop: '14px' }}>
                  <span className="section-title-text">
                    {isAr ? 'الخدمات الشائعة' : 'Popular Services'}
                  </span>
                  <span className="section-see-all">
                    {isAr ? 'الكل' : 'See all'}
                  </span>
                </div>

                <div className="quick-services-mock-grid">
                  {[
                    { name: isAr ? 'سباكة' : 'Plumbing', icon: '🔧', color: '#0284C7' },
                    { name: isAr ? 'تكييف' : 'HVAC', icon: '❄️', color: '#0D9488' },
                    { name: isAr ? 'كهرباء' : 'Electric', icon: '⚡', color: '#EAB308' },
                    { name: isAr ? 'نجارة' : 'Carpentry', icon: '🪚', color: '#D97706' },
                  ].map((service, idx) => (
                    <div key={idx} className="service-icon-tile">
                      <div className="service-icon-circle" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                        {service.icon}
                      </div>
                      <span className="service-tile-label">{service.name}</span>
                    </div>
                  ))}
                </div>

                {/* Craftsmen Near You Mockup */}
                <div className="section-title-row" style={{ marginTop: '14px' }}>
                  <span className="section-title-text">
                    {isAr ? 'صنايعية معتمدون في منطقتك' : 'Verified Craftsmen'}
                  </span>
                </div>

                <div className="craftsman-mini-card">
                  <div className="craftsman-avatar-mock">
                    <span className="craftsman-avatar-letter">ط</span>
                    <span className="verified-badge-mini">✓</span>
                  </div>
                  <div className="craftsman-info-mock">
                    <div className="craftsman-name-row">
                      <span className="craftsman-name">
                        {isAr ? 'طارق الخطيب' : 'Tareq Al-Khatib'}
                      </span>
                      <span className="craftsman-rate">★ 4.9</span>
                    </div>
                    <span className="craftsman-trade">
                      {isAr ? 'فني تكييف وتبريد معتمد' : 'Certified HVAC Specialist'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW MODE B: Detail Dialog Mockup (OfferPreviewDialog with 16:9 ratio) */
              <div className="mobile-dialog-view-wrapper">
                <div className="dialog-backdrop-tint">
                  <div className="dialog-modal-card">
                    {/* 16:9 Banner Image */}
                    <div className="dialog-banner-aspect-box">
                      {imageUrl && !effectiveLoadError ? (
                        <img
                          src={imageUrl}
                          alt="Offer Dialog Preview"
                          className="dialog-banner-img"
                        />
                      ) : (
                        <div className="dialog-placeholder-fallback">
                          <FileImage size={32} />
                          <span>16:9 AspectRatio (OfferPreviewDialog)</span>
                        </div>
                      )}
                      <div className="dialog-badge-tag">
                        {badgeText || (isAr ? 'عرض حصري' : 'EXCLUSIVE')}
                      </div>
                    </div>

                    {/* Dialog Content Details */}
                    <div className="dialog-modal-details">
                      <h4 className="dialog-title-text">{adTitle || 'Special Offer'}</h4>
                      <p className="dialog-desc-text">
                        {description || 'Offer description will appear here inside the dialog...'}
                      </p>

                      <div className="dialog-action-buttons-row">
                        <button type="button" className="dialog-cta-primary-btn">
                          {ctaText || (isAr ? 'احجز الآن' : 'Book Now')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Android Navigation Gesture Bar */}
            <div className="android-gesture-bar-container">
              <div className="gesture-pill"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips Footer */}
      <div className="preview-footer-tips">
        <span className="tip-dot"></span>
        <span className="tip-text">
          {isAr
            ? 'المعاينة مطابقة تماماً لقياسات كود فلاتر (154dp ارتفاع، نسبة 1.91:1) مع تعتيم زوايا العرض (20dp).'
            : 'Preview strictly matches Flutter source dimensions (154dp height, 1.91:1 ratio) with 20dp border-radius.'}
        </span>
      </div>

      
    </div>
  );
};
