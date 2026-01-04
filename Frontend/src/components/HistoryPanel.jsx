import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const HistoryPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch History from Backend
    const fetchHistory = async () => {
      if (!user?.uid && !user?.id) { 
          setLoading(false); 
          return; 
      }
      try {
        const userId = user.uid || user.id;
        // Use the Vite Env Variable for the URL
        const API_URL = import.meta.env.VITE_API_URL || "https://bhasha-kisan-api.onrender.com";
        
        const response = await fetch(`${API_URL}/history/${userId}`);
        const data = await response.json();
        if (data.history) setHistory(data.history);
      } catch (error) {
        console.error("History Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    // z-[60] ensures it is above everything else
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b bg-green-50">
          <h2 className="text-xl font-bold text-green-800">Your Activity</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors shadow-sm border"
          >
            ✕
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No history found yet.</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border hover:shadow-md">
                <p className="font-semibold text-green-900 text-sm">{item.transcript || "Query"}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.response?.answer || "..."}</p>
                <span className="text-[10px] text-gray-400 block mt-2 text-right">
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;