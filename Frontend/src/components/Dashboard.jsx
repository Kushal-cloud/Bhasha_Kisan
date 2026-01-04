import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import useSpeech from '../hooks/useSpeech';
import useGeolocation from '../hooks/useGeolocation'; // We use the location hook for weather
import VoiceAssistant from './VoiceAssistant';
import TranscriptionDisplay from './TranscriptionDisplay';
import ImageCapture from './ImageCapture';

const Dashboard = ({ activeTab, onShowHistory }) => {
  const { user } = useAuth();
  const location = useGeolocation(); // Get user location
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeech();
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // --- Logic to handle Mic & API ---
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript) handleSendQuery(transcript, null);
    } else {
      setResponse(null);
      startListening();
    }
  };

  const handleSendQuery = async (text, imgFile) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bhasha-kisan-api.onrender.com";
      const formData = new FormData();
      if (text) formData.append("text", text);
      if (imgFile) formData.append("image", imgFile);
      formData.append("user_id", user?.uid || "guest");

      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data.answer);
      setTranscript(""); 
    } catch (error) {
      console.error("API Error:", error);
      setResponse("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    setImage(file);
    handleSendQuery(null, file);
  };

  // --- VIEW: WEATHER TAB ---
  const renderWeather = () => (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 text-white shadow-lg animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">Weather Forecast ☁️</h2>
          <p className="opacity-90 text-lg">
            {location.loaded 
              ? `Location: ${location.coordinates.lat || 'Unknown'}, ${location.coordinates.lng || 'Unknown'}` 
              : "Locating you..."}
          </p>
        </div>
        <div className="text-6xl">28°C</div>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-4 text-center bg-white/20 rounded-xl p-4">
        <div>
          <p className="font-bold">Humidity</p>
          <p>65%</p>
        </div>
        <div>
          <p className="font-bold">Wind</p>
          <p>12 km/h</p>
        </div>
        <div>
          <p className="font-bold">Rain</p>
          <p>10% Chance</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-center opacity-75">Live weather data integration coming soon.</p>
    </div>
  );

  // --- VIEW: VOICE TAB ---
  const renderVoiceMode = () => (
    <div className="bg-white rounded-2xl p-8 shadow-sm text-center animate-fade-in h-96 flex flex-col justify-center items-center">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-colors ${isListening ? 'bg-red-100' : 'bg-green-100'}`}>
        <span className="text-6xl">{isListening ? '🛑' : '🎤'}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {isListening ? "Listening..." : "Voice Assistant Ready"}
      </h2>
      <p className="text-gray-500 max-w-md">
        Tap the microphone button below to ask about farming, pests, or market prices in your local language.
      </p>
    </div>
  );

  // --- VIEW: CROP DOCTOR TAB ---
  const renderCropDoctor = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm animate-fade-in">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Crop Doctor 📸</h2>
      <ImageCapture onCapture={handleImageUpload} />
      {image && <p className="text-sm text-green-600 mt-2 text-center">Image selected: {image.name}</p>}
    </div>
  );

  // --- VIEW: DASHBOARD (HOME) ---
  const renderDashboard = () => (
    <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">Namaste, {user?.name || 'Farmer'}! 🙏</h1>
      <p className="opacity-90">
        I am Bhasha-Kisan. Ask me about crops, weather, or diseases in your language.
      </p>
      <button 
        onClick={onShowHistory}
        className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
      >
        📜 View Past Questions
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. SWITCH CONTENT BASED ON TAB */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'camera' && renderCropDoctor()}
      {activeTab === 'voice' && renderVoiceMode()}
      {activeTab === 'weather' && renderWeather()}

      {/* 2. SHARED AI RESPONSE AREA (Shows on all tabs if there is an answer) */}
      {(response || loading) && (
        <div className="bg-white border-l-4 border-green-500 p-6 rounded-r-xl shadow-md animate-fade-in mt-6">
          <h3 className="font-bold text-gray-500 text-sm uppercase mb-2">
            {loading ? "Analyzing..." : "Bhasha-Kisan Says:"}
          </h3>
          {loading ? (
             <div className="flex space-x-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
             </div>
          ) : (
            <div className="prose text-gray-800 whitespace-pre-line">
              {response}
            </div>
          )}
        </div>
      )}

      {/* 3. GLOBAL OVERLAYS */}
      <TranscriptionDisplay transcript={transcript} isListening={isListening} />
      <VoiceAssistant isListening={isListening} onClick={handleMicClick} />
    </div>
  );
};

export default Dashboard;