import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, isAdmin = true }) => {
  return (
    <div className="app-layout">
      {isAdmin && <Navbar />}
      <main className={isAdmin ? "admin-main" : "public-main"}>
        {/* We can place the top-right avatar container here, or leave it in children pages */}
        <div className="top-header-global">
           <div className="top-header-right">
              <button className="icon-btn">👤</button>
              <div className="avatar-circle">A</div>
              <span>▼</span>
           </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;