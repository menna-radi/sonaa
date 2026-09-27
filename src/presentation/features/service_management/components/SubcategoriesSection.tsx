import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category, Subcategory } from '../../../../domain/entities/Category';
import {
  Card,
  DataTable,
  Column,
  Button,
  StatusPill,
  Switch,
  Modal,
  TextField,
  Select,
  SearchInput,
} from '../../../components/ui';
import { Plus, ArrowRightLeft, FolderTree } from 'lucide-react';

export interface SubcategoriesSectionProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  subcategories: Subcategory[];
  onCreateSubcategory: (categoryId: string, name: string) => Promise<void>;
  onToggleVisibility: (id: string, categoryId: string, visible: boolean) => void;
  onMoveSubcategory: (subcatId: string, targetCatId: string) => Promise<void>;
}

export const SubcategoriesSection: React.FC<SubcategoriesSectionProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  subcategories,
  onCreateSubcategory,
  onToggleVisibility,
  onMoveSubcategory,
}) => {
  const { isRtl } = useLanguage();
  const [categorySearch, setCategorySearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [newSubcatName, setNewSubcatName] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const [movingSubcat, setMovingSubcat] = useState<Subcategory | null>(null);
  const [targetCatId, setTargetCatId] = useState<string>('');
  const [submittingMove, setSubmittingMove] = useState(false);

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nameAr && c.nameAr.includes(q))
    );
  }, [categories, categorySearch]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatName.trim() || !selectedCategoryId) return;

    setSubmittingAdd(true);
    try {
      await onCreateSubcategory(selectedCategoryId, newSubcatName.trim());
      setNewSubcatName('');
      setIsAddModalOpen(false);
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingSubcat || !targetCatId) return;

    setSubmittingMove(true);
    try {
      await onMoveSubcategory(movingSubcat.id, targetCatId);
      setIsMoveModalOpen(false);
      setMovingSubcat(null);
    } finally {
      setSubmittingMove(false);
    }
  };

  const openMoveModal = (subcat: Subcategory) => {
    setMovingSubcat(subcat);
    const otherCat = categories.find((c) => c.id !== selectedCategoryId);
    setTargetCatId(otherCat ? otherCat.id : '');
    setIsMoveModalOpen(true);
  };

  const columns: Column<Subcategory>[] = [
    {
      key: 'name',
      header: isRtl ? 'اسم الفئة الفرعية' : 'Subcategory Name',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? row.nameAr || row.name : row.name}
        </span>
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
      key: 'requestCount',
      header: isRtl ? 'عدد الطلبات' : 'Requests',
      width: 120,
      render: (row) => (
        <span style={{ color: 'var(--on-surface-subtle)', fontSize: 'var(--font-xs)' }}>
          {row.requestCount || 0} {isRtl ? 'طلب' : 'orders'}
        </span>
      ),
    },
    {
      key: 'visible',
      header: isRtl ? 'مرئي' : 'Visible',
      align: 'center',
      width: 90,
      render: (row) => (
        <Switch
          checked={Boolean(row.visible)}
          onChange={(checked) =>
            onToggleVisibility(row.id, selectedCategoryId, checked)
          }
        />
      ),
    },
    {
      key: 'actions',
      header: isRtl ? 'إجراءات' : 'Actions',
      align: 'end',
      width: 100,
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openMoveModal(row)}
          icon={<ArrowRightLeft size={13} />}
        >
          {isRtl ? 'نقل' : 'Move'}
        </Button>
      ),
    },
  ];

  const targetCategoryOptions = categories
    .filter((c) => c.id !== selectedCategoryId)
    .map((c) => ({
      value: c.id,
      label: isRtl ? c.nameAr || c.name : c.name,
    }));

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'الفئات الفرعية المتخصصة' : 'Specialized Subcategories'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'تحديد الخدمات الفرعية الدقيقة المتاحة للحجز تحت كل تصنيف رئيسي'
            : 'Granular service specialties and task scopes mapped under each primary category.'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 280px) 1fr',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Left Side: Categories List Selector */}
        <div
          style={{
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: 'var(--sp-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-2)',
          }}
        >
          <SearchInput
            value={categorySearch}
            onChange={setCategorySearch}
            placeholder={isRtl ? 'تصفية الفئات...' : 'Filter category...'}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 380,
              overflowY: 'auto',
            }}
          >
            {filteredCategories.map((c) => {
              const isSelected = c.id === selectedCategoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--sp-2) var(--sp-3)',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isSelected ? 'var(--surface-base)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--on-surface)',
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: 'var(--font-xs)',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                    textAlign: 'start',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isRtl ? c.nameAr || c.name : c.name}
                  </span>
                  <span
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                      color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-subtle)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {c.subcategoriesCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Subcategories Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <FolderTree size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--on-surface)' }}>
                {isRtl
                  ? `فئات ${selectedCategory ? selectedCategory.nameAr || selectedCategory.name : ''}`
                  : `${selectedCategory ? selectedCategory.name : ''} Services`}
              </span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus size={14} />}
            >
              {isRtl ? 'إضافة فئة فرعية' : 'Add Subcategory'}
            </Button>
          </div>

          <DataTable
            columns={columns}
            rows={subcategories}
            rowKey={(row) => row.id}
          />
        </div>
      </div>

      {/* Add Subcategory Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          isRtl
            ? `إضافة فئة فرعية تحت ${selectedCategory?.nameAr || selectedCategory?.name}`
            : `Add Subcategory under ${selectedCategory?.name}`
        }
        size="md"
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <TextField
            label={isRtl ? 'اسم الفئة الفرعية' : 'Subcategory Name'}
            placeholder="e.g. Copper Pipe Repair"
            value={newSubcatName}
            onChange={(e) => setNewSubcatName(e.target.value)}
            required
            autoFocus
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <Button variant="outline" size="md" type="button" onClick={() => setIsAddModalOpen(false)} disabled={submittingAdd}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submittingAdd}>
              {isRtl ? 'إضافة الخدمة' : 'Add Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Move Subcategory Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title={
          isRtl
            ? `نقل الفئة الفرعية (${movingSubcat?.nameAr || movingSubcat?.name})`
            : `Move Subcategory (${movingSubcat?.name})`
        }
        size="md"
      >
        <form onSubmit={handleMoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
            {isRtl
              ? 'اختر الفئة الرئيسية الجديدة التي تريد نقل هذه الخدمة الفرعية إليها:'
              : 'Select the new primary service category to reassign this subcategory to:'}
          </p>

          <Select
            label={isRtl ? 'الفئة المستهدفة' : 'Target Primary Category'}
            options={targetCategoryOptions}
            value={targetCatId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetCatId(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
            <Button variant="outline" size="md" type="button" onClick={() => setIsMoveModalOpen(false)} disabled={submittingMove}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submittingMove}>
              {isRtl ? 'تأكيد النقل' : 'Confirm Move'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
