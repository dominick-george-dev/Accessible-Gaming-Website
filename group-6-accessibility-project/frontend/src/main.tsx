import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext.tsx';

// Temporary user ID for testing
const USER_ID = 1;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider userId={USER_ID}>
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
);
