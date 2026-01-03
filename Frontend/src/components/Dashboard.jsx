/**
 * components/Dashboard.jsx
 * Main Dashboard Component with Green-Earth Agricultural Theme
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import VoiceAssistant from './VoiceAssistant';
import ImageCapture from './ImageCapture';
import HistoryPanel from './HistoryPanel';
import OfflineIndicator from './OfflineIndicator';
import TranscriptionDisplay from './TranscriptionDisplay';

const Dashboard = () => {
  const { user } = useAuth();
  const { isOnline, latency } = useNetworkStatus();
  const [activeTab, setActiveTab] = useState('voice');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">{'\u{1F33E}'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">भाषा-किसान</h1>
                <p className="text-green-100 text-sm">Bhasha-Kisan AI Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <OfflineIndicator isOnline={isOnline} latency={latency} />
              
              <div className="flex items-center space-x-2 bg-green-600 px-4 py-2 rounded-lg">
                <span className="text-2xl">👤</span>
                <span className="text-sm font-medium">
                  {user?.displayName || 'Farmer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            नमस्ते! Welcome to Your AI Farming Assistant
          </h2>
          <p className="text-gray-600">
            Get instant help with crop diseases, farming advice, and expert guidance in your language.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'voice'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-2 block">🎤</span>
              Voice Assistant
            </button>
            
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-2 block">📷</span>
              Crop Analysis
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-2 block">📋</span>
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'voice' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <VoiceAssistant
                  userId={user?.uid}
                  onTranscript={setCurrentTranscript}
                  onResponse={setAiResponse}
                  onProcessingChange={setIsProcessing}
                />
              </div>
            )}
            
            {activeTab === 'image' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <ImageCapture
                  userId={user?.uid}
                  onAnalysisComplete={setAiResponse}
                  onProcessingChange={setIsProcessing}
                />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <HistoryPanel userId={user?.uid} />
              </div>
            )}
          </div>

          {/* Sidebar - Real-time Display */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transcription Display */}
            {currentTranscript && (
              <TranscriptionDisplay
                transcript={currentTranscript}
                isProcessing={isProcessing}
              />
            )}

            {/* AI Response Display */}
            {aiResponse && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  AI Response
                </h3>
                
                <div className="space-y-4">
                  {aiResponse.crop_type && (
                    <div className="bg-white rounded-lg p-4">
                      <span className="text-sm text-gray-500 block mb-1">Crop Identified</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {aiResponse.crop_type}
                      </span>
                    </div>
                  )}
                  
                  {aiResponse.disease_identified && (
                    <div className="bg-white rounded-lg p-4">
                      <span className="text-sm text-gray-500 block mb-1">Disease/Issue</span>
                      <span className="text-lg font-semibold text-red-600">
                        {aiResponse.disease_identified}
                      </span>
                      <span className="text-sm text-gray-600 block mt-1">
                        Severity: {aiResponse.severity}
                      </span>
                    </div>
                  )}
                  
                  {aiResponse.response_text && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {aiResponse.response_text}
                      </p>
                    </div>
                  )}
                  
                  {aiResponse.audio_response_url && (
                    <div className="bg-green-100 rounded-lg p-4">
                      <span className="text-sm text-green-700 block mb-2 font-medium">
                        🔊 Listen to Response
                      </span>
                      <audio
                        controls
                        className="w-full"
                        src={aiResponse.audio_response_url}
                      >
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Quick Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Speak clearly in your preferred language</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Take clear photos of affected crop parts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Include multiple angles for better diagnosis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Save important advice to your history</span>
                </li>
              </ul>
            </div>

            {/* Network Status Info */}
            {!isOnline && (
              <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                  <span className="text-2xl mr-2">📡</span>
                  Offline Mode
                </h3>
                <p className="text-sm text-gray-700">
                  Your queries will be saved and processed when connection is restored.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-start space-x-4">
            <span className="text-4xl">📞</span>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                Need Help? Contact Agricultural Extension Officer
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                For emergencies or detailed consultations, contact your local agricultural officer.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:1800-180-1551"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Call Kisan Call Centre
                </a>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors">
                  Find Nearest Officer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Powered by Google Cloud AI • Built for Indian Farmers
          </p>
          <p className="text-xs text-green-200 mt-2">
            © 2025 Bhasha-Kisan • Empowering Agriculture with AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;