import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HistoryPanel from "./components/HistoryPanel"; // Using your file
import "./index.css"; 

function App() {
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'history', 'weather'
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- GLOBAL CONFIG ---
  const BACKEND_URL = "https://bhasha-kisan-api.onrender.com/analyze";
  const USER_ID = "farmer_01"; // In a real app, this comes from useAuth()

  // --- FETCH WEATHER (Global Data) ---
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=21.14&longitude=79.08&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error("Weather Error:", err));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* 1. SIDEBAR (Navigation) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        
        {activeTab === "dashboard" && (
          <Dashboard 
            weather={weather} 
            backendUrl={BACKEND_URL}
            userId={USER_ID}
            triggerHistory={() => setActiveTab("history")}
          />
        )}

        {activeTab === "history" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6">📜 Your Activity History</h2>
            {/* Using your specific component file */}
            <HistoryPanel userId={USER_ID} backendUrl={BACKEND_URL} />
          </div>
        )}

        {activeTab === "weather" && (
          <div className="p-10 text-center">
             <h2 className="text-2xl font-bold text-blue-800">☁️ Full Weather Forecast</h2>
             <p className="text-gray-500">More detailed weather charts can go here.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;