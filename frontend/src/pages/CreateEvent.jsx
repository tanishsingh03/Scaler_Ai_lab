import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/layout.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: '',
    slug: '',
    duration: 30,
    description: '',
    bufferBefore: '0',
    bufferAfter: '0'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Event Type:", eventData);
    // Future backend endpoint here
    navigate('/'); 
  };

  return (
    <div className="admin-container">
      <header className="page-header" style={{flexDirection: 'row', alignItems: 'center', gap: '20px'}}>
        <button className="btn-secondary" style={{border:'none', background:'none', padding:'0', fontSize:'24px', color:'var(--calendly-blue)'}} onClick={() => navigate('/')}>←</button>
        <div>
           <p style={{fontSize:'14px', color:'var(--text-light)', fontWeight:'500'}}>Add One-on-One Event Type</p>
           <h1>New Event Type</h1>
        </div>
      </header>

      <div className="create-event-card" style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '30px', maxWidth: '600px', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSubmit} className="calendly-form">
          <div className="form-group">
            <label>Event name *</label>
            <input 
              type="text" 
              placeholder="e.g. 15 Minute Coffee Chat"
              required 
              onChange={(e) => setEventData({...eventData, name: e.target.value})} 
            />
          </div>

          <div className="form-group" style={{marginTop: '10px'}}>
            <label>Event link *</label>
            <div className="slug-input-wrapper">
              <span>calendly.com/aitanish/</span>
              <input 
                type="text" 
                placeholder="coffee-chat"
                required 
                onChange={(e) => setEventData({...eventData, slug: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-group" style={{marginTop: '10px'}}>
            <label>Description / Instructions</label>
            <textarea 
              rows="4"
              placeholder="Write a summary and any details your invitee should know about the meeting."
              onChange={(e) => setEventData({...eventData, description: e.target.value})} 
            ></textarea>
          </div>

          <div className="form-group" style={{marginTop: '10px'}}>
            <label>Duration *</label>
            <select 
              value={eventData.duration}
              onChange={(e) => setEventData({...eventData, duration: e.target.value})}
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>

          {/* Bonus Feature: Buffer times */}
          <div style={{display:'flex', gap:'20px', marginTop:'10px'}}>
            <div className="form-group" style={{flex:1}}>
                <label>Buffer before event</label>
                <select value={eventData.bufferBefore} onChange={(e) => setEventData({...eventData, bufferBefore: e.target.value})}>
                  <option value="0">0 min</option>
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                </select>
            </div>
            <div className="form-group" style={{flex:1}}>
                <label>Buffer after event</label>
                <select value={eventData.bufferAfter} onChange={(e) => setEventData({...eventData, bufferAfter: e.target.value})}>
                  <option value="0">0 min</option>
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                </select>
            </div>
          </div>

          <div className="form-footer" style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px', justifyContent: 'flex-end'}}>
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-primary">Save & Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;