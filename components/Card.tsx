import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ 
  children, 
  className = '',
  title
}) => {
  return (
    <div className={`bg-deep p-1 ${className}`}>
        {title && (
             <h3 className="text-gold font-deco text-xl mb-4 text-center border-b border-gold/30 pb-2 uppercase tracking-[0.2em]">{title}</h3>
        )}
      <div className="art-deco-border p-6 h-full relative bg-deep/50 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};