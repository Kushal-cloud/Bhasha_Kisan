import React, { useState, useEffect } from "react";

const Dashboard = ({ backendUrl }) => {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 1. Fetch Weather
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=20.59&longitude=78.96&current_weather=true")
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error(err));
  }, []);

  // 2. Voice Assistant (Mic Logic)
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; 
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript, null);
      };
      recognition.start();
    } else {
      alert("Use Google Chrome for Voice features.");
    }
  };

  // 3. Search Handler
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
    <div className="p-6 md:p-10 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Namaste, Farmer! 🙏</h1>
          <p className="text-gray-500">Ready to solve your farming problems?</p>
        </div>
        
        {weather && (
          <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-200 flex items-center gap-4">
            <span className="text-3xl">☀️</span>
            <div>
              <p className="font-bold text-xl text-gray-800">{weather.temperature}°C</p>
              <p className="text-xs text-gray-500">Wind: {weather.windspeed} km/h</p>
            </div>
          </div>
        )}
      </header>

      {/* SEARCH BAR SECTION */}
      <div className="bg-green-600 rounded-2xl p-8 text-white text-center shadow-lg mb-12">
        <h2 className="text-2xl font-semibold mb-6">How can I help you today?</h2>
        
        <div className="bg-white rounded-full p-2 flex items-center max-w-2xl mx-auto shadow-xl">
          <input 
            type="text" 
            placeholder="Ask a question..." 
            className="flex-1 px-6 py-3 text-gray-800 rounded-full focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          {/* MIC BUTTON */}
          <button 
            onClick={startListening}
            className={`p-3 text-2xl rounded-full transition-colors ${isListening ? "text-red-600 bg-red-100 animate-pulse" : "text-gray-500 hover:bg-gray-100"}`}
          >
            🎤
          </button>

          <button 
            onClick={() => handleSearch()}
            className="bg-green-800 text-white px-6 py-3 rounded-full font-bold ml-2 hover:bg-green-900 transition"
          >
            Search
          </button>
        </div>
        {isListening && <p className="mt-2 text-sm animate-pulse">Listening... Speak now 🗣️</p>}
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        {/* SCAN CROP */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-green-500 relative group cursor-pointer hover:shadow-xl transition-all">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            onChange={(e) => handleSearch(null, e.target.files[0])}
          />
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📸</div>
          <h3 className="text-xl font-bold text-gray-800">Scan Crop</h3>
          <p className="text-gray-500 text-sm mt-2">Upload photo to detect disease.</p>
        </div>

        {/* IRRIGATION */}
        <div 
          onClick={() => handleSearch("Give me irrigation advice for current season")}
          className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-blue-500 cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="text-5xl mb-4">💧</div>
          <h3 className="text-xl font-bold text-gray-800">Irrigation</h3>
          <p className="text-gray-500 text-sm mt-2">Check water schedule.</p>
        </div>

        {/* MARKET PRICE */}
        <div 
          onClick={() => handleSearch("Current mandi prices for vegetables")}
          className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-yellow-500 cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-xl font-bold text-gray-800">Market Price</h3>
          <p className="text-gray-500 text-sm mt-2">Check Mandi rates.</p>
        </div>
      </div>

      {/* AI RESPONSE AREA */}
      {(response || loading) && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-green-800 mb-4">🤖 Bhasha-Kisan Says:</h3>
          {loading ? (
             <p className="text-green-600 animate-pulse text-lg">Analyzing... please wait...</p>
          ) : (
             <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{response}</div>
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;