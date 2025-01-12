import React, { useEffect } from 'react';
import './Settings.css';

const Settings = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        theme === 'light' ? setTheme('dark') : setTheme('light');
    };

    useEffect(() => {
        console.log('theme:', theme);
    }, [theme]);

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <div className="theme-toggle-container">
                <button className="theme-toggle-button" onClick={toggleTheme}>
                    {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                </button>
            </div>
        </div>
    );
};

export default Settings;