import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);

// RNF-01. El service worker se registra después de que la página terminó
// de cargar, para no competir por ancho de banda con la primera pantalla.
// Si el navegador no lo soporta, la aplicación funciona igual: lo único
// que se pierde es la instalación y el arranque sin conexión.
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("/sw.js")
            .catch((error) => {

                console.error(
                    "No se pudo registrar el service worker:",
                    error
                );
            });
    });
}
