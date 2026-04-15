import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getAvailableSlots } from '../services/api';

const TimeSlots = ({ date, eventTypeId, duration, onTimeSelect }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    if (!date || !eventTypeId) return;
    setLoading(true);
    setError(null);
    setActiveSlot(null);

    const dateStr = format(date, 'yyyy-MM-dd');
    getAvailableSlots(eventTypeId, dateStr)
      .then(data => setSlots(data.slots || []))
      .catch(() => setError('Could not load slots.'))
      .finally(() => setLoading(false));
  }, [date, eventTypeId]);

  const formatTime = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = ((h + 11) % 12 + 1);
    return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="time-slots-panel">
      <p className="selected-date-text">
        {format(date, 'EEEE, MMMM d')}
      </p>

      {loading ? (
        <div className="slots-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="slot-skeleton" />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: '#e11d48', fontSize: 13 }}>⚠ {error}</p>
      ) : slots.length === 0 ? (
        <div className="no-slots">
          <span>😴</span>
          <p>No availability on this day</p>
        </div>
      ) : (
        <div className="slots-list">
          {slots.map(time => {
            const isActive = activeSlot === time;
            return (
              <div key={time} className="slot-item">
                <button
                  className={`slot-btn ${isActive ? 'slot-btn-active' : ''}`}
                  onClick={() => setActiveSlot(isActive ? null : time)}
                >
                  {formatTime(time)}
                </button>
                {isActive && (
                  <button
                    className="confirm-slot-btn btn-primary"
                    onClick={() => onTimeSelect(time)}
                  >
                    Next
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeSlots;