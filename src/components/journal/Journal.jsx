import React, { useState, useEffect } from 'react';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const handleAddEntry = () => {
    const entry = {
      id: Date.now(),
      text: newEntry,
      date: new Date().toISOString()
    };
    
    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setNewEntry('');
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
      <h1>Journal App</h1>
      <textarea
        className="journal-input"
        value={newEntry}
        onChange={(e) => setNewEntry(e.target.value)}
        placeholder="Write your journal entry here..."
      />
      <div className="button-container">
        <button 
          onClick={handleAddEntry}
          disabled={!newEntry.trim()}
        >
          Add Entry
        </button>
        <button 
          onClick={handleExport}
          disabled={entries.length === 0}
        >
          Export Entries
        </button>
      </div>
      <div className="entries-list">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-item">
            <div className="entry-date">
              {new Date(entry.date).toLocaleDateString()}
            </div>
            <div className="entry-text">{entry.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;