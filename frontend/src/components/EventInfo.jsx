
import React from 'react';

const EventInfo = ({ title, duration, date, time }) => (
  <div className="event-info-sidebar">
    <p className="host-name">Tanish Singh</p>
    <h1 className="event-title">{title}</h1>
    <div className="info-details">
      <span>🕒 {duration}</span>
      {date && <span>📅 {date.toDateString()}</span>}
      {time && <span>⏰ {time}</span>}
      <span>🌎 India Standard Time</span>
    </div>
  </div>
);

export default EventInfo;