import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventTypes, updateEventType } from '../services/api';
import '../styles/layout.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState({
    title: '',
    slug: '',
    duration: 30,
    description: '',
    bufferBefore: 0,
    bufferAfter: 0,
  });

  useEffect(() => {
    getEventTypes()
      .then(events => {
        const found = events.find(e => e.id === id);
        if (found) {
          setEventData({
            title: found.title,
            slug: found.slug,
            duration: found.duration,
            description: found.description || '',
            bufferBefore: found.bufferBefore ?? 0,
            bufferAfter: found.bufferAfter ?? 0,
          });
        } else {
          setError('Event type not found.');
        }
      })
      .catch(() => setError('Failed to load event type.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateEventType(id, {
        title: eventData.title,
        slug: eventData.slug,
        duration: parseInt(eventData.duration),
        description: eventData.description || undefined,
        bufferBefore: parseInt(eventData.bufferBefore),
        bufferAfter: parseInt(eventData.bufferAfter),
      });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div className="admin-container">
      <header className="page-header" style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 24, color: 'var(--calendly-blue)', cursor: 'pointer' }}
        >
          ←
        </button>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500, margin: 0 }}>Edit Event Type</p>
          <h1 style={{ margin: 0 }}>Edit Event</h1>
        </div>
      </header>

      <div className="create-event-card">
        {error && <div className="booking-error" style={{ marginBottom: 20 }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="calendly-form">
          <div className="form-group">
            <label>Event name *</label>
            <input
              type="text"
              required
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Event link *</label>
            <div className="slug-input-wrapper">
              <span>localhost:5173/aitanish/</span>
              <input
                type="text"
                required
                value={eventData.slug}
                onChange={(e) =>
                  setEventData({
                    ...eventData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description / Instructions</label>
            <textarea
              rows="4"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <select
              value={eventData.duration}
              onChange={(e) => setEventData({ ...eventData, duration: e.target.value })}
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Buffer before event</label>
              <select
                value={eventData.bufferBefore}
                onChange={(e) => setEventData({ ...eventData, bufferBefore: e.target.value })}
              >
                <option value="0">0 min</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Buffer after event</label>
              <select
                value={eventData.bufferAfter}
                onChange={(e) => setEventData({ ...eventData, bufferAfter: e.target.value })}
              >
                <option value="0">0 min</option>
                <option value="5">5 min</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
              </select>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
