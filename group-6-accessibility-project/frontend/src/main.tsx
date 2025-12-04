import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { GamesProvider } from "./context/GamesContext.tsx";
import { FavoritesProvider } from "./context/FavoritesContext.tsx";
import { AccessibilityProvider } from "./context/AccessibilityContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <GamesProvider>
          <FavoritesProvider>
            <AccessibilityProvider>
              <App />
            </AccessibilityProvider>
          </FavoritesProvider>
        </GamesProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
