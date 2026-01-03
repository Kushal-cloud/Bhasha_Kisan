import React from 'react';
import Dashboard from './components/Dashboard.jsx'; // Make sure this has .jsx
import { AuthProvider } from './hooks/useAuth';     // Import the new file

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Dashboard />
      </div>
    </AuthProvider>
  );
}

export default App;