import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BookingForm({ selectedTime, selectedDate, eventName, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [showGuests, setShowGuests] = useState(false);
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Navigate to success
    navigate("/success", {
      state: {
        name,
        email,
        date: selectedDate,
        time: selectedTime,
        eventName: eventName || "30 Minute Meeting",
      },
    });
  };

  return (
    <div className="booking-form-container" style={{maxWidth: '500px'}}>
      
      <h2 className="section-title" style={{fontSize: '20px', marginBottom: '24px'}}>Enter Details</h2>
      
      <form onSubmit={handleSubmit} className="calendly-form" style={{marginTop: '0'}}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{padding: '14px', borderRadius: '8px'}}
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{padding: '14px', borderRadius: '8px'}}
          />
        </div>

        {!showGuests ? (
          <button 
            type="button" 
            className="add-guests-btn" 
            onClick={() => setShowGuests(true)}
            style={{border: '1px solid var(--calendly-blue)', borderRadius: '20px', padding: '6px 16px', background: 'white'}}
          >
            Add Guests
          </button>
        ) : (
          <div className="form-group">
            <label>Guest Email(s)</label>
            <textarea
              rows="2"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Notify up to 10 additional guests of the scheduled event."
              style={{padding: '14px', borderRadius: '8px'}}
            ></textarea>
          </div>
        )}

        <div className="form-group" style={{marginTop: '10px'}}>
          <label>Please share anything that will help prepare for our meeting.</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{padding: '14px', borderRadius: '8px'}}
          ></textarea>
        </div>

        <p className="terms-text" style={{fontSize: '12px', color: 'var(--text-light)', marginTop: '10px'}}>
          By proceeding, you confirm that you have read and agree to Calendly's <span>Terms of Use</span> and <span>Privacy Notice</span>.
        </p>

        <div className="form-footer" style={{ border: 'none', padding: 0, marginTop: '20px', justifyContent: 'flex-start' }}>
          <button className="btn-primary schedule-btn" type="submit" style={{padding: '14px 24px', fontSize: '15px'}}>
            Schedule Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;