import React, { useState, useEffect } from 'react';
import { Trash2, Download, Plus } from 'lucide-react';
import './journal.css';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [hoveredEntry, setHoveredEntry] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;

    const entry = {
      id: Date.now(),
      text: newEntry,
      date: new Date().toISOString()
    };

    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setNewEntry('');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleDeleteEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `journal-${new Date().toLocaleDateString()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="journal-container">
      <div className="journal-content">
        <h1>Personal Journal</h1>
        
        <div className="entry-input-container">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write your thoughts..."
          />
          <div className="button-group">
            <button
              className="add-button"
              onClick={handleAddEntry}
              disabled={!newEntry.trim()}
            >
              <Plus size={20} /> Add Entry
            </button>
            <button
              className="export-button"
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              <Download size={20} /> Export
            </button>
          </div>
        </div>

        {showAlert && (
          <div className="success-alert">
            <p>Entry added successfully!</p>
          </div>
        )}

        <div className="entries-list">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="entry-card"
              onMouseEnter={() => setHoveredEntry(entry.id)}
              onMouseLeave={() => setHoveredEntry(null)}
            >
              <div className="entry-header">
                <span className="entry-date">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className={`delete-button ${hoveredEntry === entry.id ? 'visible' : ''}`}
                  aria-label="Delete entry"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="entry-text">{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;