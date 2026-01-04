import React, { useState } from "react";
import Header from "./Header"; // Using your Header file
import ImageCapture from "./ImageCapture"; // Using your ImageCapture file

const Dashboard = ({ weather, backendUrl, userId, triggerHistory }) => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- CENTRAL SEARCH LOGIC ---
  const handleSearch = async (text, imageFile) => {
    if (!text && !imageFile) return;
    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      if (text) formData.append("text", text);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(backendUrl, { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      setResponse("Error connecting to server.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      {/* 1. USE YOUR HEADER FILE */}
      <Header weather={weather} />

      <div className="p-6 max-w-5xl mx-auto">
        {/* 2. SEARCH / VOICE SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-100">
           <h2 className="text-xl font-bold text-green-800 mb-4">Ask Bhasha-Kisan</h2>
           
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Type a question or use the mic..." 
               className="flex-1 p-3 border rounded-full bg-gray-50 focus:outline-green-500"
               onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.target.value, null)}
             />
             {/* This button represents your VoiceAssistant.jsx logic */}
             <button className="bg-green-100 p-3 rounded-full hover:bg-green-200">🎤</button> 
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 3. USE YOUR IMAGE CAPTURE FILE */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-4">📸 Crop Doctor</h3>
            {/* Passing the search handler to your component */}
            <ImageCapture onCapture={(file) => handleSearch(null, file)} />
          </div>

          {/* 4. AI RESULT DISPLAY */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 min-h-[200px]">
            <h3 className="font-bold text-lg text-green-900 mb-2">🤖 AI Answer:</h3>
            {loading ? <p className="text-green-600 animate-pulse">Analyzing...</p> : null}
            {response ? (
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {response}
              </div>
            ) : (
              !loading && <p className="text-gray-400 italic">Results will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;