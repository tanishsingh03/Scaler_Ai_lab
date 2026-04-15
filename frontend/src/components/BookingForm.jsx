import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../services/api";
import { format } from "date-fns";

function BookingForm({
  selectedTime,
  selectedDate,
  eventTypeId,
  eventName,
  duration,
  hostName,
  timezone,
  onBack,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [showGuests, setShowGuests] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const formatTime = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour = (h + 11) % 12 + 1;
    return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const booking = await createBooking({
        eventTypeId,
        inviteeName: name,
        inviteeEmail: email,
        date: dateStr,
        time: selectedTime,
        notes: notes || undefined,
        guestEmails: guests || undefined,
      });

      navigate("/success", {
        state: {
          name,
          email,
          date: selectedDate,
          time: formatTime(selectedTime),
          eventName: eventName || "Meeting",
          duration,
          hostName: hostName || "Tanish Singh",
          timezone: timezone || "Asia/Kolkata",
          bookingId: booking.id,
        },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Failed to schedule. This slot may have just been taken. Please go back and choose another time.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-form-container">
      <button className="back-btn" onClick={onBack} type="button">
        ← Back
      </button>

      <h2 className="section-title" style={{ fontSize: "20px", marginBottom: "8px" }}>
        Enter Details
      </h2>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
        {format(selectedDate, "EEEE, MMMM do")} at {formatTime(selectedTime)}
      </p>

      {errorMsg && (
        <div className="booking-error">
          ⚠ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="calendly-form" style={{ marginTop: 0 }}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        {!showGuests ? (
          <button
            type="button"
            className="add-guests-btn"
            onClick={() => setShowGuests(true)}
          >
            + Add Guests
          </button>
        ) : (
          <div className="form-group">
            <label>Guest Email(s)</label>
            <textarea
              rows="2"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Notify up to 10 additional guests (comma-separated)."
            />
          </div>
        )}

        <div className="form-group">
          <label>Please share anything that will help prepare for our meeting.</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>

        <p className="terms-text">
          By proceeding, you confirm that you have read and agree to our{" "}
          <span style={{ color: "#006bff", cursor: "pointer" }}>Terms of Use</span> and{" "}
          <span style={{ color: "#006bff", cursor: "pointer" }}>Privacy Notice</span>.
        </p>

        <div className="form-footer" style={{ border: "none", padding: 0, marginTop: "20px", justifyContent: "flex-start" }}>
          <button
            className="btn-primary schedule-btn"
            type="submit"
            disabled={submitting}
            style={{ padding: "14px 28px", fontSize: "15px", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Scheduling…" : "Schedule Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;