import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording'; // Keeping this if you expand later

const VoiceAssistant = ({ userId, onTranscript, onResponse, onProcessingChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN'; // Defaulting to Hindi/Indian context

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setLocalTranscript(transcript);
        onTranscript(transcript); // Update parent Dashboard
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (localTranscript) {
            handleSendQuery(localTranscript);
        }
      };
    } else {
      alert("Your browser does not support voice recognition. Please use Chrome.");
    }
  }, [localTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setLocalTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendQuery = async (queryText) => {
    if (!queryText) return;

    onProcessingChange(true);
    try {
      // Using /api prefix because of Vite proxy
      const response = await fetch(`/api/query/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          language: 'hi-IN'
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      onResponse(data.response); // Send AI response back to Dashboard
    } catch (error) {
      console.error("Error processing query:", error);
      onResponse({ 
        response_text: "Sorry, I couldn't connect to the server. Please check your connection." 
      });
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className={`relative rounded-full transition-all duration-300 ${isListening ? 'p-1 bg-green-200' : 'p-0'}`}>
        <button
          onClick={toggleListening}
          className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 scale-110 animate-pulse' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105'
          }`}
        >
          <span className="text-5xl">{isListening ? '⬜' : '🎤'}</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          Ask about crop diseases, weather, or market prices in your language.
        </p>
      </div>
      
      {localTranscript && (
        <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-700 italic">"{localTranscript}"</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
