import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
// Ensure index.css is imported in main.jsx or index.jsx, but just in case:
import "./index.css"; 

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const BACKEND_URL = "https://bhasha-kisan.onrender.com/analyze";

  return (
    <div className="dashboard-container">
      {/* 1. SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        
        {activeTab === "dashboard" && (
          <Dashboard backendUrl={BACKEND_URL} />
        )}

        {/* Since we merged Doctor logic into Dashboard for simplicity, 
            clicking "Crop Doctor" in sidebar can just reload the Dashboard 
            or you can show a specific view. For now, let's keep it simple: */}
        
        {activeTab === "doctor" && (
           <Dashboard backendUrl={BACKEND_URL} />
        )}

        {activeTab === "weather" && (
           <div style={{textAlign: "center", marginTop: "50px"}}>
             <h2>☁️ Full Weather Forecast Coming Soon</h2>
           </div>
        )}
      </main>
    </div>
  );
}

export default App;