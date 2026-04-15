import React, { useState, useEffect } from 'react';
import '../styles/layout.css';
import { getBookings, cancelBooking } from '../services/api';

const MOCK = [
  { id: '1', inviteeName: 'John Doe', inviteeEmail: 'john@example.com', startTime: new Date(Date.now() + 3*24*3600*1000).toISOString(), eventType: { title: '30 Minute Meeting', duration: 30 }, status: 'SCHEDULED' },
  { id: '2', inviteeName: 'Jane Smith', inviteeEmail: 'jane@example.com', startTime: new Date(Date.now() - 5*24*3600*1000).toISOString(), eventType: { title: '15 Minute Meeting', duration: 15 }, status: 'SCHEDULED' },
];

const Meetings = () => {
  const [tab, setTab] = useState('upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetings = async (filter) => {
    setLoading(true);
    try {
      const data = await getBookings(filter);
      setMeetings(data);
    } catch {
      // Fallback to mock
      const now = new Date();
      setMeetings(MOCK.filter(m => filter === 'upcoming'
        ? new Date(m.startTime) >= now
        : new Date(m.startTime) < now));
      setError('Showing demo data. Start the backend to see real meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeetings(tab); }, [tab]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this meeting?')) return;
    try {
      await cancelBooking(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to cancel. Is the backend running?');
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (iso, duration) => {
    const start = new Date(iso);
    const end = new Date(start.getTime() + duration * 60000);
    return `${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="admin-container">
      <header className="page-header" style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
        <h1 style={{ fontSize: 24 }}>Meetings</h1>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 4 }}>
          <span>⬇</span> Export
        </button>
      </header>

      <div className="tabs" style={{ marginBottom: 0 }}>
        {['upcoming', 'past'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 8px 8px', minHeight: 400 }}>
        {error && <p style={{ padding: '12px 30px', color: '#e11d48', fontSize: 13 }}>⚠ {error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 100px', padding: '15px 30px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>
          <div>Date & Time</div>
          <div>Meeting Details</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-light)' }}>Loading...</div>
        ) : meetings.length > 0 ? (
          meetings.map(m => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 100px', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{formatDate(m.startTime)}</span>
                <span style={{ color: 'var(--text-light)', fontSize: 13 }}>{formatTime(m.startTime, m.eventType?.duration)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ width: 4, height: 40, background: 'var(--calendly-blue)', borderRadius: 4 }}></div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{m.inviteeName}</h4>
                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: 13 }}>Event: <strong>{m.eventType?.title}</strong></p>
                </div>
              </div>
              <div>
                {tab === 'upcoming' && (
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6 }}
                    onClick={() => handleCancel(m.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-light)' }}>
            <div style={{ fontSize: 40, marginBottom: 15 }}>📭</div>
            <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-main)', marginBottom: 8 }}>No {tab} events</p>
            <p style={{ fontSize: 14 }}>You have no {tab} events scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;