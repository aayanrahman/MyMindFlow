import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaJournalWhills, FaCog, FaMoon, FaSun} from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Apply the theme on initial load and theme changes
    document.documentElement.setAttribute(
      'data-bs-theme',
      isDarkMode ? 'dark' : 'light'
    );
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
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
          {/* Theme Toggle Switch */}
          <li className="sidebar-item">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
