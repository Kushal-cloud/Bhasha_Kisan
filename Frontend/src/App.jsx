import React, { useState } from "react";
import "./index.css"; // <--- CHANGED TO MATCH YOUR FILE NAME

function App() {
  // --- STATE VARIABLES ---
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // --- API URL (Replace with your actual Render URL) ---
  const API_URL = "https://bhasha-kisan-api.onrender.com/analyze";

  // --- 1. HANDLE IMAGE SELECTION ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file)); // Show preview to user
    }
  };

  // --- 2. HANDLE SUBMISSION (TEXT or IMAGE) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page reload
    
    // Validation: Don't send empty requests
    if (!inputText && !selectedImage) {
      alert("Please type a question or upload an image!");
      return;
    }

    setLoading(true);
    setResponse(null); // Clear old answer

    try {
      // Create Form Data to send to Backend
      const formData = new FormData();
      formData.append("user_id", "guest_farmer"); // Optional user ID

      if (inputText) {
        formData.append("text", inputText);
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Send to Backend
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData, // Auto-sets Content-Type to multipart/form-data
      });

      const data = await res.json();
      
      if (data.answer) {
        setResponse(data.answer);
      } else {
        setResponse("Sorry, no response received from the server.");
      }

    } catch (error) {
      console.error("Error:", error);
      setResponse("Server Error: Could not connect to Bhasha-Kisan.");
    }

    setLoading(false);
  };

  // --- 3. HANDLE MIC (Simple Placeholder) ---
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; // Default to Hindi/Indian English
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript); // Put spoken text into the search bar
      };
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🌾 Bhasha-Kisan</h1>
        <p>Your AI Agriculture Assistant</p>
      </header>

      <div className="main-content">
        
        {/* --- SECTION A: SEARCH BAR & MIC --- */}
        <div className="search-section">
          <form onSubmit={handleSubmit} className="search-box">
            <input
              type="text"
              placeholder="Ask a question (e.g., Tamatar me khad?)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            {/* Mic Button */}
            <button type="button" className="mic-btn" onClick={startListening}>
              🎤
            </button>
            {/* Send Button */}
            <button type="submit" className="send-btn" disabled={loading}>
              {loading ? "..." : "➤"}
            </button>
          </form>
        </div>

        {/* --- SECTION B: IMAGE UPLOAD (CROP DOCTOR) --- */}
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-label">
            📸 Upload Crop Photo
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          
          {/* Image Preview */}
          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Selected Crop" />
              <button onClick={() => {setSelectedImage(null); setPreview(null);}}>❌ Remove</button>
            </div>
          )}
        </div>

        {/* --- SECTION C: AI RESPONSE --- */}
        {response && (
          <div className="response-card">
            <h3>🤖 Bhasha-Kisan Says:</h3>
            {/* Display new lines correctly */}
            <div className="response-text">
              {response.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;