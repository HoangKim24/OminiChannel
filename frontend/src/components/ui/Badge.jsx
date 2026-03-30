import React from 'react';
import './Badge.css';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseClass = 'omni-badge';
  const variantClass = `${baseClass}--${variant}`;
  const classes = [baseClass, variantClass, className].filter(Boolean).join(' ');

  return (
    <span className={classes} data-testid={`omni-badge-${variant}`}>
      {children}
    </span>
  );
};
