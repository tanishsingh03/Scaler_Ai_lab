import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <div className="card-content">
        <div>
          <input type="checkbox" style={{ marginRight: '16px', transform: 'scale(1.2)' }} checked readOnly />
        </div>
        <div>
          <h3>{event.name}</h3>
          <p className="duration-text">{event.duration} min • Google Meet • One-on-One</p>
        </div>
      </div>
      <div className="card-footer">
        <button className="copy-link-btn">
          <span>🔗</span> Copy link
        </button>
        <button style={{ background: 'none', border: 'none', padding: '0 8px', cursor: 'pointer', fontSize: '18px' }}>
          ⋮
        </button>
      </div>
    </div>
  );
};

export default EventCard;