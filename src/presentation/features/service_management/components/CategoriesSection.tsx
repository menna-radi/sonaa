import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category } from '../../../../domain/entities/Category';
import {
  Card,
  DataTable,
  Column,
  Button,
  StatusPill,
  Switch,
  Modal,
  TextField,
  TextArea,
  SearchInput,
} from '../../../components/ui';
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Wind,
  Truck,
  Leaf,
  Plus,
} from 'lucide-react';

export interface CategoriesSectionProps {
  categories: Category[];
  onCreateCategory: (data: {
    name: string;
    description: string;
    nameAr?: string;
    descriptionAr?: string;
  }) => Promise<void>;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onCreateCategory,
  onToggleVisibility,
}) => {
  const { isRtl } = useLanguage();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const renderCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Plumbing': return <Wrench size={16} />;
      case 'Electrical': return <Zap size={16} />;
      case 'Cleaning': return <Sparkles size={16} />;
      case 'Carpentry': return <Hammer size={16} />;
      case 'Painting': return <Paintbrush size={16} />;
      case 'AC & HVAC': return <Wind size={16} />;
      case 'Moving': return <Truck size={16} />;
      case 'Gardening': return <Leaf size={16} />;
      default: return <Wrench size={16} />;
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameAr && c.nameAr.includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreateCategory({
        name: name.trim(),
        description: description.trim() || 'Service category',
        nameAr: nameAr.trim() || undefined,
      });
      setName('');
      setNameAr('');
      setDescription('');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: isRtl ? 'الفئة الرئيسية' : 'Category',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--on-surface)',
              flexShrink: 0,
            }}
          >
            {renderCategoryIcon(row.iconName)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
              {isRtl ? row.nameAr || row.name : row.name}
            </span>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
              {isRtl ? row.descriptionAr || row.description : row.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'subcategoriesCount',
      header: isRtl ? 'الفئات الفرعية' : 'Subcategories',
      width: 140,
      render: (row) => (
        <StatusPill
          variant="neutral"
          label={
            isRtl
              ? `${row.subcategoriesCount || 0} خدمة فرعية`
              : `${row.subcategoriesCount || 0} subcategories`
          }
        />
      ),
    },
    {
      key: 'status',
      header: isRtl ? 'الحالة' : 'Status',
      width: 110,
      render: (row) => (
        <StatusPill
          variant={row.status === 'Active' ? 'success' : 'neutral'}
          dot
          label={row.status}
        />
      ),
    },
    {
      key: 'requestVolume',
      header: isRtl ? 'مستوى الطلب' : 'Demand Level',
      width: 140,
      render: (row) => (
        <StatusPill
          variant={row.requestVolume === 'High' ? 'success' : 'info'}
          label={row.requestVolume}
        />
      ),
    },
    {
      key: 'visible',
      header: isRtl ? 'مرئي للعملاء' : 'Visible',
      align: 'center',
      width: 100,
      render: (row) => (
        <Switch
          checked={Boolean(row.visible)}
          onChange={(checked) => onToggleVisibility(row.id, checked)}
        />
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--sp-4)',
          gap: 'var(--sp-3)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
            {isRtl ? 'فئات الخدمات الرئيسية' : 'Primary Service Categories'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
            {isRtl
              ? 'إدارة الخدمات العامة المعروضة للعملاء على تطبيق الهاتف في القدس'
              : 'Manage top-level service categories displayed on the customer mobile app.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div style={{ width: 220 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={isRtl ? 'بحث في الفئات...' : 'Search categories...'}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={14} />}
          >
            {isRtl ? 'فئة جديدة' : 'New Category'}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredCategories}
        rowKey={(row) => row.id}
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isRtl ? 'إضافة فئة خدمة رئيسية جديدة' : 'Add New Service Category'}
        size="md"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <TextField
            label={isRtl ? 'اسم الفئة (بالإنجليزية)' : 'Category Name (English)'}
            placeholder="e.g. Home Cleaning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label={isRtl ? 'اسم الفئة (بالعربية)' : 'Category Name (Arabic)'}
            placeholder="مثال: تنظيف منازل"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />

          <TextArea
            label={isRtl ? 'الوصف' : 'Description'}
            placeholder={isRtl ? 'وصف موجز لطبيعة الخدمة...' : 'Brief summary of services covered...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              {isRtl ? 'حفظ الفئة' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
