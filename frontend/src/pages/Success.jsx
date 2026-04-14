import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import '../styles/layout.css';

const Success = () => {
  const { state } = useLocation(); // We pass booking details via navigation state
  const navigate = useNavigate();

  // Fallback data for testing if no state is present
  const booking = state || {
    name: "Invitee",
    email: "invitee@example.com",
    date: new Date(),
    time: "10:00",
    eventName: "30 Minute Meeting"
  };

  return (
    <div className="booking-wrapper" style={{background: 'white'}}>
      <div style={{maxWidth: '600px', margin: '40px auto', textAlign: 'center'}}>
        
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
          
          <div className="avatar-circle" style={{width: '60px', height: '60px', fontSize: '24px'}}>A</div>
          
          <div className="check-icon" style={{width: '32px', height: '32px', background: '#0ba360', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginTop: '10px'}}>✓</div>
          
          <h1 style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-main)'}}>You are scheduled</h1>
          <p style={{color: 'var(--text-light)', fontSize: '16px'}}>A calendar invitation has been sent to your email address.</p>
          
          <div style={{border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', width: '100%', textAlign: 'left', marginTop: '20px'}}>
            <h3 style={{fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-main)'}}>{booking.eventName}</h3>
            
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-light)', marginBottom: '12px'}}>
              <span style={{fontSize: '18px'}}>👤</span>
              <span style={{fontSize: '15px', color:'var(--text-main)', fontWeight:'500'}}>ai tanish</span>
            </div>

            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-light)', marginBottom: '12px'}}>
              <span style={{fontSize: '18px'}}>📅</span>
              <span style={{fontSize: '15px', color:'var(--text-main)', fontWeight:'500'}}>{format(new Date(booking.date), 'EEEE, MMMM do, yyyy')} <br/> {booking.time}</span>
            </div>

            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-light)', marginBottom: '12px'}}>
              <span style={{fontSize: '18px'}}>🌍</span>
              <span style={{fontSize: '15px', color:'var(--text-main)', fontWeight:'500'}}>India Standard Time</span>
            </div>

            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--text-light)'}}>
              <span style={{fontSize: '18px'}}>🎥</span>
              <span style={{fontSize: '15px', color:'var(--text-main)', fontWeight:'500'}}>Web conferencing details to follow.</span>
            </div>
          </div>

          <div style={{marginTop: '30px', display: 'flex', gap: '15px', paddingBottom: '40px'}}>
             <button style={{background:'none', padding:'10px 20px', border:'1px solid var(--border-color)', borderRadius:'40px', fontWeight:'600', cursor:'pointer'}} onClick={() => navigate('/')}>Admin Dashboard</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Success;