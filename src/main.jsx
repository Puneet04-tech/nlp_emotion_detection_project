import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-simple.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

console.log('main.jsx loading - Full App Simple version...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
