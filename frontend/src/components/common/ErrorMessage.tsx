import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 text-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-red-400 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-red-300 underline hover:text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
