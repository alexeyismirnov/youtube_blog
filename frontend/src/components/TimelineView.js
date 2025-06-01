import React, { useState, useEffect } from 'react';
import { decodeHtml } from '../utils/decodeHtml';
import './TimelineView.css';

function TimelineView({ categoryId }) {
  const [videos, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'grid'

  // Fetch category info and videos
  useEffect(() => {
    if (!categoryId) return;
    
    const fetchCategoryInfo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${categoryId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCategoryInfo(data);
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/videos?categoryId=${categoryId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
          const grouped = groupVideosByDay(data);
          setGroupedVideos(grouped);
        } else {
          console.error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
  };

    fetchCategoryInfo();
    fetchVideos();
  }, [categoryId]);

  const groupVideosByDay = (videos) => {
    const groups = {};
    videos.forEach(video => {
      const date = new Date(video.publishedAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
  }
      groups[date].push(video);
    });
    return groups;
  };

  if (loading) {
  return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading timeline...</p>
                </div>
  );
}

  // Sort the days in reverse chronological order
  const sortedDays = Object.keys(groupedVideos).sort((a, b) => new Date(b) - new Date(a));
  
  const totalVideos = videos.length;
  const dateRange = sortedDays.length > 0 
    ? `${new Date(sortedDays[sortedDays.length-1]).toLocaleDateString()} - ${new Date(sortedDays[0]).toLocaleDateString()}`
    : 'No videos';

  return (
    <div className="timeline-view">
      {/* Category Header */}
      <div className="timeline-header">
        <div className="category-info">
          <h2>{categoryInfo?.name || 'Timeline View'}</h2>
          <div className="category-stats">
            <span>{totalVideos} videos</span>
            <span className="date-range">{dateRange}</span>
          </div>
        </div>
        
        <div className="view-controls">
          <button 
            className={`view-button ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <span className="material-icons">timeline</span>
            Timeline
          </button>
          <button 
            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <span className="material-icons">grid_view</span>
            Grid
          </button>
        </div>
      </div>

      {totalVideos === 0 ? (
        <div className="empty-state">
          <span className="material-icons large">videocam_off</span>
          <p>No videos found for this category</p>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          {sortedDays.map(day => (
            <div key={day} className="day-group">
              <div className="timeline-date-marker">
                <div className="date-bubble">{new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                <div className="video-count">{groupedVideos[day].length} videos</div>
              </div>
              
              <div className="videos-container">
                {groupedVideos[day].map(video => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail">
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={video.thumbnailUrl} alt={video.title} />
                        <div className="play-button">
                          <span className="material-icons">play_arrow</span>
                        </div>
                      </a>
                    </div>
                    
                    <div className="video-details">
                      <h4>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {decodeHtml(video.title)}
                        </a>
                      </h4>
                      
                      <div className="channel-info">
                        <span className="channel-name">{decodeHtml(video.channelTitle)}</span>
                        <span className="video-time">{new Date(video.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      <p className="video-description">
                        {video.description ? decodeHtml(video.description.substring(0, 120)) + (video.description.length > 120 ? '...' : '') : 'No description'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(video => (
            <div key={video.id} className="grid-video-card">
              <div className="video-thumbnail">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={video.thumbnailUrl} alt={video.title} />
                  <div className="play-button">
                    <span className="material-icons">play_arrow</span>
                  </div>
                </a>
                <div className="video-date">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="grid-video-details">
                <h4>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {decodeHtml(video.title)}
                  </a>
                </h4>
                <p className="channel-name">{decodeHtml(video.channelTitle)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelineView;