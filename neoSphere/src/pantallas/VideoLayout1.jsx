// src/pantallas/VideoLayout1.jsx (CON MUTE)

import React, { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import meteoritoVideo from "../assets/videos/impacto.mp4";

const VideoLayout1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  // ... (otras lógicas)

  const handleVideoEnd = useCallback(() => {
    // Navegamos a la ruta de resultados
    navigate("/impacto", { state: data });
  }, [navigate, data]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted={true} // 🔑 CAMBIO CLAVE: Permite Autoplay en la mayoría de navegadores
        onEnded={handleVideoEnd}
      >
        <source src={meteoritoVideo} type="video/mp4" />
        Can't open the video
      </video>

      <button
        onClick={handleVideoEnd}
        className="absolute bottom-5 right-5 text-white bg-gray-800 opacity-70 p-7 rounded z-10 hover:opacity-100"
      >
        SALTAR
      </button>
    </div>
  );
};

export default VideoLayout1;
