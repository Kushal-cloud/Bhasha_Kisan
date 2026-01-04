import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  // --- 1. CONFIGURATION (CRITICAL: PUT YOUR URL HERE) ---
  // Go to your Render Dashboard, copy your Backend URL, and paste it here.
  // Example: "https://my-agri-app.onrender.com/analyze"
  const BACKEND_URL = "https://bhasha-kisan.onrender.com/analyze"; 

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'doctor', 'weather'
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  // --- WEATHER WIDGET (Auto-fetch for India) ---
  useEffect(() => {
    // Fetch generic India weather (Nagpur center point) for demo
    fetch("https://api.open-meteo.com/v1/forecast?latitude=21.14&longitude=79.08&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error("Weather Error:", err));
  }, []);

  // --- HANDLERS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setActiveTab("doctor"); // Switch to doctor tab automatically
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; 
      recognition.start();
      recognition.onresult = (e) => setInputText(e.results[0][0].transcript);
    } else {
      alert("Voice not supported in this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText && !selectedImage) return alert("Please type or upload!");

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("user_id", "farmer_1");
      if (inputText) formData.append("text", inputText);
      if (selectedImage) formData.append("image", selectedImage);

      const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
      
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      
      const data = await res.json();
      setResponse(data.answer);
      setActiveTab("doctor"); // Show results in Doctor tab
      
    } catch (error) {
      console.error(error);
      setResponse(`❌ Connection Failed. Check your Backend URL in App.jsx.\nError: ${error.message}`);
    }
    setLoading(false);
  };

  // --- RENDER HELPERS ---
  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">🌾 Bhasha-Kisan</div>
        <nav>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={activeTab === 'doctor' ? 'active' : ''} 
            onClick={() => setActiveTab('doctor')}
          >
            🩺 Crop Doctor
          </button>
          <button 
            className={activeTab === 'weather' ? 'active' : ''} 
            onClick={() => setActiveTab('weather')}
          >
            ☁️ Weather
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-bar">
          <h2>Welcome, Farmer</h2>
          {weather && (
            <div className="weather-badge">
              🌡️ {weather.temperature}°C | 💨 {weather.windspeed} km/h
            </div>
          )}
        </header>

        {/* TAB: DASHBOARD (Quick Actions) */}
        {activeTab === 'dashboard' && (
          <div className="tab-content fade-in">
            <div className="hero-section">
              <h3>How can I help you today? / आज मैं आपकी क्या मदद कर सकता हूँ?</h3>
              
              <form onSubmit={handleSubmit} className="search-bar-large">
                <input 
                  type="text" 
                  placeholder="Ask anything (e.g., Tamatar me khad?)" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="button" onClick={startListening} className="mic-btn">🎤</button>
                <button type="submit" className="go-btn" disabled={loading}>
                  {loading ? "..." : "Search"}
                </button>
              </form>
            </div>

            <div className="stats-grid">
              <div className="card" onClick={() => document.getElementById('file-upload').click()}>
                <h4>📸 Scan Crop</h4>
                <p>Detect diseases instantly</p>
              </div>
              <div className="card">
                <h4>💧 Irrigation</h4>
                <p>Check water schedule</p>
              </div>
              <div className="card">
                <h4>💰 Market Price</h4>
                <p>Check Mandi rates</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CROP DOCTOR (Results & Upload) */}
        {activeTab === 'doctor' && (
          <div className="tab-content fade-in">
            <div className="doctor-panel">
              <div className="upload-area">
                <label htmlFor="file-upload" className="upload-box">
                  {preview ? <img src={preview} alt="Preview" /> : "📸 Click to Upload Photo"}
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} hidden />
              </div>

              <div className="result-area">
                {loading && <div className="loader">Analyzing your crop... please wait...</div>}
                
                {response && (
                  <div className="ai-response">
                    <h3>📢 Diagnosis Report:</h3>
                    <div className="response-text">
                      {response.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                  </div>
                )}
                
                {!loading && !response && (
                  <p className="placeholder-text">Upload a photo or ask a question to see results here.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: WEATHER */}
        {activeTab === 'weather' && (
          <div className="tab-content fade-in">
            <h3>Weather Forecast (India)</h3>
            <p>Real-time weather data is active.</p>
            {/* You can expand this later */}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;