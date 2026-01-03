import React, { useState } from 'react';

const ImageCapture = ({ userId, onAnalysisComplete, onProcessingChange }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    onProcessingChange(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // Using /api prefix because of Vite proxy setup
      const response = await fetch(`/api/analyze-crop/${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Server returned ' + response.status);
      }

      const data = await response.json();
      onAnalysisComplete(data.result);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to analyze image. Please try again.');
      onAnalysisComplete({
          response_text: "Error analyzing image. Please verify backend is running."
      });
    } finally {
      onProcessingChange(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    onAnalysisComplete(null);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {!previewUrl ? (
        <div className="w-full max-w-md">
          <label 
            htmlFor="camera-input"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-2xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-4xl mb-3">📷</span>
              <p className="mb-2 text-sm text-green-700 font-semibold">Click to take a photo</p>
              <p className="text-xs text-green-600">or upload from gallery</p>
            </div>
            <input 
              id="camera-input" 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleImageSelect}
            />
          </label>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-green-200">
            <img 
              src={previewUrl} 
              alt="Crop Preview" 
              className="w-full h-64 object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-600 hover:bg-white"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Analyze Disease
          </button>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 max-w-md w-full">
        <h4 className="text-blue-800 font-bold mb-2 flex items-center">
          <span className="mr-2">ℹ️</span> Tips for best results
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Ensure good lighting</li>
          <li>Focus on the affected leaf/fruit</li>
          <li>Keep the camera steady</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageCapture;
