import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CalendarView from '../components/CalendarView';
import TimeSlots from '../components/TimeSlots';
import EventInfo from '../components/EventInfo';
import BookingForm from '../components/BookingForm';
import { getPublicEventType, getAvailability } from '../services/api';
import '../styles/layout.css';

const BookingPage = () => {
  const { username, slug } = useParams();

  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Set of enabled day-of-week numbers (0=Sun … 6=Sat); null = not loaded yet (allow all)
  const [availableDays, setAvailableDays] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPublicEventType(username, slug);
        setEventType(data);
        // Fetch availability to know which weekdays are open
        try {
          const avail = await getAvailability();
          if (avail?.schedule) {
            const enabledDays = avail.schedule
              .filter(s => s.enabled)
              .map(s => s.dayOfWeek);
            setAvailableDays(enabledDays);
          }
        } catch (_) {
          // backend unavailable — show all days
          setAvailableDays(null);
        }
      } catch (err) {
        setError('Event type not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [username, slug]);

  if (loading) {
    return (
      <div className="booking-wrapper">
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div className="spinner" style={{
            width: 40, height: 40, border: '3px solid #e2e2e2',
            borderTop: '3px solid #006bff', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          Loading event...
        </div>
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div className="booking-wrapper">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2 style={{ marginBottom: 8 }}>Event not found</h2>
          <p style={{ color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  const durationLabel = `${eventType.duration} min`;

  return (
    <div className="booking-wrapper">
      <div className="booking-card">
        {/* Left Column: Event Info */}
        <div className="column-left">
        <EventInfo
            title={eventType.title}
            duration={durationLabel}
            description={eventType.description}
            hostName={eventType.user?.name || 'Tanish Singh'}
            timezone={eventType.user?.timezone || 'Asia/Kolkata'}
            date={selectedDate}
            time={selectedTime}
          />
        </div>

        {/* Right Column: Calendar → Time Slots → Form */}
        <div className="column-right">
          {!showForm ? (
            <>
              <h2 className="section-title">Select a Date &amp; Time</h2>
              <div className="picker-container">
                <CalendarView
                  availableDays={availableDays}
                  onDateSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                />
                {selectedDate && (
                  <TimeSlots
                    date={selectedDate}
                    eventTypeId={eventType.id}
                    duration={eventType.duration}
                    onTimeSelect={(time) => {
                      setSelectedTime(time);
                      setShowForm(true);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              eventTypeId={eventType.id}
              eventName={eventType.title}
              duration={eventType.duration}
              hostName={eventType.user?.name || 'Tanish Singh'}
              timezone={eventType.user?.timezone || 'Asia/Kolkata'}
              onBack={() => setShowForm(false)}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BookingPage;