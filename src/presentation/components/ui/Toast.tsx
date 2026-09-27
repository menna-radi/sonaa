import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: React.ReactNode;
}

interface ToastContextType {
  toast: (message: React.ReactNode, type?: ToastType) => void;
  success: (message: React.ReactNode) => void;
  error: (message: React.ReactNode) => void;
  info: (message: React.ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: React.ReactNode, type: ToastType = 'info') => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((msg: React.ReactNode) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: React.ReactNode) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg: React.ReactNode) => addToast(msg, 'info'), [addToast]);

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={16} color="var(--danger)" />;
      case 'info':
      default:
        return <Info size={16} color="var(--info)" />;
    }
  };

  const portalContent =
    toasts.length > 0 && typeof document !== 'undefined'
      ? createPortal(
          <div className="ui-toast-container">
            {toasts.map((t) => (
              <div key={t.id} className="ui-toast">
                {renderIcon(t.type)}
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    opacity: 0.7,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {portalContent}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
