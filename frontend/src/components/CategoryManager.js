import React, { useState } from 'react';
import './CategoryManager.css';

function CategoryManager({ categories, onCreate, onDelete }) {
  const [newCategory, setNewCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (newCategory.trim()) {
      setIsCreating(true);
      await onCreate(newCategory);
      setNewCategory('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="category-manager">
      <div className="manager-header">
        <h3>Category Management</h3>
        <p className="manager-subtitle">Create and organize your categories</p>
      </div>
      
      <div className="create-category-section">
        <div className="create-category">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name..."
            className="category-input"
            disabled={isCreating}
          />
          <button 
            onClick={handleCreate} 
            className="create-button"
            disabled={!newCategory.trim() || isCreating}
          >
            {isCreating ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span className="button-icon">+</span>
                Create
              </>
            )}
          </button>
        </div>
      </div>
      
      {categories.length > 0 ? (
        <div className="categories-section">
          <h4>Your Categories ({categories.length})</h4>
          <div className="category-list">
            {categories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className="category-item"
              >
                <div className="category-info">
                  <span className="category-icon">📁</span>
                  <span className="category-name">{category.name}</span>
                </div>
                <button 
                  onClick={() => onDelete(category.id)}
                  className="delete-button"
                  title={`Delete ${category.name}`}
                >
                  <span className="delete-icon">🗑️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <p>No categories yet</p>
          <span className="empty-subtitle">Create your first category to organize subscriptions</span>
        </div>
      )}
    </div>
  );
}

export default CategoryManager;