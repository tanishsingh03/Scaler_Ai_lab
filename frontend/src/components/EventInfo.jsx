import React from 'react';

const EventInfo = ({ title, duration, description, hostName, date, time, timezone }) => (
  <div className="event-info-sidebar">
    <div className="host-avatar">
      {(hostName || 'T').charAt(0).toUpperCase()}
    </div>
    <p className="host-name">{hostName || 'Tanish Singh'}</p>
    <h1 className="event-title">{title}</h1>

    <div className="info-details">
      <div className="info-row">
        <span className="info-icon">🕒</span>
        <span>{duration}</span>
      </div>
      {date && (
        <div className="info-row">
          <span className="info-icon">📅</span>
          <span>{date.toDateString()}</span>
        </div>
      )}
      {time && (
        <div className="info-row">
          <span className="info-icon">⏰</span>
          <span>{time}</span>
        </div>
      )}
      <div className="info-row">
        <span className="info-icon">🌎</span>
        <span>{timezone || 'India Standard Time'}</span>
      </div>
    </div>

    {description && (
      <p className="event-description">{description}</p>
    )}
  </div>
);

export default EventInfo;