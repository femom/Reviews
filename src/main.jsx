import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./components/context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import initScrollReveal from "./utils/scrollReveal";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Initialiser l'effet de reveal après le premier rendu
if (typeof window !== 'undefined') {
  // attendre que le DOM soit prêt
  window.requestAnimationFrame(() => {
    try {
      initScrollReveal();
    } catch (err) {
      // fail gracefully
      // console.warn('scrollReveal init failed', err);
    }
  });
}
