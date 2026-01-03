import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const HistoryPanel = ({ onClose }) => {
  const { user } = useAuth(); // Get current user
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // If no user is logged in, don't try to fetch
      if (!user?.uid && !user?.id) { 
          setLoading(false);
          return; 
      }

      try {
        const userId = user.uid || user.id;
        const API_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_URL}/history/${userId}`);
        const data = await response.json();
        
        if (data.history) {
          setHistory(data.history);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">Activity History</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your data...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-4xl mb-2">📜</p>
            <p>No history found yet.</p>
            <p className="text-sm">Ask a question to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-800">
                    {item.transcript || item.analysis || "Voice Query"}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                {item.response && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {item.response.answer || "View details to see answer..."}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;