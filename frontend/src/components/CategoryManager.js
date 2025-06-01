import React, { useState } from 'react';

function CategoryManager({ categories, onCreate, onDelete, onSelect }) {
  const [newCategory, setNewCategory] = useState('');

  const handleCreate = () => {
    if (newCategory.trim()) {
      onCreate(newCategory);
      setNewCategory('');
    }
  };

  return (
    <div className="category-manager">
      <h2>Manage Categories</h2>
      <div className="create-category">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
        />
        <button onClick={handleCreate}>Create</button>
      </div>
      
      <ul className="category-list">
        {categories.map((category, index) => (
          <li
            key={`${category.id}-${index}`}
            className="category-item"
            onClick={() => onSelect(category)}
          >
            <span>{category.name}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}>Delete</button>
          </li>
        ))}
        <li className="category-item" onClick={() => onSelect(null)}>
          <span>Show All Subscriptions</span>
        </li>
      </ul>
    </div>
  );
}

export default CategoryManager;