import React from 'react';

const LoadingSpinner = ({ text = 'Memuat...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary-light">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4`}></div>
      <p className="text-gray text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner; 