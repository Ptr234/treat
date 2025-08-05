import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Simple initialization for testing
console.log('🚀 OneStopCentre Uganda - Starting Application')

// Basic error handling
window.addEventListener('error', (event) => {
  console.error('JavaScript Error:', event.message, 'at', event.filename, ':', event.lineno)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✅ React app initialized')