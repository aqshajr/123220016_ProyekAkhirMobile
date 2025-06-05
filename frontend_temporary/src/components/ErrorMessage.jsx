import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-secondary mb-2">Oops! Terjadi Kesalahan</h3>
      <p className="text-gray text-sm mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 