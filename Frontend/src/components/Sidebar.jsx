import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "🏠 Dashboard", icon: "🏠" },
    { id: "crop_doctor", label: "🌱 Crop Doctor", icon: "🌱" },
    { id: "weather", label: "☁️ Weather", icon: "☁️" },
  ];

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col shadow-2xl h-full">
      {/* LOGO */}
      <div className="p-6 text-center border-b border-green-800">
        <h1 className="text-2xl font-extrabold tracking-wide">🌾 Bhasha-Kisan</h1>
        <p className="text-xs text-green-300 mt-1">AI Agriculture Assistant</p>
      </div>
      
      {/* MENU */}
      <nav className="flex-1 p-4 space-y-3 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? "bg-green-600 text-white shadow-lg font-bold translate-x-1" 
                : "hover:bg-green-800 text-green-100 hover:pl-8"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* FOOTER */}
      <div className="p-4 text-center text-xs text-green-400 opacity-60">
        © 2026 Bhasha-Kisan
      </div>
    </aside>
  );
};

export default Sidebar;