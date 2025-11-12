import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Scraper from './components/Scraper';
import Stats from './components/Stats';
import Settings from './components/Settings';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="flex flex-col h-screen bg-letterboxd-dark text-letterboxd-light-gray">
      {/* Header */}
      <header className="bg-[#2c3440] border-b border-[#456] shadow-lg">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-white tracking-wide mb-4">
            Letterboxd Tracker
          </h1>
          
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-letterboxd-orange text-white shadow-lg shadow-letterboxd-orange/20'
                  : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('scraper')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                currentView === 'scraper'
                  ? 'bg-letterboxd-orange text-white shadow-lg shadow-letterboxd-orange/20'
                  : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                currentView === 'stats'
                  ? 'bg-letterboxd-orange text-white shadow-lg shadow-letterboxd-orange/20'
                  : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                currentView === 'settings'
                  ? 'bg-letterboxd-orange text-white shadow-lg shadow-letterboxd-orange/20'
                  : 'bg-[#456] text-letterboxd-light-gray hover:bg-[#567] hover:text-white'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-letterboxd-dark">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'scraper' && <Scraper />}
        {currentView === 'stats' && <Stats />}
        {currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}
