import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './formation.css'
import './formation-enhancer.js'
import './money.css'
import './money-enhancer.js'
import './quest-hub.css'
import './quest-hub.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
