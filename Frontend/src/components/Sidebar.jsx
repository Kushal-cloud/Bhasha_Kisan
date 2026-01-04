import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "🏠 Dashboard" },
    { id: "doctor", label: "🩺 Crop Doctor" },
    { id: "weather", label: "☁️ Weather" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">🌾 Bhasha-Kisan</div>
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={activeTab === item.id ? "active" : ""}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;