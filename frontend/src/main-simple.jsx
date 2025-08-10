import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Simple initialization for testing
// App initialization logging removed for production

// Basic error handling
window.addEventListener('error', (_event) => {
  // Error logging removed for production
})

window.addEventListener('unhandledrejection', (_event) => {
  // Promise rejection logging removed for production
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// App initialization confirmation removed for production