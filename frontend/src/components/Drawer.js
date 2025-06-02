import React from 'react';
import Navigation from './Navigation';
import CategoryManager from './CategoryManager';
import './Drawer.css';

function Drawer({ 
  isOpen, 
  onToggle, 
  selectedCategory, 
  onViewChange, 
  categories, 
  onCreate, 
  onDelete 
}) {
  return (
    <>
      {/* Overlay for mobile when drawer is open */}
      {isOpen && <div className="drawer-overlay" onClick={onToggle}></div>}
      
      <div className={`drawer ${isOpen ? 'drawer-open' : 'drawer-closed'}`}>
        <div className="drawer-content">
          <Navigation
            selectedCategory={selectedCategory}
            onViewChange={onViewChange}
            categories={categories}
          />
          <div className="category-manager-wrapper">
            <CategoryManager
              categories={categories}
              onCreate={onCreate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Drawer;