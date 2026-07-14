import React, { useEffect } from 'react';
import Card from './Card';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = '',
  style = {},
  closeOnBackdropClick = true,
  showCloseButton = true,
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizes = {
    small: { maxWidth: '400px', width: '90%' },
    medium: { maxWidth: '600px', width: '90%' },
    large: { maxWidth: '800px', width: '90%' },
    xlarge: { maxWidth: '1000px', width: '90%' },
    full: { maxWidth: '95vw', width: '95vw', maxHeight: '95vh' }
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(4px)',
    ...style
  };

  const contentStyle = {
    ...sizes[size],
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative'
  };

  return (
    <div
      className={`modal-overlay ${className}`}
      style={modalStyle}
      onClick={handleBackdropClick}
      {...props}
    >
      <div className="modal-content" style={contentStyle}>
        <Card
          variant="primary"
          headerActions={
            showCloseButton && onClose ? (
              <Button
                variant="secondary"
                size="small"
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#a97fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  minWidth: 'auto',
                  padding: '6px 12px'
                }}
              >
                ✕
              </Button>
            ) : null
          }
          style={{
            margin: 0,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}
        >
          {title && (
            <div style={{
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <h2 style={{
                color: '#7ed957',
                fontSize: '1.5em',
                fontWeight: 'bold',
                margin: 0
              }}>
                {title}
              </h2>
            </div>
          )}
          <div style={{ color: '#e6e6f0' }}>
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Modal;
