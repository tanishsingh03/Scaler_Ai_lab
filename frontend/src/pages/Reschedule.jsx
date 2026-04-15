import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import TimeSlots from '../components/TimeSlots';
import EventInfo from '../components/EventInfo';
import { getBookingByToken, rescheduleBooking, getAvailability } from '../services/api';
import { format } from 'date-fns';

const Reschedule = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [availableDays, setAvailableDays] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBookingByToken(token);
        setBooking(data);
        // Load availability to grey out unavailable days
        try {
          const avail = await getAvailability();
          if (avail?.schedule) {
            setAvailableDays(avail.schedule.filter(s => s.enabled).map(s => s.dayOfWeek));
          }
        } catch (_) {}
      } catch (err) {
        setError(err?.response?.data?.error || 'Booking not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await rescheduleBooking(booking.id, { date: dateStr, time: selectedTime });
      navigate('/success', {
        state: {
          name: booking.inviteeName,
          email: booking.inviteeEmail,
          date: selectedDate,
          time: selectedTime,
          eventName: booking.eventType.title,
          duration: booking.eventType.duration,
          hostName: booking.eventType.user?.name || 'Tanish Singh',
          timezone: booking.eventType.user?.timezone || 'Asia/Kolkata',
          isReschedule: true,
        },
      });
    } catch (err) {
      setSubmitError(err?.response?.data?.error || 'Failed to reschedule. Please try a different time.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${((h + 11) % 12 + 1)}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  if (loading) return (
    <div className="booking-wrapper">
      <div style={{ textAlign: 'center', color: '#666' }}>Loading booking details...</div>
    </div>
  );

  if (error || !booking) return (
    <div className="booking-wrapper">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <h2>Link not valid</h2>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="booking-wrapper">
      <div className="booking-card">
        <div className="column-left">
          <EventInfo
            title={`Reschedule: ${booking.eventType.title}`}
            duration={`${booking.eventType.duration} min`}
            hostName={booking.eventType.user?.name || 'Tanish Singh'}
            timezone={booking.eventType.user?.timezone || 'Asia/Kolkata'}
            date={selectedDate}
            time={selectedTime ? formatTime(selectedTime) : null}
          />
          <div style={{ marginTop: 20, padding: '12px 14px', background: '#fff8e1', borderRadius: 8, border: '1px solid #ffe082', fontSize: 13 }}>
            <strong>📅 Current booking:</strong><br />
            {new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="column-right">
          <h2 className="section-title">Pick a New Date & Time</h2>
          <div className="picker-container">
            <CalendarView
              availableDays={availableDays}
              onDateSelect={(date) => { setSelectedDate(date); setSelectedTime(null); }}
            />
            {selectedDate && (
              <TimeSlots
                date={selectedDate}
                eventTypeId={booking.eventType.id}
                duration={booking.eventType.duration}
                onTimeSelect={setSelectedTime}
              />
            )}
          </div>

          {selectedDate && selectedTime && (
            <div style={{ marginTop: 24, padding: 16, background: '#f0f7ff', borderRadius: 8, border: '1px solid #c3d9ff' }}>
              <p style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text-main)' }}>
                New time: {format(selectedDate, 'EEEE, MMMM do')} at {formatTime(selectedTime)}
              </p>
              {submitError && (
                <div className="booking-error" style={{ marginBottom: 12 }}>⚠ {submitError}</div>
              )}
              <button
                className="btn-primary"
                onClick={handleReschedule}
                disabled={submitting}
                style={{ borderRadius: 8, padding: '12px 28px' }}
              >
                {submitting ? 'Rescheduling…' : '🔄 Confirm Reschedule'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reschedule;
