import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importa el componente de la barra de navegación
import NavBar from "./components/NavBar";

// Importa tus componentes de pantalla (rutas principales)
// --- CORRECCIÓN FINAL DE CASING PARA VERSEL: Todos los nombres de archivo
// en minúscula donde Vercel ha fallado anteriormente.
import Inicio from "./pantallas/Inicio.jsx"; // Asumimos I mayúscula por ser el punto de entrada
import Astronomy1 from "./pantallas/astronomy1.jsx"; // Corregido a 'a' minúscula
import SlideGallery from "./pantallas/SlideGallery.jsx";
import SkyfallX1 from "./pantallas/skyfallX1.jsx"; // Corregido a 's' minúscula
import Explora from "./pantallas/explora.jsx";
import Impacto from "./pantallas/impacto.jsx"; // Corregido a 'i' minúscula (probable error)
import Resultados from "./pantallas/resultados.jsx"; // Corregido a 'r' minúscula (probable error)
import Orbit from "./pantallas/OrbitRedirect.jsx"; // Nombre completo del archivo
import Orbitas from "./pantallas/Orbitas.jsx"
import VideoLayout1 from "./pantallas/VideoLayout1.jsx"; // Asumimos V mayúscula
//import { Orbit } from "ogl";

console.log("App is mounting")

function App() {
  return (
    <Router>
      <NavBar />
      {/* Contenedor principal que permite el scroll si el contenido supera el alto de la pantalla */}
        <div style={{ minHeight: "100vh", overflowY: "auto", position: "relative" }}>
        <Routes>
          {/* Rutas principales */}
          <Route path="/" element={<Inicio />} />
          <Route path="/astronomy-simulator" element={<Astronomy1 />} />
          <Route path="/slide-gallery" element={<SlideGallery />} />
          <Route path="/skyfallx-game" element={<SkyfallX1 />} />
          <Route path="/explora" element={<Explora />} />
          <Route path="/video1" element={<VideoLayout1 />} />
          <Route path="/impacto" element={<Impacto />} />
          <Route path="/result" element={<Resultados />} />
          <Route path="/orbita" element={<Orbit />} />
          <Route path="/orbitas" element={<Orbitas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
