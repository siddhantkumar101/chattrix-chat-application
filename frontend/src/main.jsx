import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if (typeof window !== 'undefined') {
  window.global = window;
  window.process = { env: { DEBUG: undefined } };
  window.Buffer = [];
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
