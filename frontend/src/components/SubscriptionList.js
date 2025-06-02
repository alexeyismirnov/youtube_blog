import React from 'react';
import './SubscriptionList_backup.css';

function SubscriptionList({ subscriptions, categories, assignments, onAssign }) {
  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h2>Your Subscriptions</h2>
      </div>
      
      {subscriptions.length === 0 ? (
        <div className="no-content">
          <p>No subscriptions found</p>
              </div>
      ) : (
        <div className="subscription-list">
          {subscriptions.map(sub => (
            <div 
              key={sub.id} 
              className={`subscription-card ${assignments[sub.id] ? 'assigned' : 'unassigned'}`}
            >
              <div className="card-header">
                <img
                  src={sub.thumbnail}
                  alt={sub.title}
                  className="channel-thumbnail"
                />
                <h3 className="channel-title">{sub.title}</h3>
    </div>
              
              <div className="card-body">
                <p className="channel-description">{sub.description}</p>
              </div>
              
              {/* Enhanced category tag with delete button for assigned items */}
              {assignments[sub.id] && (
                <div className="category-tag">
                  <span>{assignments[sub.id].name}</span>
                  <button 
                    className="tag-delete-button" 
                        onClick={() => onAssign(sub.id, '')}
                    title="Remove from category"
                      >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              )}
              <div className="card-footer">
                {/* Show assignment control only for unassigned items */}
                {!assignments[sub.id] && (
                  <div className="assignment-control">
                    <select
                      onChange={(e) => onAssign(sub.id, e.target.value)}
                      defaultValue=""
                      className="category-select"
                    >
                      <option value="" disabled>Assign to category</option>
                      {categories.map(category => (
                        <option key={`${category.id}-${category.name}`} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubscriptionList;