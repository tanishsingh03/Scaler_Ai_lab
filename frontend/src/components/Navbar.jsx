import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="calendly-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="logo-icon-blue">C</div>
          <span className="logo-text">Calendly</span>
        </div>

        <button
          className="sidebar-create-btn"
          onClick={() => navigate('/event-types/new')}
        >
          <span className="plus-icon">+</span> Create
        </button>

        <div className="sidebar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">🔗</span> Scheduling
          </NavLink>
          <NavLink to="/meetings" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">📅</span> Meetings
          </NavLink>
          <NavLink to="/availability" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">⏱️</span> Availability
          </NavLink>
          <NavLink to="/date-overrides" className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="icon">📆</span> Date Overrides
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;