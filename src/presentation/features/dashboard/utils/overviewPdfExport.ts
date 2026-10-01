import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations } from '../../../context/LanguageContext';
import { formatMoney, formatNumber, formatRelativeTime } from '../../../../core/utils/format';
import type { Metric } from '../../../../domain/entities/Metric';
import type {
  CategoryVolume,
  PendingReport,
  VerificationSubmission,
  CohortData,
  RevenueAnalytics,
} from '../../../../domain/repositories/MetricRepository';

export interface OverviewPdfData {
  metrics: Metric[];
  categories: CategoryVolume[];
  reports: PendingReport[];
  submissions: VerificationSubmission[];
  verificationTotal: number;
  cohortData: CohortData[];
  revenueAnalytics: RevenueAnalytics | null;
}

// NOTE: PDF is rendered in English only — jsPDF cannot shape Arabic/Hebrew
// script (letters would render disconnected), so translated strings are
// resolved via the English dictionary entries with safe fallbacks.
const en = (key: string, fallback: string): string => translations[key]?.en || fallback;

const prettify = (key: string, prefix: string): string =>
  key
    .replace(new RegExp(`^${prefix}_`), '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const categoryName = (key: string): string => {
  const hit = translations[key]?.en;
  if (hit) return hit;
  const clean = prettify(key, 'cat');
  if (clean === 'Ac Tech') return 'AC Repair';
  return clean;
};

/**
 * Builds and downloads a full Overview PDF report (KPIs, revenue, categories,
 * disputes, verification queue, cohorts). All content comes from live API data
 * passed in — nothing is fabricated.
 */
export function exportOverviewPdf(data: OverviewPdfData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 0;

  const footer = (): void => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140);
      doc.text(
        `AROX Operations Portal · Confidential · Page ${i} of ${pages}`,
        margin,
        doc.internal.pageSize.getHeight() - 24
      );
    }
  };

  const section = (title: string, head: string[], body: string[][]): void => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15);
    doc.text(title, margin, y);
    y += 6;
    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      head: [head],
      body: body.length > 0 ? body : [head.map(() => '—')],
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: 40 },
      headStyles: { fillColor: [9, 9, 11], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    y = (finalY || y) + 26;
  };

  // ── Header ────────────────────────────────────────────────────────────────
  const now = new Date();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(10);
  doc.text('AROX — Overview Report', margin, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${now.toLocaleString('en-GB')} · Period: Last 7 days`, margin, 68);
  y = 92;

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const metricLabel = (m: Metric): string => en(m.nameKey, prettify(m.nameKey, 'metrics'));
  const metricValue = (m: Metric): string =>
    m.id === 'revenue' ? formatMoney(m.value, 'ILS', 'en') : formatNumber(m.value, 'en');
  section(
    'Key Metrics',
    ['Metric', 'Value'],
    data.metrics.map((m) => [metricLabel(m), metricValue(m)])
  );

  // ── Revenue ───────────────────────────────────────────────────────────────
  const revenueMetric = data.metrics.find((m) => m.id === 'revenue');
  const a = data.revenueAnalytics;
  section('Revenue', ['Indicator', 'Value'], [
    ['Revenue (MTD)', formatMoney(revenueMetric?.value || 0, 'ILS', 'en')],
    ['GMV (MTD)', `${formatNumber(a?.gmv || 0, 'en')} ILS`],
    ['Take Rate', `${a?.takeRate ?? 0}%`],
    ['Avg Order Value', formatMoney(a?.avgOrderValue || 0, 'ILS', 'en')],
    ['Dispute Rate', `${a?.disputeRate ?? 0}%`],
  ]);

  // ── Categories ────────────────────────────────────────────────────────────
  section(
    'Top Categories by Volume',
    ['Category', 'Tasks', 'Share'],
    data.categories.map((c: CategoryVolume) => [
      categoryName(c.nameKey),
      formatNumber(c.tasksCount, 'en'),
      `${c.percentage}%`,
    ])
  );

  // ── Pending disputes ──────────────────────────────────────────────────────
  section(
    'Pending Reports',
    ['Type', 'Details', 'Reported'],
    data.reports.map((r: PendingReport) => [
      en(r.typeKey, prettify(r.typeKey, 'report')),
      r.details || '—',
      r.timeKey || '—',
    ])
  );

  // ── Verification queue ────────────────────────────────────────────────────
  section(
    `Verification Queue (open: ${data.verificationTotal})`,
    ['Craftsman', 'Trade', 'Submitted'],
    data.submissions.map((s: VerificationSubmission) => [
      s.name,
      prettify(s.roleKey, 'role'),
      s.submittedAt ? formatRelativeTime(s.submittedAt, 'en') : s.timeKey || '—',
    ])
  );

  // ── Cohorts ───────────────────────────────────────────────────────────────
  section(
    'Weekly Cohorts',
    ['Week', 'New Users', 'Craftsmen', 'Tasks'],
    data.cohortData.map((c: CohortData) => [
      c.week,
      formatNumber(c.users, 'en'),
      formatNumber(c.craftsmen, 'en'),
      formatNumber(c.tasks, 'en'),
    ])
  );

  footer();
  const stamp = now.toISOString().split('T')[0];
  doc.save(`arox_overview_${stamp}.pdf`);
}

export default exportOverviewPdf;
