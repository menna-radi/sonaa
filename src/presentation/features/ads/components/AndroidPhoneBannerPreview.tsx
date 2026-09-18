import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sun,
  Moon,
  Eye,
  FileImage,
  Search,
  Bell,
  Check,
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
  placement = 'Home Banner',
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
    if (!imageUrl) {
      setImgNaturalWidth(null);
      setImgNaturalHeight(null);
      setImgLoadError(false);
      return;
    }

    setImgLoadError(false);
    const img = new Image();
    img.onload = () => {
      setImgNaturalWidth(img.naturalWidth);
      setImgNaturalHeight(img.naturalHeight);
    };
    img.onerror = () => {
      setImgLoadError(true);
      setImgNaturalWidth(null);
      setImgNaturalHeight(null);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Dimension & Ratio Metrics (Android Truth)
  // Android ScreenUtilInit: 375x812 dp
  // Android HomeScreen horizontal padding: 24.w each side -> 327.w available
  // Carousel Height: 154.h (dp)
  // Multi-item Carousel Card Width: (327 * 0.93) - 10 = 294.11.w (dp) -> Aspect Ratio 1.91:1
  // Single-item Carousel Card Width: 327 - 10 = 317.w (dp) -> Aspect Ratio 2.06:1
  // OfferPreviewDialog Card: AspectRatio 16:9 (1.78:1)
  const fitAnalysis = useMemo(() => {
    if (!imgNaturalWidth || !imgNaturalHeight) {
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

    const ratio = imgNaturalWidth / imgNaturalHeight;
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
  }, [imgNaturalWidth, imgNaturalHeight, languageMode]);

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
                  {fitAnalysis.ratioStr} ({imgNaturalWidth}×{imgNaturalHeight}px)
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
                    {imageUrl && !imgLoadError ? (
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
                      {imageUrl && !imgLoadError ? (
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

      <style>{`
        .android-phone-preview-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          font-family: inherit;
        }

        .preview-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface-hover, #F4F4F5);
          border: 1px solid var(--border-color, #E4E4E7);
          border-radius: 12px;
          padding: 6px 8px;
          gap: 8px;
        }

        .control-tabs {
          display: flex;
          gap: 4px;
          background: rgba(0,0,0,0.04);
          padding: 3px;
          border-radius: 8px;
        }

        .control-tab-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border: none;
          background: transparent;
          color: var(--text-secondary, #71717A);
          font-size: 11.5px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-tab-btn.active {
          background: var(--bg-surface, #FFFFFF);
          color: var(--text-primary, #09090B);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .control-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tool-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 8px;
          border: 1px solid var(--border-color, #E4E4E7);
          background: var(--bg-surface, #FFFFFF);
          color: var(--text-secondary, #71717A);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tool-icon-btn:hover {
          background: var(--bg-surface-hover, #F4F4F5);
          color: var(--text-primary, #09090B);
        }

        .tool-icon-btn.active {
          background: #3B82F6;
          border-color: #2563EB;
          color: #FFFFFF;
        }

        .tool-icon-btn.lang-btn {
          font-weight: 700;
          min-width: 32px;
          justify-content: center;
        }

        /* Fit Status Card */
        .fit-status-card {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid;
          transition: all 0.2s ease;
        }

        .fit-status-card.status-perfect {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.35);
        }

        .fit-status-card.status-acceptable {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.35);
        }

        .fit-status-card.status-poor {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.35);
        }

        .fit-status-card.status-none {
          background: var(--bg-surface-hover, #F4F4F5);
          border-color: var(--border-color, #E4E4E7);
        }

        .fit-status-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .fit-status-icon-wrap {
          margin-top: 2px;
        }

        .text-success { color: #10B981; }
        .text-warning { color: #F59E0B; }
        .text-danger { color: #EF4444; }
        .text-muted { color: #9CA3AF; }

        .fit-status-text-block {
          flex: 1;
        }

        .fit-status-headline {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #09090B);
        }

        .fit-ratio-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          background: rgba(0,0,0,0.08);
          border-radius: 12px;
          color: var(--text-primary, #09090B);
        }

        .fit-status-desc {
          margin: 4px 0 0 0;
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--text-secondary, #52525B);
        }

        .android-spec-chips {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed rgba(0,0,0,0.1);
          flex-wrap: wrap;
        }

        .spec-chip {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.6);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .chip-label {
          color: var(--text-muted, #71717A);
          font-size: 9.5px;
          font-weight: 500;
        }

        .chip-val {
          color: var(--text-primary, #09090B);
          font-weight: 700;
          font-size: 11px;
        }

        /* Phone Device Mockup Container */
        .phone-device-wrapper {
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }

        .phone-chassis {
          position: relative;
          width: 320px;
          border-radius: 38px;
          padding: 8px;
          box-shadow: 
            0 20px 40px -15px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(0, 0, 0, 0.1),
            inset 0 0 0 2px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .chassis-light {
          background: linear-gradient(145deg, #2D3748, #1A202C);
        }

        .chassis-dark {
          background: linear-gradient(145deg, #0F172A, #020617);
        }

        .phone-hardware-volume {
          position: absolute;
          left: -3px;
          top: 90px;
          width: 3px;
          height: 48px;
          background: #4A5568;
          border-radius: 2px 0 0 2px;
        }

        .phone-hardware-power {
          position: absolute;
          right: -3px;
          top: 105px;
          width: 3px;
          height: 32px;
          background: #4A5568;
          border-radius: 0 2px 2px 0;
        }

        .phone-screen {
          width: 100%;
          min-height: 540px;
          border-radius: 30px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: background 0.3s ease, color 0.3s ease;
          user-select: none;
        }

        .screen-light {
          background: #FFFFFF;
          color: #0F172A;
        }

        .screen-dark {
          background: #0B0F19;
          color: #F8FAFC;
        }

        /* Status Bar */
        .android-status-bar {
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .camera-cutout {
          width: 10px;
          height: 10px;
          background: #000000;
          border-radius: 50%;
          box-shadow: inset 0 0 2px rgba(255,255,255,0.2);
        }

        .status-icons {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-text-5g {
          font-size: 9.5px;
          font-weight: 800;
        }

        .battery-icon {
          width: 17px;
          height: 9px;
          border: 1.5px solid currentColor;
          border-radius: 2.5px;
          padding: 1px;
          position: relative;
        }

        .battery-icon::after {
          content: '';
          position: absolute;
          right: -3px;
          top: 2px;
          width: 2px;
          height: 3px;
          background: currentColor;
          border-radius: 0 1px 1px 0;
        }

        .battery-level {
          width: 80%;
          height: 100%;
          background: currentColor;
          border-radius: 1px;
        }

        /* Mobile Home Content */
        .mobile-home-content {
          padding: 4px 14px 14px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .mobile-home-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .header-greeting-title {
          font-size: 14.5px;
          font-weight: 800;
          display: block;
          line-height: 1.2;
        }

        .header-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          font-weight: 600;
          color: #2563EB;
          margin-top: 2px;
          cursor: pointer;
        }

        .header-action-icons {
          display: flex;
          gap: 6px;
        }

        .header-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(125, 125, 125, 0.1);
        }

        .badge-container {
          position: relative;
        }

        .action-badge-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 6px;
          height: 6px;
          background: #EF4444;
          border-radius: 50%;
          border: 1.5px solid #FFFFFF;
        }

        /* Search Pill */
        .mobile-search-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(125, 125, 125, 0.08);
          padding: 7px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }

        .search-placeholder-icon {
          color: #94A3B8;
        }

        .search-placeholder-text {
          font-size: 11px;
          color: #94A3B8;
        }

        /* Section Titles */
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .section-title-text {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .section-badge-count {
          font-size: 10px;
          color: #94A3B8;
          font-weight: 600;
        }

        .section-see-all {
          font-size: 10.5px;
          color: #2563EB;
          font-weight: 600;
          cursor: pointer;
        }

        /* Offers Carousel Viewport (Proportional to 154dp height) */
        .mobile-offers-carousel-viewport {
          position: relative;
          height: 128px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .carousel-peek-card {
          width: 14px;
          height: 116px;
          border-radius: 14px;
          background: rgba(125, 125, 125, 0.12);
          opacity: 0.6;
          flex-shrink: 0;
        }

        .carousel-active-card {
          flex: 1;
          height: 128px;
          border-radius: 17px;
          overflow: hidden;
          position: relative;
          background: #1E293B;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .banner-image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .banner-image-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .banner-badge-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: #FFFFFF;
          backdrop-filter: blur(4px);
          font-size: 9px;
          font-weight: 800;
          padding: 3px 7px;
          border-radius: 10px;
          letter-spacing: 0.3px;
        }

        /* Safe Zone Overlay */
        .safe-zone-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .safe-content-box {
          position: absolute;
          inset: 10% 8%;
          border: 1.5px dashed #10B981;
          border-radius: 10px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 4px;
          background: rgba(16, 185, 129, 0.05);
        }

        .safe-box-label {
          background: #10B981;
          color: #FFFFFF;
          font-size: 8px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 3px;
        }

        .crop-indicator-stripe {
          position: absolute;
          background: repeating-linear-gradient(
            45deg,
            rgba(239, 68, 68, 0.25),
            rgba(239, 68, 68, 0.25) 6px,
            rgba(239, 68, 68, 0.4) 6px,
            rgba(239, 68, 68, 0.4) 12px
          );
          border: 1px dashed #EF4444;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crop-indicator-stripe.vertical,
        .crop-indicator-stripe.heavy-vertical {
          inset: 0 0 auto 0;
          height: 22px;
        }

        .crop-indicator-stripe.horizontal,
        .crop-indicator-stripe.heavy-horizontal {
          inset: 0 auto 0 0;
          width: 26px;
        }

        .crop-tag {
          background: #EF4444;
          color: #FFFFFF;
          font-size: 7.5px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 3px;
        }

        /* Placeholder Fallback */
        .banner-placeholder-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1E293B, #0F172A);
          color: #94A3B8;
          gap: 6px;
          padding: 12px;
          text-align: center;
        }

        .fallback-art-icon {
          color: #64748B;
        }

        .fallback-primary {
          font-size: 11px;
          font-weight: 700;
          color: #E2E8F0;
        }

        .fallback-secondary {
          font-size: 9.5px;
          color: #64748B;
        }

        /* Carousel Dots */
        .carousel-dots-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }

        .dot-pill {
          height: 4.5px;
          border-radius: 3px;
          background: #2563EB;
          transition: all 0.2s ease;
        }

        .dot-pill.active {
          width: 15px;
        }

        .dot-circle {
          width: 4.5px;
          height: 4.5px;
          border-radius: 50%;
          background: rgba(125, 125, 125, 0.3);
        }

        /* Quick Services Grid */
        .quick-services-mock-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .service-icon-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .service-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .service-tile-label {
          font-size: 9.5px;
          font-weight: 600;
        }

        /* Craftsman Mini Card */
        .craftsman-mini-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(125, 125, 125, 0.08);
          padding: 8px 10px;
          border-radius: 12px;
        }

        .craftsman-avatar-mock {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #2563EB;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          position: relative;
        }

        .verified-badge-mini {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #10B981;
          color: #FFFFFF;
          font-size: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #FFFFFF;
        }

        .craftsman-info-mock {
          flex: 1;
        }

        .craftsman-name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .craftsman-name {
          font-size: 11px;
          font-weight: 700;
        }

        .craftsman-rate {
          font-size: 10px;
          font-weight: 700;
          color: #F59E0B;
        }

        .craftsman-trade {
          font-size: 9.5px;
          color: #94A3B8;
          display: block;
        }

        /* VIEW MODE B: DIALOG PREVIEW */
        .mobile-dialog-view-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
          position: relative;
        }

        .dialog-backdrop-tint {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          backdrop-filter: blur(2px);
        }

        .dialog-modal-card {
          width: 100%;
          border-radius: 19px;
          overflow: hidden;
          background: ${isDark ? '#1E293B' : '#FFFFFF'};
          color: ${isDark ? '#F8FAFC' : '#0F172A'};
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
        }

        .dialog-banner-aspect-box {
          width: 100%;
          aspect-ratio: 16 / 9;
          position: relative;
          background: #0F172A;
          overflow: hidden;
        }

        .dialog-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .dialog-placeholder-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #64748B;
          font-size: 10px;
          text-align: center;
          padding: 12px;
        }

        .dialog-badge-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #EF4444;
          color: #FFFFFF;
          font-size: 8.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .dialog-modal-details {
          padding: 12px;
        }

        .dialog-title-text {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 800;
        }

        .dialog-desc-text {
          margin: 0 0 12px 0;
          font-size: 10.5px;
          color: ${isDark ? '#94A3B8' : '#64748B'};
          line-height: 1.4;
        }

        .dialog-cta-primary-btn {
          width: 100%;
          padding: 8px 12px;
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Android Gesture Bar */
        .android-gesture-bar-container {
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gesture-pill {
          width: 72px;
          height: 3.5px;
          background: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
          border-radius: 2px;
        }

        /* Footer Tips */
        .preview-footer-tips {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted, #71717A);
          padding: 0 4px;
        }

        .tip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3B82F6;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
