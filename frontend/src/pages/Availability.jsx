import React, { useState } from 'react';
import '../styles/layout.css';

const Availability = () => {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
  ]);

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>Availability</h1>
        <p style={{marginTop: '10px', color: 'var(--text-light)'}}>Set your weekly hours to show when you are free for bookings.</p>
      </header>

      <div className="availability-card">
        <div className="timezone-selector" style={{padding: '24px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h3 style={{margin: '0', fontSize: '16px', fontWeight: '600'}}>Working hours</h3>
            <p style={{margin: '5px 0 0', fontSize: '14px', color: 'var(--text-light)'}}>Configure your default availability</p>
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: '600', marginRight: '10px'}}>Timezone</label>
            <select style={{padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '14px'}}>
              <option>India Standard Time (IST)</option>
              <option>Coordinated Universal Time (UTC)</option>
              <option>Eastern Time (US & Canada)</option>
            </select>
          </div>
        </div>

        <div className="schedule-list">
          {schedule.map((item, index) => (
            <div key={item.day} className={`day-row ${!item.enabled ? 'disabled' : ''}`}>
              <div className="day-toggle">
                <input 
                  type="checkbox" 
                  checked={item.enabled} 
                  style={{transform: 'scale(1.3)', cursor: 'pointer'}}
                  readOnly // Normally handled by onChange, added readOnly to avoid react warning if mock
                  onChange={() => {
                    const newSched = [...schedule];
                    newSched[index].enabled = !newSched[index].enabled;
                    setSchedule(newSched);
                  }}
                />
                <span className="day-name">{item.day}</span>
              </div>

              {item.enabled ? (
                <div className="time-inputs" style={{flex: 1, display: 'flex', alignItems: 'center'}}>
                  <input type="time" defaultValue={item.startTime} style={{marginRight: '12px'}}/>
                  <span style={{color: 'var(--text-light)', fontWeight: '500'}}>-</span>
                  <input type="time" defaultValue={item.endTime} style={{marginLeft: '12px'}}/>
                  <button style={{background:'none', border:'none', marginLeft:'15px', color:'var(--text-light)', cursor:'pointer', fontSize: '18px'}}>＋</button>
                  <button style={{background:'none', border:'none', marginLeft:'10px', color:'var(--text-light)', cursor:'pointer', fontSize: '20px'}}>🗑️</button>
                </div>
              ) : (
                <div style={{flex: 1}}>
                  <span className="unavailable-text">Unavailable</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="save-bar" style={{textAlign: 'right'}}>
          <button className="btn-secondary" style={{marginRight: '15px'}}>Cancel</button>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Availability;