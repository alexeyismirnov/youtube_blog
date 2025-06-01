import React, { useState, useEffect } from 'react';
import { decodeHtml } from '../utils/decodeHtml';

function TimelineView({ categoryId }) {
  const [videos, setVideos] = useState([]);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/videos?categoryId=${categoryId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
          // Group videos by day
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

    fetchVideos();
  }, [categoryId]);

  // Function to group videos by day (date string)
  const groupVideosByDay = (videos) => {
    const groups = {};
    videos.forEach(video => {
      // Convert publishedAt to a date string (YYYY-MM-DD)
      const date = new Date(video.publishedAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(video);
    });
    return groups;
  };

  if (loading) {
    return <div>Loading videos...</div>;
  }

  // Sort the days in reverse chronological order
  const sortedDays = Object.keys(groupedVideos).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="timeline-view">
      <h2>Timeline View</h2>
      {sortedDays.map(day => (
        <div key={day} className="day-group">
          <h3>{new Date(day).toLocaleDateString()}</h3>
          <div className="videos">
            {groupedVideos[day].map(video => (
              <div key={video.id} className="video-item">
                <div className="video-thumbnail">
                  <img src={video.thumbnailUrl} alt={video.title} />
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
                  <p>{decodeHtml(video.channelTitle)}</p>
                  <p className="video-description">
                    {decodeHtml(video.description.substring(0, 100))}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimelineView;