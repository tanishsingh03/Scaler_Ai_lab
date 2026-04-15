import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDateOverrides, createDateOverride, deleteDateOverride } from '../services/api';
import '../styles/layout.css';

const DateOverrides = () => {
  const navigate = useNavigate();
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form state
  const [date, setDate] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const fetchOverrides = async () => {
    try {
      const data = await getDateOverrides();
      setOverrides(data);
    } catch {
      setOverrides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverrides(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date) return setMsg({ type: 'error', text: 'Please select a date.' });
    setSaving(true);
    try {
      await createDateOverride({ date, isUnavailable, startTime: isUnavailable ? null : startTime, endTime: isUnavailable ? null : endTime });
      setMsg({ type: 'success', text: '✅ Date override saved!' });
      setDate('');
      fetchOverrides();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.error || '❌ Failed to save override.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this date override?')) return;
    try {
      await deleteDateOverride(id);
      setOverrides(prev => prev.filter(o => o.id !== id));
    } catch {
      alert('Failed to delete.');
    }
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="admin-container">
      <header className="page-header" style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <button onClick={() => navigate('/availability')}
          style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--calendly-blue)', cursor: 'pointer' }}>←</button>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500, margin: 0 }}>Date-specific hours</p>
          <h1 style={{ margin: 0 }}>Date Overrides</h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Add Override Form */}
        <div className="create-event-card" style={{ flex: '1 1 320px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Add Date Override</h3>
          <p style={{ color: 'var(--text-light)', fontSize: 13, marginBottom: 20 }}>
            Override your schedule for a specific date — set custom hours or mark it as fully unavailable.
          </p>

          <form onSubmit={handleAdd} className="calendly-form">
            <div className="form-group">
              <label>Select Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} required />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
              <input type="checkbox" id="unavail" checked={isUnavailable}
                onChange={e => setIsUnavailable(e.target.checked)} style={{ transform: 'scale(1.3)' }} />
              <label htmlFor="unavail" style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Mark as Unavailable (full day off)
              </label>
            </div>

            {!isUnavailable && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <span style={{ color: 'var(--text-light)', paddingTop: 28, fontWeight: 600 }}>—</span>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            {msg && (
              <div style={{ color: msg.type === 'success' ? 'green' : '#e11d48', fontSize: 13 }}>
                {msg.text}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={saving} style={{ borderRadius: 8 }}>
              {saving ? 'Saving…' : 'Add Override'}
            </button>
          </form>
        </div>

        {/* Existing Overrides List */}
        <div style={{ flex: '1 1 340px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Existing Overrides</h3>
          {loading ? (
            <p style={{ color: 'var(--text-light)' }}>Loading...</p>
          ) : overrides.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, padding: '40px 20px', textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <p style={{ fontSize: 14 }}>No date overrides yet. Add one to the left.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {overrides.map(o => (
                <div key={o.id} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 8, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{formatDate(o.date)}</p>
                    {o.isUnavailable ? (
                      <span style={{ fontSize: 13, color: '#e11d48', fontWeight: 500 }}>🚫 Full day unavailable</span>
                    ) : (
                      <span style={{ fontSize: 13, color: 'var(--calendly-blue)' }}>⏰ {o.startTime} – {o.endTime}</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(o.id)} className="delete-event-btn" title="Remove override">🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateOverrides;
