import React, { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(({
  label,
  error,
  iconLeft,
  iconRight,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `omni-input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    'omni-input',
    iconLeft && 'omni-input--with-icon-left',
    iconRight && 'omni-input--with-icon-right'
  ].filter(Boolean).join(' ');

  return (
    <div className={`omni-input-container ${className}`}>
      {label && <label htmlFor={inputId} className="omni-input__label">{label}</label>}
      <div className="omni-input__wrapper">
        {iconLeft && <span className="omni-input__icon-left">{iconLeft}</span>}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-errormessage={error ? `${inputId}-error` : undefined}
          data-testid={`omni-input-${props.name || 'generic'}`}
          {...props}
        />
        {iconRight && <span className="omni-input__icon-right">{iconRight}</span>}
      </div>
      {error && (
        <span id={`${inputId}-error`} className="omni-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
