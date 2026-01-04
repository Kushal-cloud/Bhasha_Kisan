import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import "./index.css"; 

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // YOUR BACKEND URL (Keep this safe!)
  const BACKEND_URL = "https://bhasha-kisan-api.onrender.com/analyze";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {activeTab === "dashboard" && (
          <Dashboard backendUrl={BACKEND_URL} />
        )}

        {activeTab === "crop_doctor" && (
           <div className="p-10 text-center">
             <h2 className="text-3xl font-bold text-green-800">🩺 Crop Doctor</h2>
             <p className="text-gray-500 mt-2">Upload your photo in the Dashboard to see results here.</p>
           </div>
        )}

        {activeTab === "weather" && (
           <div className="p-10 text-center">
             <h2 className="text-3xl font-bold text-blue-800">☁️ Weather Forecast</h2>
             <p className="text-gray-500 mt-2">Detailed 7-day forecast coming soon.</p>
           </div>
        )}

      </div>
    </div>
  );
}

export default App;