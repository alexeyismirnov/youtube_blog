import React from 'react';
import './DrawerToggle.css';

function DrawerToggle({ isOpen, onToggle }) {
  return (
    <button 
      className={`drawer-toggle ${isOpen ? 'drawer-toggle-open' : ''}`}
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
}

export default DrawerToggle;