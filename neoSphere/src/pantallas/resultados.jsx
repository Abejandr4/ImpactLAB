// src/pantallas/Resultados.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MitigationVideo from "../assets/videos/Mitigation.mp4";
import SurfaceVideo from "../assets/videos/Surface.mp4"; // Usaremos este como impacto cinético
import KineticyVideo from "../assets/videos/Kinetic.mp4"; // (Asumiendo que tienes un video 'gravity.mp4')
import GravityVideo from "../assets/videos/Gravity.mp4"; // (Asumiendo que tienes un video 'coating.mp4')

// NOTA: Tienes que configurar la URL del video como un 'embed' o 'iframe' de YouTube.
// Esto se hace cambiando "watch?v=" por "embed/".
const mitigationStrategies = [
  {
    name: "MITIGACIÓN",
    title: "MITIGACIÓN",
    description: "Información general sobre defensa planetaria.",
    videoSrc: MitigationVideo, // <<-- ¡CAMBIA A URL EMBEBIDA!
  },
  {
    name: "Recubrimiento",
    title: "Recubrimiento",
    description: "Modifica el equilibrio térmico (Efecto Yarkovsky).",
    videoSrc: SurfaceVideo, // <<-- ¡CAMBIA A URL EMBEBIDA!
  },
  {
    name: "Impacto Cinético",
    title: "Impacto Cinético",
    description: "Colisión directa para desviar la trayectoria.",
    videoSrc: KineticyVideo, // <<-- ¡CAMBIA A URL EMBEBIDA!
  },
  {
    name: "Tractor Gravedad",
    title: "Tractor Gravedad",
    description: "Uso de atracción gravitatoria constante.",
    videoSrc: GravityVideo, // <<-- ¡CAMBIA A URL EMBEBIDA!
  },
];

const Resultados = () => {
  const navigate = useNavigate();

  // Estado para controlar la URL del video principal
  const [currentVideoUrl, setCurrentVideoUrl] = useState(
    mitigationStrategies[0].videoSrc // Muestra el primer video por defecto
  );

  // Estado para el botón activo
  const [activeStrategy, setActiveStrategy] = useState(
    mitigationStrategies[0].name
  );

  const handleButtonClick = (strategy) => {
    setCurrentVideoUrl(strategy.videoSrc);
    setActiveStrategy(strategy.name);
  };

  return (
    // Fondo Azul Oscuro
    <div className="h-screen overflow-y-auto bg-blue-950 text-white font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Contenedor Principal (Más ancho para permitir la fila de 4) */}
      <div className="w-full max-w-6xl bg-gray-900 rounded-xl shadow-2xl p-6 md:p-10 space-y-10">
        
        <h2 className="text-4xl font-extrabold text-center text-violet-500">
          Estrategias de Mitigación
        </h2>

        {/* --- SECCIÓN A: EL VIDEO --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-400 border-b border-gray-700 pb-2">
            Explicación (Estrategia: {activeStrategy})
          </h3>

          <div className="relative overflow-hidden w-auto h-1/3 pb-[56.25%] rounded-lg shadow-2xl border-4 border-gray-700">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={currentVideoUrl}
              title="Video de Estrategia de Mitigación"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* --- SECCIÓN B: ESTRATEGIAS EN UNA SOLA FILA --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-400 border-b border-gray-700 pb-2">
            Selecciona una Estrategia
          </h3>

          {/* Grid de 4 columnas en pantallas grandes, 2 en medianas y 1 en móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mitigationStrategies.map((strategy, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(strategy)}
                className={`flex flex-col text-left p-4 rounded-lg transition-all shadow-lg border-2 h-full
                           ${
                             activeStrategy === strategy.name
                               ? "bg-violet-500 text-gray-900 border-violet-500"
                               : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                           }`}
              >
                <span className="text-lg font-extrabold mb-1 leading-tight">
                  {strategy.title}
                </span>
                <p className={`text-xs font-medium leading-snug ${
                    activeStrategy === strategy.name ? "text-gray-900" : "text-gray-400"
                  }`}>
                  {strategy.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN C: BOTÓN DE REGRESO --- */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => navigate("/skyfallx-game")}
            className="w-full md:w-1/2 p-4 text-xl font-extrabold rounded-lg shadow-2xl transition-all bg-gray-700 hover:bg-gray-600 text-white"
          >
            Regresar a la Simulación
          </button>
        </div>

      </div>
    </div>
  );
};

export default Resultados;