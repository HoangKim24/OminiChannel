import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg, xl
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="omni-modal-overlay" onClick={onClose} data-testid="omni-modal-overlay">
      <div 
        className={`omni-modal omni-modal--${size} ${className}`} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="omni-modal__header">
          <h2 id="modal-title" className="omni-modal__title">{title}</h2>
          <button className="omni-modal__close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="omni-modal__body">
          {children}
        </div>
        
        {footer && (
          <div className="omni-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
