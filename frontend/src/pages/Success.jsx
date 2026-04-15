import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Success = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const booking = state || {
    name: 'Invitee',
    email: 'invitee@example.com',
    date: new Date(),
    time: '10:00 AM',
    eventName: '30 Minute Meeting',
    duration: 30,
    hostName: 'Tanish Singh',
    timezone: 'Asia/Kolkata',
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return String(d);
    }
  };

  return (
    <div className="booking-wrapper" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="success-container">
        {/* Green check */}
        <div className="success-check-wrapper">
          <div className="success-check">✓</div>
        </div>

        <div className="success-avatar">
          {(booking.hostName || 'T').charAt(0).toUpperCase()}
        </div>

        <h1 className="success-title">You are scheduled!</h1>
        <p className="success-subtitle">
          A calendar invitation has been sent to <strong>{booking.email}</strong>.
        </p>

        <div className="success-details-card">
          <h3 className="success-event-name">{booking.eventName}</h3>

          <div className="success-row">
            <span className="success-icon">👤</span>
            <span>{booking.hostName || 'Tanish Singh'}</span>
          </div>
          <div className="success-row">
            <span className="success-icon">📅</span>
            <div>
              <div style={{ fontWeight: 600 }}>{formatDate(booking.date)}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{booking.time}</div>
            </div>
          </div>
          <div className="success-row">
            <span className="success-icon">🕒</span>
            <span>{booking.duration} minutes</span>
          </div>
          <div className="success-row">
            <span className="success-icon">🌍</span>
            <span>{booking.timezone || 'India Standard Time'}</span>
          </div>
          <div className="success-row">
            <span className="success-icon">🎥</span>
            <span>Web conferencing details to follow.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 30, paddingBottom: 40, justifyContent: 'center' }}>
          <button
            className="btn-secondary"
            style={{ borderRadius: 40, padding: '10px 24px', fontWeight: 600 }}
            onClick={() => navigate('/')}
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;