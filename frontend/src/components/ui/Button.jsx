import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClass = 'omni-btn';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = size !== 'md' ? `${baseClass}--${size}` : '';
  const classes = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      data-testid={`omni-button-${variant}`}
      {...props}
    >
      {isLoading && <span className="omni-btn__spinner" />}
      {children}
    </button>
  );
};
