import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaJournalWhills, FaCog } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {/* Sidebar Toggle Button */}
      <div className="menu-icon" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Sidebar Overlay */}
      {isOpen && <div className="menu-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar Menu */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        <ul className="sidebar-menu">
          {/* Home Link */}
          <li className="sidebar-item">
            <Link to="/" className="sidebar-link" onClick={closeSidebar}>
              <FaHome />
              <span>Home</span>
            </Link>
          </li>

          {/* Journal Link */}
          <li className="sidebar-item">
            <Link to="/journal" className="sidebar-link" onClick={closeSidebar}>
              <FaJournalWhills />
              <span>Journal</span>
            </Link>
          </li>

          {/* Settings Link */}
          <li className="sidebar-item">
            <Link to="/settings" className="sidebar-link" onClick={closeSidebar}>
              <FaCog />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
