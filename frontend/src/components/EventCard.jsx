import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onDelete }) => {
  const navigate = useNavigate();
  const bookingLink = `http://localhost:5173/aitanish/${event.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
  };

  // Color accent per event index (cycles through a palette)
  const accents = ['#8247f5', '#006bff', '#0ba360', '#f59e0b', '#e11d48'];
  const accent = accents[event.title.length % accents.length];

  return (
    <div className="event-card" style={{ '--accent-color': accent }}>
      <div className="event-card-accent" style={{ background: accent }} />
      <div className="card-content">
        <div>
          <input type="checkbox" style={{ marginRight: 16, transform: 'scale(1.2)' }} checked readOnly />
        </div>
        <div>
          <h3 style={{ color: accent }}>{event.title}</h3>
          <p className="duration-text">
            {event.duration} min · One-on-One
            {event.description && (
              <span style={{ display: 'block', color: '#888', fontSize: 13, marginTop: 2 }}>
                {event.description.length > 60
                  ? event.description.slice(0, 60) + '…'
                  : event.description}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="card-footer">
        <button className="copy-link-btn" onClick={copyLink} title="Copy booking link">
          🔗 Copy link
        </button>
        <button
          className="edit-event-btn"
          onClick={() => navigate(`/event-types/${event.id}/edit`)}
          title="Edit event"
        >
          ✏️
        </button>
        <button
          className="delete-event-btn"
          onClick={() => onDelete && onDelete(event.id)}
          title="Delete event"
        >
          🗑️
        </button>
        <button
          className="more-btn"
          title="More options"
          onClick={() => window.open(`/aitanish/${event.slug}`, '_blank')}
        >
          ↗
        </button>
      </div>
    </div>
  );
};

export default EventCard;