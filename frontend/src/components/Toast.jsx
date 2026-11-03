import React from 'react';
import { useFitness } from '../contexts/FitnessContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toasts } = useFitness();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div key={toast.id} className={`toast toast-${toast.type || 'success'}`}>
            {isError ? (
              <AlertCircle size={18} />
            ) : isInfo ? (
              <Info size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
