import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string; // tailwind max width class like 'max-w-7xl'
  noPadding?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '', maxWidth = 'max-w-7xl', noPadding = false }) => {
  return (
    <div className={`container ${maxWidth} mx-auto px-4 ${noPadding ? '' : 'py-6'} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
