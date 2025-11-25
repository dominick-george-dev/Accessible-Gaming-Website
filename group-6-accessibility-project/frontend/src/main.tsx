import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './hooks/useFavorites'   // <-- ADD THIS

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>       
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
)