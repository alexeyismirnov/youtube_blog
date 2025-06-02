import React from 'react';
import './Navigation.css';

function Navigation({ selectedCategory, onViewChange, categories }) {
  return (
    <div className="navigation">
      <h3>Views</h3>
      <div className="nav-section">
        <button 
          className={`nav-item ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onViewChange(null)}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">All Subscriptions</span>
        </button>
      </div>
      
      {categories.length > 0 && (
        <div className="nav-section">
          <h4>Categories</h4>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`nav-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
              onClick={() => onViewChange(category)}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-text">{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Navigation;