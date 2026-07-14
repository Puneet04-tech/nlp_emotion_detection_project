import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: size === 'small' ? '0.85em' : size === 'large' ? '1.1em' : '0.95em',
    padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 20px',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const variants = {
    primary: {
      background: 'linear-gradient(90deg, #4f8cff 60%, #3b82f6 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(79, 140, 255, 0.3)'
    },
    secondary: {
      background: '#23273a',
      color: '#a97fff',
      boxShadow: '0 1px 4px #0002'
    },
    success: {
      background: 'linear-gradient(90deg, #10b981 60%, #059669 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
    },
    danger: {
      background: 'linear-gradient(90deg, #ef4444 60%, #dc2626 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
    },
    warning: {
      background: 'linear-gradient(90deg, #f59e0b 60%, #d97706 100%)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
    },
    mic: {
      background: disabled ? '#666' : 'linear-gradient(90deg, #7ed957 60%, #4f8cff 100%)',
      color: disabled ? '#ccc' : '#23272f',
      boxShadow: '0 2px 8px rgba(126, 217, 87, 0.3)',
      borderRadius: '50px',
      padding: '16px 24px',
      fontSize: '1.1em'
    },
    tab: {
      background: 'transparent',
      color: '#a97fff',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '0.95em',
      minWidth: '140px',
      textAlign: 'center',
      border: 'none'
    },
    'tab-active': {
      background: 'linear-gradient(90deg, #7ed957 60%, #4f8cff 100%)',
      color: '#23272f',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '0.95em',
      minWidth: '140px',
      textAlign: 'center',
      fontWeight: '700'
    }
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`button ${variant} ${className}`}
      style={{ ...baseStyles, ...variants[variant] }}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
