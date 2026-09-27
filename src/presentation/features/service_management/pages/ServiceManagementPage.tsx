import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useServiceManagement } from '../hooks/useServiceManagement';
import { PageHeader, useToast } from '../../../components/ui';

import { ServiceKpis } from '../components/ServiceKpis';
import { CategoriesSection } from '../components/CategoriesSection';
import { SubcategoriesSection } from '../components/SubcategoriesSection';
import { FieldsBuilder } from '../components/FieldsBuilder';

export const ServiceManagementPage: React.FC = () => {
  const { isRtl } = useLanguage();
  const { success, error: toastError } = useToast();

  const {
    categories,
    subcategories,
    fields,
    metrics,
    selectedSubCatCategoryId,
    setSelectedSubCatCategoryId,
    selectedFieldCategoryId,
    setSelectedFieldCategoryId,
    createCategory,
    toggleCategoryVisibility,
    createSubcategory,
    toggleSubcategoryVisibility,
    moveSubcategory,
    createField,
    deleteField,
    toggleFieldRequired,
  } = useServiceManagement();

  const activeCraftsmenVal = metrics.find((m) => m.id === 'craftsmen')?.value || 0;
  const totalTasksVal = metrics.find((m) => m.id === 'tasks')?.value || 0;

  const handleCreateCategory = async (data: {
    name: string;
    description: string;
    nameAr?: string;
    descriptionAr?: string;
  }) => {
    try {
      await createCategory(data);
      success(isRtl ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleCreateSubcategory = async (categoryId: string, name: string) => {
    try {
      await createSubcategory(categoryId, name);
      success(isRtl ? 'تم إضافة الفئة الفرعية بنجاح' : 'Subcategory created successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to create subcategory');
    }
  };

  const handleMoveSubcategory = async (subcatId: string, targetCatId: string) => {
    try {
      await moveSubcategory(subcatId, targetCatId);
      success(isRtl ? 'تم نقل الفئة الفرعية بنجاح' : 'Subcategory moved successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to move subcategory');
    }
  };

  const handleCreateField = async (
    categoryId: string,
    name: string,
    type: string,
    config?: { options?: string[] }
  ) => {
    try {
      await createField(categoryId, name, type, config);
      success(isRtl ? 'تم إضافة الحقل بنجاح' : 'Custom field added successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to add field');
    }
  };

  const handleDeleteField = async (id: string, categoryId: string) => {
    try {
      await deleteField(id, categoryId);
      success(isRtl ? 'تم حذف الحقل بنجاح' : 'Field removed successfully.');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to delete field');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        padding: 'var(--sp-4)',
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <PageHeader
        title={isRtl ? 'إدارة الخدمات والكتالوج' : 'Service & Catalog Management'}
        subtitle={
          isRtl
            ? 'إدارة الفئات والفئات الفرعية وحقول النماذج المخصصة لخدمات صُنّاع'
            : 'Configure primary categories, subcategories, and custom order fields per service.'
        }
      />

      {/* 1. KPIs & Demand Growth Insights */}
      <ServiceKpis
        categories={categories}
        activeCraftsmen={activeCraftsmenVal}
        totalRequests={totalTasksVal}
      />

      {/* 2. Categories Management Section */}
      <CategoriesSection
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onToggleVisibility={toggleCategoryVisibility}
      />

      {/* 3. Subcategories Management Section */}
      <SubcategoriesSection
        categories={categories}
        selectedCategoryId={selectedSubCatCategoryId}
        onSelectCategory={setSelectedSubCatCategoryId}
        subcategories={subcategories}
        onCreateSubcategory={handleCreateSubcategory}
        onToggleVisibility={toggleSubcategoryVisibility}
        onMoveSubcategory={handleMoveSubcategory}
      />

      {/* 4. Form Fields Schema Builder Section */}
      <FieldsBuilder
        categories={categories}
        selectedCategoryId={selectedFieldCategoryId}
        onSelectCategory={setSelectedFieldCategoryId}
        fields={fields}
        onCreateField={handleCreateField}
        onDeleteField={handleDeleteField}
        onToggleRequired={async (id, catId) => {
          await toggleFieldRequired(id, catId);
        }}
      />
    </div>
  );
};

export default ServiceManagementPage;
