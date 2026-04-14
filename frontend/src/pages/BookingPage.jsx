import React, { useState } from 'react';
import CalendarView from '../components/CalendarView';
import TimeSlots from '../components/TimeSlots';
import EventInfo from '../components/EventInfo';
import BookingForm from '../components/BookingForm'; // Import the form
import '../styles/layout.css';

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false); // Controls view toggle

  return (
    <div className="booking-wrapper">
      <div className="booking-card">
        {/* Left Column: Always stays visible */}
        <div className="column-left">
          <EventInfo 
            title="30 Minute Meeting" 
            duration="30 min" 
            date={selectedDate}
            time={selectedTime}
          />
        </div>

        {/* Right Column: Toggles between Picker and Form */}
        <div className="column-right">
          {!confirmed ? (
            <>
              <h2 className="section-title">Select a Date & Time</h2>
              <div className="picker-container">
                <CalendarView onDateSelect={setSelectedDate} />
                {selectedDate && (
                  <TimeSlots 
                    date={selectedDate} 
                    onTimeSelect={(time) => {
                      setSelectedTime(time);
                      setConfirmed(true); // Switches to Form view
                    }} 
                  />
                )}
              </div>
            </>
          ) : (
            <BookingForm 
              selectedDate={selectedDate} 
              selectedTime={selectedTime} 
              onBack={() => setConfirmed(false)} // Bonus: Add a back button
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;