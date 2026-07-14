import React from 'react';
import Button from './Button';

const Tab = ({
  id,
  label,
  icon,
  active = false,
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <Button
      variant={active ? 'tab-active' : 'tab'}
      className={`tab ${active ? 'active' : ''} ${className}`}
      onClick={() => onClick && onClick(id)}
      style={{
        margin: '0 6px',
        flexWrap: 'wrap',
        ...style
      }}
      {...props}
    >
      {icon && <span style={{ fontSize: '1.2em' }}>{icon}</span>}
      <span>{label}</span>
    </Button>
  );
};

export default Tab;
