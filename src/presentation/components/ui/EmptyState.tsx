import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

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
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`ui-error-state ${className}`}>
      <div className="ui-error-state__icon">
        <AlertCircle size={24} />
      </div>
      <div className="ui-error-state__title">{title}</div>
      <div className="ui-error-state__body">{message}</div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
