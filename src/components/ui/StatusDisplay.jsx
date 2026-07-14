import React from 'react';

const StatusDisplay = ({
  status,
  message,
  icon,
  variant = 'info',
  size = 'medium',
  className = '',
  style = {},
  showIcon = true,
  ...props
}) => {
  const variants = {
    info: {
      background: 'linear-gradient(90deg, rgba(79,140,255,0.1) 0%, rgba(59,130,246,0.1) 100%)',
      border: '1px solid rgba(79,140,255,0.3)',
      color: '#4f8cff'
    },
    success: {
      background: 'linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
      border: '1px solid rgba(16,185,129,0.3)',
      color: '#10b981'
    },
    warning: {
      background: 'linear-gradient(90deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%)',
      border: '1px solid rgba(245,158,11,0.3)',
      color: '#f59e0b'
    },
    error: {
      background: 'linear-gradient(90deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.1) 100%)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#ef4444'
    },
    processing: {
      background: 'linear-gradient(90deg, rgba(169,127,255,0.1) 0%, rgba(147,51,234,0.1) 100%)',
      border: '1px solid rgba(169,127,255,0.3)',
      color: '#a97fff'
    }
  };

  const sizes = {
    small: {
      padding: '8px 12px',
      fontSize: '0.85em',
      borderRadius: '6px'
    },
    medium: {
      padding: '12px 16px',
      fontSize: '0.95em',
      borderRadius: '8px'
    },
    large: {
      padding: '16px 20px',
      fontSize: '1.1em',
      borderRadius: '10px'
    }
  };

  const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    processing: '⏳'
  };

  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '500',
    ...sizes[size],
    ...variants[variant],
    ...style
  };

  return (
    <div
      className={`status-display ${variant} ${size} ${className}`}
      style={statusStyle}
      {...props}
    >
      {showIcon && (icon || defaultIcons[variant]) && (
        <span style={{ fontSize: '1.2em', lineHeight: 1 }}>
          {icon || defaultIcons[variant]}
        </span>
      )}
      <div style={{ flex: 1 }}>
        {status && (
          <div style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.8em',
            letterSpacing: '0.5px',
            marginBottom: '2px'
          }}>
            {status}
          </div>
        )}
        {message && (
          <div style={{ lineHeight: '1.4' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDisplay;
