import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventTypes, updateEventType, getQuestions, createQuestion, deleteQuestion } from '../services/api';
import '../styles/layout.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState({
    title: '', slug: '', duration: 30, description: '', bufferBefore: 0, bufferAfter: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ label: '', type: 'TEXT', required: false });

  useEffect(() => {
    const load = async () => {
      try {
        const [events, qs] = await Promise.all([getEventTypes(), getQuestions(id)]);
        const found = events.find(e => e.id === id);
        if (found) {
          setEventData({
            title: found.title, slug: found.slug, duration: found.duration,
            description: found.description || '', bufferBefore: found.bufferBefore ?? 0, bufferAfter: found.bufferAfter ?? 0,
          });
        } else {
          setError('Event type not found.');
        }
        setQuestions(qs);
      } catch {
        setError('Failed to load event type.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const addQuestion = async () => {
    if (!newQ.label.trim()) return;
    try {
      const created = await createQuestion({ eventTypeId: id, ...newQ, order: questions.length });
      setQuestions(prev => [...prev, created]);
      setNewQ({ label: '', type: 'TEXT', required: false });
    } catch {
      alert('Failed to add question.');
    }
  };

  const removeQuestion = async (qid) => {
    try {
      await deleteQuestion(qid);
      setQuestions(prev => prev.filter(q => q.id !== qid));
    } catch {
      alert('Failed to delete question.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateEventType(id, {
        title: eventData.title, slug: eventData.slug, duration: parseInt(eventData.duration),
        description: eventData.description || undefined,
        bufferBefore: parseInt(eventData.bufferBefore), bufferAfter: parseInt(eventData.bufferAfter),
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
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: 24, color: 'var(--calendly-blue)', cursor: 'pointer' }}>←</button>
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
            <input type="text" required value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Event link *</label>
            <div className="slug-input-wrapper">
              <span>localhost:5173/aitanish/</span>
              <input type="text" required value={eventData.slug}
                onChange={(e) => setEventData({ ...eventData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
            </div>
          </div>

          <div className="form-group">
            <label>Description / Instructions</label>
            <textarea rows="4" value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Duration *</label>
            <select value={eventData.duration} onChange={(e) => setEventData({ ...eventData, duration: e.target.value })}>
              <option value="15">15 min</option><option value="30">30 min</option>
              <option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Buffer before event</label>
              <select value={eventData.bufferBefore} onChange={(e) => setEventData({ ...eventData, bufferBefore: e.target.value })}>
                <option value="0">0 min</option><option value="5">5 min</option>
                <option value="10">10 min</option><option value="15">15 min</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Buffer after event</label>
              <select value={eventData.bufferAfter} onChange={(e) => setEventData({ ...eventData, bufferAfter: e.target.value })}>
                <option value="0">0 min</option><option value="5">5 min</option>
                <option value="10">10 min</option><option value="15">15 min</option>
              </select>
            </div>
          </div>

          {/* ── Custom Questions ── */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24, marginTop: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>Custom Invitee Questions</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', margin: '0 0 16px' }}>
              Ask your invitees custom questions when they book this event.
            </p>

            {questions.map((q) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8f9fa', borderRadius: 6, marginBottom: 8, border: '1px solid var(--border-color)' }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{q.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-light)', background: '#e9ecef', padding: '2px 8px', borderRadius: 12 }}>{q.type}</span>
                {q.required && <span style={{ fontSize: 12, color: '#e11d48' }}>Required</span>}
                <button type="button" onClick={() => removeQuestion(q.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48', fontSize: 16 }}>×</button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 8 }}>
              <div className="form-group" style={{ flex: '2 1 180px', margin: 0 }}>
                <label style={{ fontSize: 13 }}>Question label</label>
                <input type="text" placeholder="e.g. What is your company name?"
                  value={newQ.label} onChange={(e) => setNewQ({ ...newQ, label: e.target.value })
                  } onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())} />
              </div>
              <div className="form-group" style={{ flex: '1 1 110px', margin: 0 }}>
                <label style={{ fontSize: 13 }}>Type</label>
                <select value={newQ.type} onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}>
                  <option value="TEXT">Short text</option>
                  <option value="TEXTAREA">Long text</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 2 }}>
                <input type="checkbox" id="req-edit" checked={newQ.required} onChange={(e) => setNewQ({ ...newQ, required: e.target.checked })} />
                <label htmlFor="req-edit" style={{ fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Required</label>
              </div>
              <button type="button" onClick={addQuestion}
                style={{ padding: '10px 16px', border: '1px dashed var(--calendly-blue)', background: 'none', color: 'var(--calendly-blue)', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                + Add
              </button>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
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
