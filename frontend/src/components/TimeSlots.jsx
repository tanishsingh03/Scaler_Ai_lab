import React, { useState } from 'react';

const TimeSlots = ({ date, onTimeSelect }) => {
  const [activeSlot, setActiveSlot] = useState(null);
  
  // Real UI would dynamically filter slots based on day
  const slots = ["09:00", "09:30", "10:00", "13:30", "14:00"];

  return (
    <div className="time-slots-panel" style={{minWidth: '220px', marginLeft: '30px', paddingLeft: '30px', borderLeft: '1px solid var(--border-color)'}}>
      <p className="selected-date-text" style={{margin: '0 0 20px 0', fontSize: '15px'}}>{date.toDateString()}</p>
      
      <div className="slots-list" style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'}}>
        {slots.map(time => {
          const isActive = activeSlot === time;
          return (
            <div key={time} className="slot-item" style={{display: 'flex', gap: '8px'}}>
              <button 
                className="slot-btn btn-secondary"
                style={{
                  flex: isActive ? '0.5' : '1', 
                  backgroundColor: isActive ? 'var(--text-light)' : 'white',
                  color: isActive ? 'white' : 'var(--calendly-blue)',
                  borderColor: isActive ? 'var(--text-light)' : 'var(--calendly-blue)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  padding: '12px', 
                  borderRadius: '4px',
                  fontWeight: '600',
                  transition: '0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveSlot(time)}
              >
                {time}
              </button>
              
              {isActive && (
                <button 
                  className="confirm-btn btn-primary"
                  style={{
                    flex: '0.5',
                    padding: '12px',
                    borderRadius: '4px',
                    padding: '0'
                  }}
                  onClick={() => onTimeSelect(time)}
                >
                  Next
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlots;