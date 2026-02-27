  import React, { useState, useEffect } from "react";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import { useNavigate } from "react-router-dom";
  import asteroidImage from "../assets/img/asteroideY.png";
  import { simulateAsteroidImpact } from "../utils/Operaciones";
  import PueblaMap from "../components/PueblaMap";


  // Fix para los iconos de Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });

  // Rangos de densidad en kg/m³
  const DENSITY_RANGES = {
    Roca: { min: 2000, max: 3000, initial: 2500 },
    Metálica: { min: 7000, max: 8000, initial: 7500 },
  };

  const SkyfallX1 = () => {
    const [diameter, setDiameter] = useState(2500); // metros
    const [speed, setSpeed] = useState(17.5); // km/s
    const [angle, setAngle] = useState(45); // grados
    const [composition, setComposition] = useState("Roca");
    const [density, setDensity] = useState(DENSITY_RANGES.Roca.initial);
    const navigate = useNavigate();
    const [position, setPosition] = useState([19.0433, -98.2022]); // Coordenadas de Puebla, México

    useEffect(() => {
      setDensity(DENSITY_RANGES[composition].initial);
    }, [composition]);

    const [isLaunched, setIsLaunched] = useState(false);

    const handleLaunch = () => {
      const simParams = {
        diameter_km: diameter / 1000,
        density_kgm3: density,
        velocity_kms: speed,
        angle_deg: angle,
        distance_from_impact_km: 10,
        targetType: "land",
        lat: position[0], //posición otorgada por el usuario
        lng: position[1],
        radius: calculateImpactRadius(diameter, speed) // You'll need this for the backend filter
      };

      const results = simulateAsteroidImpact(simParams);
      
      navigate("/video1", {
        state: {
          simulationResults: results,
          inputParameters: {
            ...simParams,
            composition,
            targetLocation: `Puebla (${position[0].toFixed(4)}, ${position[1].toFixed(4)})`,
          },
        },
      });
    };

    const currentRange = DENSITY_RANGES[composition];

    return (
      // Se mantiene el padding inferior grande (pb-20) para el espacio en la página
      <div className="bg-black text-white h-screen p-10 pb-20 flex flex-col overflow-y-auto">
        {/* Título */}
        <header className="px-0 sm:px-10 py-5 border-b border-gray-800 flex-none">
          <h1 className="text-2xl font-bold tracking-widest text-violet-500">
            Simula el impacto de un asteroide
          </h1>
        </header>

        {/* Contenedor principal de los recuadros de 2 columnas */}
        <div className="flex flex-col md:flex-row gap-6 mt-6 flex-1">

          {/*grid vertical */}
          <div className="w-full flex flex-col gap-4">

          {/* Sección izquierda: Imagen y parámetros */}
          {/* AJUSTE CLAVE 1: Limito la altura del recuadro izquierdo */}
          <div className="h-fit max-h-[85vh] w-auto bg-gray-900 rounded-lg p-4 border-2 border-violet-500">
            <div className="flex justify-center mb-5 ">
              <img
                src={asteroidImage}
                alt="Asteroide"
                // CLASES CORREGIDAS Y AUMENTADAS: Usando valores válidos de Tailwind.
                className="object-contain transition-all duration-150"
                style={{ 
                  width: `${diameter / 20}px`, 
                  height: 'auto' 
                }}
              />
            </div>

          </div>

          {/* Mapa */}
          {!isLaunched && (
            <div className="w-full bg-gray-900 rounded-lg p-4 border-2 border-violet-500 h-fit max-h-[85vh]">
              <div className="h-96 w-auto mb-4 rounded-lg overflow-hidden border border-gray-700">
                {/* Call your new interactive component here */}
                <PueblaMap position={position} setPosition={setPosition} />
              </div>
              <p className="text-gray-400 text-xs text-center">
                Haz clic en el mapa para cambiar el punto de impacto (Solo Puebla)
              </p>
            </div>
          )}
        </div>

          {/* Sección derecha: Controles*/}
          {/* AJUSTE CLAVE 2: Limito la altura del recuadro derecho */}
          <div className="h-fit max-h-[85vh] w-full bg-gray-900 rounded-lg p-4 border-2 border-violet-500">
            {/* Controles */}
            <div className="space-y-2 mb-6">
              {/* Slider para diámetro */}
              <div>
                <label className="block mb-1 text-violet-500 text-xl">
                  Tamaño (Diámetro: {diameter} m)
                </label>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  step="10"
                  value={diameter}
                  onChange={(e) => setDiameter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-300"
                />
              </div>

              {/* Slider para velocidad */}
              <div>
                <label className="block mb-1 text-violet-500 text-xl">
                  Velocidad (Velocidad de impacto: {speed} km/s)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-300"
                />
              </div>

              {/* Slider para ángulo */}
              <div>
                <label className="block mb-1 text-violet-500 text-xl">
                  Ángulo de impacto ({angle}°)
                </label>
                <input
                  type="range"
                  min="1"
                  max="90"
                  step="1"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-300"
                />
                <p className="text-base text-gray-400 mt-1 ">
                  (90° es el impacto vertical)
                </p>
              </div>

              {/* Botones para composición */}
              <div>
                <label className="block mb-1 text-violet-500 text-xl">
                  Composición
                </label>
                <div className="flex gap-3 mt-2">
                  {["Roca", "Metálica"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setComposition(type)}
                      className={`px-3 py-2 border border-blue-600 rounded ${
                        composition === type
                          ? "bg-blue-600 text-black"
                          : "bg-transparent text-blue-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider para densidad */}
              <div>
                <label className="block mb-1 text-violet-500 text-xl">
                  Densidad: <strong>{density} kg/m³</strong>
                </label>
                <input
                  type="range"
                  min={currentRange.min}
                  max={currentRange.max}
                  step="100"
                  value={density}
                  onChange={(e) => setDensity(Number(e.target.value))}
                  className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${
                    composition === "Metálica"
                      ? "accent-gray-400"
                      : "accent-violet-500"
                  }`}
                />
                <p className="text-base text-gray-400 mt-1">
                  Rango: {currentRange.min} – {currentRange.max} kg/m³
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Botón de lanzamiento */}
    {!isLaunched && (
      <button 
        onClick={() => setIsLaunched(true)}
        className="w-full py-4 bg-blue-600 text-black font-black uppercase rounded shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-105 transition-transform"
      >
        Lanzar
      </button>
    )}

    {/* THE ALERT OVERLAY */}
    {isLaunched && (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
        {/* 1. Dark Blurred Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setIsLaunched(false)} // Clicking outside closes it
        />

        {/* Alert para parámetros*/}
        <div className="relative h-2/3 w-full overflow-auto max-w-lg bg-gray-900 rounded-xl p-8 border-2 border-blue-600 shadow-[0_0_50px_rgba(250,204,21,0.2)] animate-in fade-in zoom-in duration-300">
          
          {/* Imagen del asteroide del cuadro de confirmacion*/}
          <div className="flex justify-center mb-6">
            <img
              src={asteroidImage}
              alt="Asteroide"
              className="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(255,255,0,0.4)]"
            />
          </div>

          <p className="text-center text-3xl mb-6 font-bold text-blue-600 tracking-widest uppercase italic">
            Asteroide
          </p>

          <h3 className="text-xl text-white border-b border-blue-600/50 pb-2 mb-4 font-mono">
            Parámetros 
          </h3>

          <ul className="grid grid-cols-1 gap-3 text-xl text-gray-200 mb-8 font-light">
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-400">Diámetro:</span> 
              <span className="font-bold text-white">{diameter} m</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-400">Velocidad:</span> 
              <span className="font-bold text-white">{speed} km/s</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-400">Ángulo:</span> 
              <span className="font-bold text-white">{angle}°</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-400">Compositción:</span> 
              <span className="font-bold text-white uppercase">{composition}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">Densidad:</span> 
              <span className="font-bold text-white">{density} kg/m³</span>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-20">
            <button 
              className="w-full py-4 bg-blue-600 text-black font-black text-xl uppercase rounded hover:bg-yellow-300 transition-colors"
              onClick={handleLaunch}
            >
              Lanzar
            </button>
            
            <button 
              onClick={() => setIsLaunched(false)}
              className="w-full py-2 text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-tighter"
            >
              Regresar
            </button>
          </div>
      </div>
    </div>
  )}
        
      </div>
    );
  };

  export default SkyfallX1;
