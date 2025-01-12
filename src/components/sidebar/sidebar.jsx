import React, { useState } from 'react';
import { FaJournalWhills, FaCog } from 'react-icons/fa';
import './sidebar.css';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-menu">
                <ul>
                    <li>
                        <FaJournalWhills />
                        <span>Journal</span>
                    </li>
                    <li>
                        <FaCog />
                        <span>Settings</span>
                    </li>
                </ul>
            </div>

            <div className="content">
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isOpen ? "Close" : "Open"} Sidebar
                </button>
            </div>
        </div>
    );
}

export default Sidebar;