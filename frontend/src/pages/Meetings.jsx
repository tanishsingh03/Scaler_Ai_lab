import React, { useState } from 'react';
import '../styles/layout.css';

const Meetings = () => {
  const [tab, setTab] = useState('upcoming');

  // Sample mock data for assignment
  const sampleMeetings = [
    { id: 1, name: "John Doe", email: "john@example.com", time: "10:00 - 10:30", date: "Thursday, October 24, 2026", type: "upcoming" },
    { id: 2, name: "Jane Smith", email: "jane@test.com", time: "14:00 - 14:30", date: "Tuesday, October 20, 2026", type: "past" },
    { id: 3, name: "Alice Johnson", email: "alice@demo.com", time: "09:30 - 10:00", date: "Friday, October 25, 2026", type: "upcoming" }
  ];

  const filteredMeetings = sampleMeetings.filter(m => m.type === tab);

  return (
    <div className="admin-container">
      <header className="page-header" style={{marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
        <h1 style={{fontSize: '24px'}}>Meetings</h1>
        <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '4px'}}>
          <span>⬇</span> Export
        </button>
      </header>
      
      <div className="tabs" style={{marginBottom: '0'}}>
        <button 
          className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} 
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab-btn ${tab === 'past' ? 'active' : ''}`} 
          onClick={() => setTab('past')}
        >
          Past
        </button>
      </div>

      <div style={{background: 'white', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 8px 8px', minHeight: '400px'}}>
        
        {/* Table Header Mock */}
        <div style={{display: 'grid', gridTemplateColumns: '1.5fr 3fr 100px', padding: '15px 30px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-light)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>
          <div>Date & Time</div>
          <div>Meeting Details</div>
          <div>Action</div>
        </div>

        <div className="meetings-list">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map(meeting => (
              <div key={meeting.id} style={{display: 'grid', gridTemplateColumns: '1.5fr 3fr 100px', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', alignItems: 'center'}}>
                
                <div className="meeting-time-block">
                  <span style={{display: 'block', fontWeight: '500', color: 'var(--text-main)', marginBottom: '4px', fontSize: '15px'}}>{meeting.date}</span>
                  <span style={{color: 'var(--text-light)', fontSize: '14px'}}>{meeting.time}</span>
                </div>
                
                <div className="meeting-info-block" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                   <div style={{width: '4px', height: '40px', background: 'var(--calendly-blue)', borderRadius: '4px'}}></div>
                   <div>
                     <h4 style={{margin: '0 0 4px 0', fontSize: '15px', color:'var(--text-main)'}}>{meeting.name}</h4>
                     <p style={{margin: '0', color: 'var(--text-light)', fontSize: '14px'}}>Event type: <strong>30 Minute Meeting</strong></p>
                   </div>
                </div>

                <div className="meeting-actions">
                  {tab === 'upcoming' && (
                    <button className="btn-secondary" style={{padding: '6px 12px', fontSize: '13px', borderRadius: '6px'}}>
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="empty-state" style={{padding: '80px 0', textAlign: 'center', color: 'var(--text-light)'}}>
               <div style={{fontSize: '40px', marginBottom: '15px'}}>📭</div>
               <p style={{fontSize: '18px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '8px'}}>No {tab} events</p>
               <p style={{fontSize: '14px'}}>You have no {tab} events scheduled.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;