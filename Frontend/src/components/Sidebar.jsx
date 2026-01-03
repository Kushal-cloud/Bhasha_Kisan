import React from 'react';

const Sidebar = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'camera', label: 'Crop Doctor', icon: '📸' },
    { id: 'voice', label: 'Voice Assistant', icon: '🎤' },
    { id: 'weather', label: 'Weather', icon: '☁️' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-green-800">Menu</h2>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-green-100 text-green-800 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <p className="text-xs text-gray-400 text-center">
            © 2026 Bhasha-Kisan <br/> Empowering Farmers
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;