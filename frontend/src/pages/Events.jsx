import React, { useState } from 'react';
import EventCard from '../components/EventCard';
import '../styles/layout.css';

const Events = () => {
  const [eventTypes, setEventTypes] = useState([
    { id: '1', name: '30 Minute Meeting', duration: 30, slug: '30-min', active: true },
  ]);

  return (
    <div className="events-container">
      <header className="page-header">
        <h1>Scheduling ⚙️</h1>
      </header>

      <div className="tabs">
        <button className="tab-btn active">Event types</button>
        <button className="tab-btn">Single-use links</button>
        <button className="tab-btn">Meeting polls</button>
      </div>

      <div className="search-bar-mock">
        <span>🔍</span>
        <input 
          type="text" 
          placeholder="Search event types" 
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
        />
      </div>

      <div className="profile-link-bar">
        <div className="profile-link-left">
          <div className="avatar-circle">A</div>
          <span>ai tanish</span>
        </div>
        <div>
          <button className="view-landing-page">↗ View landing page</button>
          <button style={{ background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer' }}>⋮</button>
        </div>
      </div>

      <div className="event-grid">
        {eventTypes.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Events;