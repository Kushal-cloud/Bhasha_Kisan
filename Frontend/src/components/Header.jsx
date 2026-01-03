import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onMenuClick, onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm z-20 relative">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button onClick={onMenuClick} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
            {/* Menu Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-green-700">Bhasha-Kisan 🌾</h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden md:block text-gray-600">Welcome, {user?.name || 'Farmer'}</span>
          <button onClick={onProfileClick} className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;