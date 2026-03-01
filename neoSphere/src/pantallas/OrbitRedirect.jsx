//Ya no se esta usando pero lod ejamos por cualquier cosa

import React, { useEffect } from "react";

function OrbitRedirect() {
  // useEffect se ejecuta una vez después de que el componente se monta
  useEffect(() => {
    // Redirige al usuario a la URL externa
    window.location.href = "https://asteroid-db-q68v.vercel.app/";
  }, []);

  return (
    <div>
      <p>Redirigiendo a Asteroid-DB...</p>
      {/* Esto se muestra muy brevemente o nada, dependiendo de la velocidad */}
    </div>
  );
}

export default OrbitRedirect;
