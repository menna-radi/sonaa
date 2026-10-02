import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  body,
  description,
  action,
  className = '',
}) => {
  const content = body ?? description;
  return (
    <div className={`ui-empty-state ${className}`}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <div className="ui-empty-state__title">{title}</div>
      {content && <div className="ui-empty-state__body">{content}</div>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel,
  className = '',
}) => {
  const { t } = useLanguage();
  const heading = title ?? t('err_generic_title');
  const body = message ?? t('err_generic');
  return (
    <div className={`ui-error-state ${className}`}>
      <div className="ui-error-state__icon">
        <AlertCircle size={24} />
      </div>
      <div className="ui-error-state__title">{heading}</div>
      <div className="ui-error-state__body">{body}</div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          {retryLabel ?? t('btn_retry')}
        </Button>
      )}
    </div>
  );
};
