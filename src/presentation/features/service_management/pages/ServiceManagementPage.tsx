import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useServiceManagement } from '../hooks/useServiceManagement';
import { PageHeader, Button, ErrorState, EmptyState } from '../../../components/ui';
import { RefreshCw, Layers } from 'lucide-react';
import { ServiceKpis } from '../components/ServiceKpis';
import { CategoriesSection } from '../components/CategoriesSection';
import { CategoryDetail } from '../components/CategoryDetail';
import '../service_management.css';

export const ServiceManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const sm = useServiceManagement();

  return (
    <div className="ui-page">
      <PageHeader
        title={t('categories_title')}
        subtitle={t('categories_subtitle')}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            loading={sm.fetching}
            onClick={sm.refetch}
          >
            {t('btn_refresh')}
          </Button>
        }
      />

      {sm.error ? (
        <ErrorState title={t('status_error')} message={sm.error.message} onRetry={sm.refetch} />
      ) : (
        <>
          <ServiceKpis categories={sm.categories} loading={sm.loading} />
          <div className="ui-split svc-split">
            <CategoriesSection
              categories={sm.categories}
              selectedId={sm.selected?.id ?? ''}
              onSelect={sm.selectCategory}
              loading={sm.loading}
            />
            {sm.selected ? (
              <CategoryDetail
                category={sm.selected}
                categories={sm.categories}
                subcategories={sm.subcategories}
                loadingSubcategories={sm.loadingSubcategories}
                subcategoriesError={sm.subcategoriesError}
                fields={sm.fields}
                loadingFields={sm.loadingFields}
                fieldsError={sm.fieldsError}
              />
            ) : (
              !sm.loading && (
                <EmptyState
                  icon={<Layers size={20} />}
                  title={t('categories_select_title')}
                  body={t('categories_select_desc')}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceManagementPage;
