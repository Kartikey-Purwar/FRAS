import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StudentSessionProvider } from './context/StudentSession.jsx'
import './index.css'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StudentSessionProvider>
      <BrowserRouter basename={basename === '/' ? undefined : basename}>
        <App />
      </BrowserRouter>
    </StudentSessionProvider>
  </StrictMode>,
)
