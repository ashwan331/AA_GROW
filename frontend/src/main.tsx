import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="dark"> {/* Applying dark mode by default for premium feel */}
      <App />
    </div>
  </React.StrictMode>,
)
