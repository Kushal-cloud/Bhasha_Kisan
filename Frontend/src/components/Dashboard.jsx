import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import useSpeech from '../hooks/useSpeech'; // The hook we made
import VoiceAssistant from './VoiceAssistant';
import TranscriptionDisplay from './TranscriptionDisplay';
import ImageCapture from './ImageCapture';

const Dashboard = ({ activeTab, onShowHistory }) => {
  const { user } = useAuth();
  // Connect the Speech Hook
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeech();
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // 1. Handle Mic Click
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      // If we have text, send it to backend
      if (transcript) handleSendQuery(transcript, null);
    } else {
      setResponse(null); // Clear previous answer
      startListening();
    }
  };

  // 2. Send Data to Backend (Render)
  const handleSendQuery = async (text, imgFile) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bhasha-kisan-api.onrender.com";
      const formData = new FormData();
      
      if (text) formData.append("text", text);
      if (imgFile) formData.append("image", imgFile);
      formData.append("user_id", user?.uid || "guest");

      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data.answer);
      setTranscript(""); // Clear transcript after sending
    } catch (error) {
      console.error("API Error:", error);
      setResponse("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Image Upload
  const handleImageUpload = (file) => {
    setImage(file);
    handleSendQuery(null, file); // Auto-send image when uploaded
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg">
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

      {/* Dynamic Content based on Sidebar Tab */}
      {activeTab === 'camera' && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Crop Doctor 📸</h2>
          <ImageCapture onCapture={handleImageUpload} />
          {image && <p className="text-sm text-green-600 mt-2 text-center">Image selected: {image.name}</p>}
        </div>
      )}

      {/* AI Response Area */}
      {(response || loading) && (
        <div className="bg-white border-l-4 border-green-500 p-6 rounded-r-xl shadow-md animate-fade-in">
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

      {/* Transcription Overlay (Shows what you are saying) */}
      <TranscriptionDisplay transcript={transcript} isListening={isListening} />

      {/* Floating Mic Button (Always Visible) */}
      <VoiceAssistant isListening={isListening} onClick={handleMicClick} />
    </div>
  );
};

export default Dashboard;