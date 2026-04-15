import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';
import { getAvailability, updateAvailability } from '../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultSchedule = DAYS.map((day, i) => ({
  day, dayOfWeek: i,
  enabled: i >= 1 && i <= 5,
  startTime: '09:00', endTime: '17:00',
}));

const Availability = () => {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getAvailability()
      .then(data => {
        if (data?.schedule) setSchedule(data.schedule);
        if (data?.timezone) setTimezone(data.timezone);
      })
      .catch(() => {}) // stay on defaults if backend is offline
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i) => {
    const s = [...schedule];
    s[i] = { ...s[i], enabled: !s[i].enabled };
    setSchedule(s);
  };

  const updateTime = (i, field, value) => {
    const s = [...schedule];
    s[i] = { ...s[i], [field]: value };
    setSchedule(s);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvailability({ schedule, timezone });
      setMsg({ type: 'success', text: '✅ Availability saved!' });
    } catch {
      setMsg({ type: 'error', text: '❌ Failed to save. Is the backend running?' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>Availability</h1>
        <p style={{ marginTop: 10, color: 'var(--text-light)' }}>Set your weekly hours for bookings.</p>
      </header>

      <div className="availability-card">
        <div className="timezone-selector" style={{ padding: '24px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Working hours</h3>
            <p style={{ margin: '5px 0 0', fontSize: 14, color: 'var(--text-light)' }}>Configure your default availability</p>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginRight: 10 }}>Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: 14 }}>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
            </select>
          </div>
        </div>

        <div className="schedule-list">
          {schedule.map((item, i) => (
            <div key={item.day} className={`day-row ${!item.enabled ? 'disabled' : ''}`}>
              <div className="day-toggle">
                <input type="checkbox" checked={item.enabled} onChange={() => toggle(i)}
                  style={{ transform: 'scale(1.3)', cursor: 'pointer' }} />
                <span className="day-name">{item.day}</span>
              </div>
              {item.enabled ? (
                <div className="time-inputs" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <input type="time" value={item.startTime} onChange={e => updateTime(i, 'startTime', e.target.value)} style={{ marginRight: 12 }} />
                  <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>-</span>
                  <input type="time" value={item.endTime} onChange={e => updateTime(i, 'endTime', e.target.value)} style={{ marginLeft: 12 }} />
                </div>
              ) : (
                <div style={{ flex: 1 }}><span className="unavailable-text">Unavailable</span></div>
              )}
            </div>
          ))}
        </div>

        <div className="save-bar" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 15 }}>
          {msg && <span style={{ color: msg.type === 'success' ? 'green' : 'red', fontSize: 14 }}>{msg.text}</span>}
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Availability;