import React from 'react';

function SubscriptionList({ subscriptions, categories, assignments, onAssign }) {
  return (
    <div className="subscription-list">
      <h2>Your Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p>No subscriptions found</p>
      ) : (
        <ul>
          {subscriptions.map(sub => (
            <li key={sub.id} className="subscription-item">
              <img
                src={sub.thumbnail}
                alt={sub.title}
                className="channel-thumbnail"
              />
              <div className="channel-info">
                <h3>{sub.title}</h3>
                <p>{sub.description}</p>
              </div>
              <div className="channel-actions">
                {assignments[sub.id] ? (
                  <div>
                    <span>Assigned to: </span>
                    <span>{assignments[sub.id].name}</span>
                    <button onClick={() => onAssign(sub.id, '')}>Unassign</button>
                  </div>
                ) : (
                  <select onChange={(e) => onAssign(sub.id, e.target.value)}>
                    <option value="">Assign to category</option>
                    {categories.map(category => (
                      <option key={`${category.id}-${category.name}`} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubscriptionList;