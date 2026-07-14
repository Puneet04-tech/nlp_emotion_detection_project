import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  className = '',
  style = {},
  headerStyle = {},
  bodyStyle = {},
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: {
      background: 'linear-gradient(120deg, #23272f 60%, #2a2d43 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 16px #0005',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    primary: {
      background: 'linear-gradient(120deg, #1e2235 60%, #2a2d43 100%)',
      borderRadius: '18px',
      boxShadow: '0 6px 32px #0007',
      border: '1px solid #4f8cff'
    },
    secondary: {
      background: 'linear-gradient(120deg, #2a2d43 60%, #23272f 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 16px #0005',
      border: '1px solid #a97fff'
    },
    success: {
      background: 'linear-gradient(120deg, #1a2e2a 60%, #2a4d43 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 16px rgba(16,185,129,0.2)',
      border: '1px solid #10b981'
    },
    warning: {
      background: 'linear-gradient(120deg, #2e2a1a 60%, #4d432a 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 16px rgba(245,158,11,0.2)',
      border: '1px solid #f59e0b'
    },
    danger: {
      background: 'linear-gradient(120deg, #2e1a1a 60%, #4d2a2a 100%)',
      borderRadius: '14px',
      boxShadow: '0 2px 16px rgba(239,68,68,0.2)',
      border: '1px solid #ef4444'
    }
  };

  const cardStyle = {
    color: '#e6e6f0',
    overflow: 'hidden',
    ...variants[variant],
    ...style
  };

  const defaultHeaderStyle = {
    padding: '18px 18px 0 18px',
    marginBottom: title || subtitle ? '10px' : '0'
  };

  const defaultBodyStyle = {
    padding: '0 18px 18px 18px'
  };

  return (
    <div className={`card ${variant} ${className}`} style={cardStyle} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="card-header" style={{ ...defaultHeaderStyle, ...headerStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {title && (
                <h3 style={{
                  color: '#7ed957',
                  fontWeight: 700,
                  fontSize: '1.25em',
                  marginBottom: subtitle ? '6px' : '0',
                  letterSpacing: '0.5px'
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <div style={{
                  color: '#a97fff',
                  fontSize: '1.15em',
                  fontWeight: 500
                }}>
                  {subtitle}
                </div>
              )}
            </div>
            {headerActions && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="card-body" style={{ ...defaultBodyStyle, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
};

export default Card;
