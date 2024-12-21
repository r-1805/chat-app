import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as Router } from 'react-router-dom'
import App from './App'
import './index.css'

// Отключаем строгий режим в продакшене для оптимизации
const root = createRoot(document.getElementById('root'))
root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  ) : (
    <Router>
      <App />
    </Router>
  )
)
