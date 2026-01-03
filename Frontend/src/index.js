import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// You can create an empty index.css file if you don't have one yet
import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);