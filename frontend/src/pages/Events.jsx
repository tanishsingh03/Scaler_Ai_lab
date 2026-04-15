import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { getEventTypes, deleteEventType } from '../services/api';
import '../styles/layout.css';

const Events = () => {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEventTypes();
      setEventTypes(data);
    } catch (err) {
      setError('Could not load event types. Is the backend running?');
      // Fallback to mock data so UI always works
      setEventTypes([
        { id: '1', title: '15 Minute Meeting', duration: 15, slug: '15-min' },
        { id: '2', title: '30 Minute Meeting', duration: 30, slug: '30-min' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event type?')) return;
    try {
      await deleteEventType(id);
      setEventTypes(prev => prev.filter(e => e.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  return (
    <div className="events-container">
      <header className="page-header">
        <h1>Scheduling ⚙️</h1>
      </header>

      <div className="tabs">
        <button className="tab-btn active">Event types</button>
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
          <button className="btn-primary" style={{ borderRadius: '20px', padding: '8px 16px' }} onClick={() => navigate('/event-types/new')}>
            + Create
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#e11d48', fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-light)' }}>Loading...</div>
      ) : (
        <div className="event-grid">
          {eventTypes.map(event => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;