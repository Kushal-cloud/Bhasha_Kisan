import React, { useState, useEffect } from "react";

const Dashboard = ({ backendUrl }) => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Weather on Load
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=20.59&longitude=78.96&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error("Weather Error:", err));
  }, []);

  // 2. Handle Search / AI Logic
  const handleSearch = async (manualQuery, imageFile) => {
    const textToSend = manualQuery || query;
    if (!textToSend && !imageFile) return alert("Please type something or upload!");

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("user_id", "farmer_01");
      if (textToSend) formData.append("text", textToSend);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(backendUrl, { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      setResponse("❌ Server Error: Could not connect. Check Backend URL.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      
      {/* --- HEADER SECTION --- */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, Farmer! 👋</h1>
          <p className="text-gray-500">Here is your daily farming summary.</p>
        </div>
        
        {/* Weather Widget (Top Right) */}
        {weather && (
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <span className="text-3xl">☀️</span>
            <div>
              <p className="font-bold text-xl text-gray-800">{weather.temperature}°C</p>
              <p className="text-xs text-gray-500">Wind: {weather.windspeed} km/h</p>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SEARCH BAR (Green Section) --- */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-10 text-white text-center shadow-xl mb-10">
        <h2 className="text-2xl font-semibold mb-6">How can I help you today? / आज मैं आपकी क्या मदद कर सकता हूँ?</h2>
        
        <div className="bg-white rounded-full p-2 flex max-w-2xl mx-auto shadow-lg">
          <input 
            type="text" 
            placeholder="Ask a question (e.g., Best fertilizer for wheat?)" 
            className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={() => handleSearch()}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full font-bold transition-all"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* --- ACTION CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 1. SCAN CROP CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-l-8 border-green-500 group cursor-pointer relative overflow-hidden">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={(e) => handleSearch(null, e.target.files[0])}
          />
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
          <h3 className="text-xl font-bold text-gray-800">Scan Crop</h3>
          <p className="text-sm text-gray-500 mt-2">Upload a photo to detect diseases instantly.</p>
        </div>

        {/* 2. IRRIGATION CARD */}
        <div 
          onClick={() => handleSearch("Give me irrigation advice for current season in India")}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-l-8 border-blue-500 cursor-pointer"
        >
          <div className="text-4xl mb-4">💧</div>
          <h3 className="text-xl font-bold text-gray-800">Irrigation</h3>
          <p className="text-sm text-gray-500 mt-2">Check water schedule for your crops.</p>
        </div>

        {/* 3. MARKET PRICE CARD */}
        <div 
          onClick={() => handleSearch("What are the current mandi prices for vegetables in India?")}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-l-8 border-yellow-500 cursor-pointer"
        >
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-gray-800">Market Price</h3>
          <p className="text-sm text-gray-500 mt-2">Get real-time Mandi rates nearby.</p>
        </div>
      </div>

      {/* --- AI ANSWER SECTION --- */}
      {(response || loading) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in">
          <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
            🤖 Bhasha-Kisan Says:
          </h3>
          
          {loading ? (
             <div className="flex items-center gap-3 text-green-600">
               <span className="animate-spin text-2xl">⏳</span> 
               Analyzing your query...
             </div>
          ) : (
             <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
               {response}
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;