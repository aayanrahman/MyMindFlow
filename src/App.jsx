import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/sidebar/sidebar';
import Journal from './components/journal/Journal';
import UserChats from './components/userchats/userChats';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/journal" element={<Journal />} />
            <Route path="/" element={<UserChats />} /> {/* Fix here */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
