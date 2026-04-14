import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/layout.css';

const Navbar = () => {
  return (
    <nav className="calendly-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <span className="logo-icon-blue">C</span>
          <span className="logo-text">Calendly</span>
        </div>
        
        <button className="sidebar-create-btn">
          <span className="plus-icon">+</span> Create
        </button>

        <div className="sidebar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">🔗</span> Scheduling
          </NavLink>
          <NavLink to="/meetings" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">📅</span> Meetings
          </NavLink>
          <NavLink to="/availability" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">⏱️</span> Availability
          </NavLink>
          <div className="sidebar-item"><span className="icon">👥</span> Contacts</div>
          <div className="sidebar-item"><span className="icon">⚙️</span> Workflows</div>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item"><span className="icon">⭐</span> Upgrade plan</div>
        <div className="sidebar-item"><span className="icon">📊</span> Analytics</div>
        <div className="sidebar-item"><span className="icon">❓</span> Help</div>
      </div>
    </nav>
  );
};

export default Navbar;