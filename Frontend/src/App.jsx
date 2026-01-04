import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HistoryPanel from './components/HistoryPanel';
import ProfileModal from './components/ProfileModal';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        
        <OfflineIndicator />

        {/* The Sidebar (Menu) */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 flex flex-col w-full transition-all duration-300">
          
          {/* The Top White Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            onProfileClick={() => setShowProfile(true)}
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <Dashboard 
                activeTab={activeTab} 
                onShowHistory={() => setShowHistory(true)} 
              />
            </div>
          </main>
        </div>

        {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      </div>
    </AuthProvider>
  );
}

export default App;