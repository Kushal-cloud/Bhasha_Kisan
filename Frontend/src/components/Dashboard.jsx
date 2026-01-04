import React, { useState, useEffect } from "react";
// Ensure you import the Header if you have it, otherwise we code it here.

const Dashboard = ({ backendUrl }) => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [activeView, setActiveView] = useState("home"); // 'home' or 'doctor'
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch Weather
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=20.59&longitude=78.96&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error(err));
  }, []);

  // Search/Upload Logic
  const handleSearch = async (manualQuery, imageFile) => {
    const textToSend = manualQuery || query;
    if (!textToSend && !imageFile) return alert("Please type or upload!");

    setLoading(true);
    setResponse(null);
    setActiveView("doctor"); // Switch to results view

    if (imageFile) setPreview(URL.createObjectURL(imageFile));

    try {
      const formData = new FormData();
      formData.append("user_id", "farmer_01");
      if (textToSend) formData.append("text", textToSend);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(backendUrl, { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      setResponse("Server Error: Could not connect to Bhasha-Kisan.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-content">
      {/* HEADER */}
      <header className="top-bar">
        <h2>Welcome, Farmer!</h2>
        {weather && (
          <div className="weather-badge">
            🌡️ {weather.temperature}°C | 💨 {weather.windspeed} km/h
          </div>
        )}
      </header>

      {/* VIEW: HOME DASHBOARD */}
      {activeView === "home" && (
        <>
          <div className="hero-section">
            <h3>How can I help you today?</h3>
            <div className="search-bar-large">
              <input 
                type="text" 
                placeholder="Ask anything (e.g. Wheat fertilizer?)" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="go-btn" onClick={() => handleSearch()}>Search</button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="card" onClick={() => document.getElementById("hidden-file-input").click()}>
              <h4>📸 Scan Crop</h4>
              <p>Upload Photo</p>
              {/* Hidden input for the card click */}
              <input 
                type="file" 
                id="hidden-file-input" 
                hidden 
                onChange={(e) => handleSearch(null, e.target.files[0])} 
              />
            </div>
            
            <div className="card" onClick={() => handleSearch("Irrigation advice for rice")}>
              <h4>💧 Irrigation</h4>
              <p>Get Advice</p>
            </div>
            
            <div className="card" onClick={() => handleSearch("Mandi prices for vegetables")}>
              <h4>💰 Market Price</h4>
              <p>Check Rates</p>
            </div>
          </div>
        </>
      )}

      {/* VIEW: DOCTOR / RESULTS */}
      {activeView === "doctor" && (
        <div className="doctor-panel">
          <div className="upload-area">
            <label htmlFor="upload-box-input" className="upload-box">
              {preview ? <img src={preview} alt="Crop" /> : "📸 Upload Another Photo"}
            </label>
            <input 
              id="upload-box-input" 
              type="file" 
              hidden 
              onChange={(e) => handleSearch(null, e.target.files[0])} 
            />
            <button style={{marginTop: "20px"}} onClick={() => setActiveView("home")}>
              ← Back to Dashboard
            </button>
          </div>

          <div className="result-area">
            {loading ? (
              <div className="loader">Analyzing... please wait...</div>
            ) : (
              <div className="ai-response">
                <h3>📢 Diagnosis:</h3>
                <div className="response-text">
                  {response ? response : "No result yet."}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;