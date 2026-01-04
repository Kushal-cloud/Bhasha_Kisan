import React, { useState, useEffect } from "react";

const Dashboard = ({ backendUrl }) => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // New State for Mic

  // 1. FETCH WEATHER
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=20.59&longitude=78.96&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error(err));
  }, []);

  // 2. VOICE ASSISTANT LOGIC (The Missing Piece)
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; // Sets language to Hindi/Indian English
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript); // Puts text in the box
        handleSearch(transcript, null); // Automatically searches after speaking
      };

      recognition.start();
    } else {
      alert("Voice input is not supported in this browser. Try Chrome.");
    }
  };

  // 3. SEARCH HANDLER
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
      setResponse("❌ Server Error: Could not connect to Backend.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Namaste, Farmer! 🙏</h1>
          <p className="text-gray-500 mt-1">Ready to solve your farming problems?</p>
        </div>
        
        {weather && (
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <span className="text-4xl">☀️</span>
            <div>
              <p className="font-bold text-2xl text-gray-800">{weather.temperature}°C</p>
              <p className="text-sm text-gray-500">Wind: {weather.windspeed} km/h</p>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION (Search + Voice) */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-10 text-white text-center shadow-xl mb-12">
        <h2 className="text-3xl font-semibold mb-6">How can I help you today?</h2>
        
        <div className="bg-white rounded-full p-2 flex max-w-2xl mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
          
          {/* INPUT BOX */}
          <input 
            type="text" 
            placeholder="Ask a question (e.g., Best fertilizer for wheat?)" 
            className="flex-1 px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          {/* MIC BUTTON (New) */}
          <button 
            onClick={startListening}
            className={`px-4 text-2xl hover:bg-gray-100 rounded-full transition-colors ${isListening ? "text-red-500 animate-pulse" : "text-gray-500"}`}
            title="Speak now"
          >
            🎤
          </button>

          {/* SEARCH BUTTON */}
          <button 
            onClick={() => handleSearch()}
            className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-full font-bold transition-all ml-2"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
        
        {isListening && <p className="mt-2 text-sm animate-pulse">Listening... Speak now 🗣️</p>}
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* CARD 1: SCAN */}
        <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-b-8 border-green-500 group cursor-pointer relative overflow-hidden">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={(e) => handleSearch(null, e.target.files[0])}
          />
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📸</div>
          <h3 className="text-2xl font-bold text-gray-800">Scan Crop</h3>
          <p className="text-gray-500 mt-2">Upload a photo to detect diseases instantly.</p>
        </div>

        {/* CARD 2: IRRIGATION */}
        <div 
          onClick={() => handleSearch("Give me irrigation advice for current season in India")}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-b-8 border-blue-500 cursor-pointer group"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💧</div>
          <h3 className="text-2xl font-bold text-gray-800">Irrigation</h3>
          <p className="text-gray-500 mt-2">Check water schedule for your crops.</p>
        </div>

        {/* CARD 3: MARKET */}
        <div 
          onClick={() => handleSearch("What are the current mandi prices for vegetables in India?")}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-b-8 border-yellow-500 cursor-pointer group"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💰</div>
          <h3 className="text-2xl font-bold text-gray-800">Market Price</h3>
          <p className="text-gray-500 mt-2">Get real-time Mandi rates nearby.</p>
        </div>
      </div>

      {/* AI ANSWER */}
      {(response || loading) && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 mb-10 animate-fade-in">
          <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-3">
            🤖 Bhasha-Kisan Says:
          </h3>
          
          {loading ? (
             <div className="flex items-center gap-3 text-green-600 text-xl font-medium animate-pulse">
               Analyzing your query... please wait...
             </div>
          ) : (
             <div className="prose max-w-none text-gray-700 text-lg whitespace-pre-line leading-relaxed">
               {response}
             </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;