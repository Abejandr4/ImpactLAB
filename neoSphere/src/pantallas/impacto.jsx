// src/pantallas/Impacto.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, Marker, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- CONFIGURACIÓN DE ICONOS DE LEAFLET ---
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { simulateAsteroidImpact } from "../utils/Operaciones";

// --- CONSTANTES GLOBALES ---
// const IMPACT_POSITION = [19.0413, -98.2062]; coordenadas de puebla
const MAP_ZOOM = 9;
const MAX_DISTANCE_KM = 500;

// --- CONFIGURACIÓN DE ESTILOS POR EFECTO ---
const effectStyles = {
  "Sismo": {
    text: "text-red-500",
    bg: "bg-red-500",
    accent: "accent-red-500",
    border: "border-red-500",
    hex: "#ef4444" 
  },
  "Resumen general": {
    text: "text-red-500",
    bg: "bg-red-500",
    accent: "accent-red-500",
    border: "border-red-500",
    hex: "#ef4444" 
  },
  "Pérdidas": {
    text: "text-cyan-500",
    bg: "bg-cyan-500",
    accent: "accent-cyan-500",
    border: "border-cyan-500",
    hex: "#06b6d4" 
  },
  "Cráter": {
    text: "text-violet-500",
    bg: "bg-violet-500",
    accent: "accent-violet-500",
    border: "border-violet-500",
    hex: "#8b5cf6" 
  },
  "Onda de Choque": {
    text: "text-yellow-500",
    bg: "bg-yellow-500",
    accent: "accent-yellow-500",
    border: "border-yellow-500",
    hex: "#eab308"
  },
  "Retorno de eyecciones": {
    text: "text-green-500",
    bg: "bg-green-500",
    accent: "accent-green-500",
    border: "border-green-500",
    hex: "#22c55e"
  },
  "Radiación Térmica": {
    text: "text-pink-500",
    bg: "bg-pink-500",
    accent: "accent-pink-500",
    border: "border-pink-500",
    hex: "#ec4899"
  },
};

const headerTextsByEffect = {
  "Sismo": "Al momento de impacto, se generará un sismo.",
  "Pérdidas": "Al momento de impacto, habrían numerosas pérdidas de varios tipos.",
  "Cráter": "Este es el efecto del cráter. ¡Puedes ver en el mapa un círculo que representa el diámetro del impacto!",
  "Onda de Choque": "¡La onda de choque expansiva es destructiva! Se propaga a través de la atmósfera causando daños estructurales.",
  "Retorno de eyecciones": "El material eyectado por el impacto es lanzado a la atmósfera y regresa al suelo cubriendo grandes áreas.",
  "Radiación Térmica": "La radiación térmica se propaga a la velocidad de la luz y puede provocar incendios y quemaduras instantáneas.",
  "Resumen general": "Este es un resumen general de todo lo causado por el impacto del meteorito.",
};

const Impacto = () => {
  const location = useLocation();
  console.log("Estado de la ubicación:", location.state); //para debug y asi
  const navigate = useNavigate();

  //state for geojson
  const [geoJsonData, setGeoJsonData] = useState(null);

  const { simulationResults: initialResults, inputParameters: inputs } =
    location.state || {};

  const impactPos = useMemo(() => {
      return inputs ? [inputs.lat, inputs.lng] : [19.0433, -98.2022];
    }, [inputs]);

useEffect(() => {
  let isMounted = true;

  fetch('/data.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (isMounted) setGeoJsonData(data);
    })
    .catch((err) => console.error("Error loading data:", err));

  return () => { isMounted = false; }; // Cleanup
}, []);


  const [distanceSliderValue, setDistanceSliderValue] = useState(20);
  const [selectedEffect, setSelectedEffect] = useState("Sismo");
  const [headerText, setHeaderText] = useState(headerTextsByEffect["Sismo"]);

  // --- LÓGICA DE CÁLCULO ---

  // 1. Distancia actual basada en el slider
  const currentDistanceKm = useMemo(
    () => (distanceSliderValue / 100) * MAX_DISTANCE_KM,
    [distanceSliderValue]
  );

  // 2. Recalcular efectos de la simulación
const recalculatedEffects = useMemo(() => {
  if (!inputs) return null;
  const currentInputs = {
    ...inputs,
    geoJsonData,
    distance_from_impact_km: currentDistanceKm,
  };
  return simulateAsteroidImpact(currentInputs);
}, [inputs, currentDistanceKm, geoJsonData]);

  // 3. Obtener radio del cráter (Necesario para el cálculo de población)
  const craterRadiusMeters = useMemo(() => {
    if (!recalculatedEffects) return 0;
    const { scenario, crater } = recalculatedEffects;
    return scenario !== "Explosión Aérea" && scenario !== "Airburst" && crater?.finalDiameter_m
      ? crater.finalDiameter_m / 2
      : 0;
  }, [recalculatedEffects]);

  const sueloAfectado = useMemo(() => {
    if (!inputs || !inputs.lat) return { zona: "Desconocida", tipoSuelo: "No especificado" };

    const lat = inputs.lat;
    let zona = "";
    let tipoSuelo = "";

    if (lat > 19.5) {
      zona = "Sierra Norte";
      tipoSuelo = "Roca";
    } else if (lat > 18.7) {
      zona = "Valles Centrales";
      tipoSuelo = "Sedimento";
    } else {
      zona = "Mixteca";
      tipoSuelo = "Suelo Blando";
    }

    return { zona, tipoSuelo };
  }, [inputs]);

  const totalAffectedPopulation = recalculatedEffects?.affectedData?.totalPopulation || 0;
  const totalAffectedHousing = recalculatedEffects?.affectedData?.totalHousing || 0;

  // Obtenemos el estilo activo actual de forma memoizada
  const activeStyle = useMemo(() => 
    effectStyles[selectedEffect] || effectStyles["Pérdidas"], 
  [selectedEffect]);

  // Pantalla de carga
  if (!inputs || !recalculatedEffects) {
    return (
      <div className="bg-blue-950 text-red-500 min-h-screen p-5 text-center flex items-center justify-center">
        <p className="text-xl font-bold">Cargando datos de la simulación...</p>
      </div>
    );
  }

  // Desestructuración de resultados calculados
  const {
    impactEnergyMegatons = 0,
    crater = { finalDiameter_m: 0, transientDiameter_m: 0, type: "N/A" },
    airBlast = { overpressure_Pa: 0, wind_velocity_ms: 0, arrival_time_s: 0, damageDescription: "N/A" },
    seismicEffects = { richterMagnitude: 0, mercalliIntensity: "N/A" },
    thermalRadiation = { thermalExposure_Jm2: 0, fireballRadius_km: 0, ignitionEffects: "N/A" },
    ejecta = { thickness_m: 0, meanFragmentSize_mm: 0, message: "No hay eyecciones." },
    scenario = "N/A",
    burstAltitude = 0,
  } = recalculatedEffects;

  const displayData = {
    zone: "Puebla",
    totalEnergy: `${impactEnergyMegatons.toLocaleString(undefined, { maximumFractionDigits: 2 })} MT`,
    craterDetails: {
      finalDiameter: `${(crater.finalDiameter_m / 1000).toFixed(2)} km`,
      transientDiameter: `${(crater.transientDiameter_m / 1000).toFixed(2)} km`,
      type: crater.type === "Simple" ? "Simple" : "Complejo",
    },
    seismicDetails: {
      magnitude: seismicEffects.richterMagnitude.toFixed(2),
      richterScale: seismicEffects.richterMagnitude.toFixed(2),
      mercalliIntensity: seismicEffects.mercalliIntensity,
    },
    currentDistanceKm: currentDistanceKm.toFixed(1),
  };

  const renderEffectDetails = useCallback(() => {
    // Casos especiales para Airburst
    if (scenario === "Explosión Aérea" || scenario === "Airburst") {
      if (selectedEffect === "Cráter")
        return <p className="text-base font-medium mt-2 text-white italic">No se forma cráter. Explosión aérea a {(burstAltitude / 1000).toFixed(1)} km de altitud.</p>;
      if (selectedEffect === "Retorno de eyecciones")
        return <p className="text-base font-medium mt-2 text-white italic">No hay eyecciones significativas debido a la explosión aérea.</p>;
    }

    switch (selectedEffect) {
      case "Sismo":
        return (
          <div className="space-y-4 text-sm pt-2">
            {/* Sección de Tipo de Suelo */}
            <div>
              <p className="font-bold text-red-500 text-lg uppercase tracking-wider">Geología del Impacto</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <p className="text-gray-400 text-xs uppercase">Zona Geográfica</p>
                  <p className="text-white font-bold text-lg">{sueloAfectado.zona}</p>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <p className="text-gray-400 text-xs uppercase">Composición</p>
                  <p className="text-white font-bold text-lg">{sueloAfectado.tipoSuelo}</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 italic mt-2">
              * El tipo de suelo influye en la propagación de las ondas sísmicas. 
              Datos basados en proyecciones de latitud y censos locales.
            </div>
          </div>
        );
      case "Pérdidas":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-bold text-red-500 text-lg uppercase">Impacto en Zona Poblada</p>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30 mt-2">
              <p className="text-gray-300">Población afectada por el cráter:</p>
              <p className="text-4xl font-black text-white">
                {totalAffectedPopulation.toLocaleString()} 
                <span className="text-sm ml-2 font-normal text-gray-400">personas</span>
              </p>
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30 mt-2">
              <p className="text-gray-300">Viviendas afectadas:</p>
              <p className="text-4xl font-black text-white">
                {totalAffectedHousing.toLocaleString()} 
                <span className="text-sm ml-2 font-normal text-gray-400">viviendas</span>
              </p>
            </div>
            <p className="font-medium text-gray-400 mt-4 italic">Basado en datos censales (INEGI) locales.</p>
          </div>
        );
      case "Cráter":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-red-500 text-lg">¡El círculo en el mapa representa el cráter!</p>
            <p className="font-medium text-gray-300">Diámetro Final: <span className="font-bold text-white text-base">{displayData.craterDetails.finalDiameter}</span></p>
            <p className="font-medium text-gray-300">Tipo: <span className="font-bold text-white text-base">{displayData.craterDetails.type}</span></p>
          </div>
        );
      case "Onda de Choque":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-yellow-400">{airBlast.overpressure_Pa.toLocaleString()} Pa</p>
            <p className="font-medium text-gray-300">Tiempo de llegada: <span className="font-bold text-white text-base">{airBlast.arrival_time_s.toFixed(1)} s</span></p>
            <p className="text-sm mt-2 text-yellow-400 font-bold italic">Daño Esperado: {airBlast.damageDescription}</p>
          </div>
        );
      case "Radiación Térmica":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="text-lg font-bold text-pink-400">{thermalRadiation.thermalExposure_Jm2.toLocaleString()} J/m²</p>
            <p className="font-medium text-gray-300">Radio de la bola de fuego generada: <span className="font-bold text-white text-base">{thermalRadiation.fireballRadius_km.toFixed(2)} km</span></p>
            <p className="text-sm mt-2 text-pink-400 font-bold italic">Efectos: {thermalRadiation.ignitionEffects}</p>
          </div>
        );
      case "Retorno de eyecciones":
        return (
          <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-gray-300">Grosor capa: <span className="font-bold text-white text-base">{(ejecta.thickness_m * 1000).toFixed(2)} mm</span></p>
            <p className="font-medium text-gray-300">Tamaño de fragmento promedio: <span className="font-bold text-white text-base">{ejecta.meanFragmentSize_mm.toFixed(2)} mm</span></p>
          </div>
        );
      case "Resumen general":
        return (
           <div className="space-y-1 text-sm pt-2">
            <p className="font-medium text-red-500 text-lg">Resumen de destrucción masiva:</p>
            <p className="font-medium text-gray-300">Cráter final de {displayData.craterDetails.finalDiameter}.</p>
            <p className="font-medium text-gray-300">Población en zona cero: {totalAffectedPopulation.toLocaleString()}.</p>
          </div>
        )
      default:
        return <p className="text-base font-medium mt-2 text-white">Selecciona un efecto.</p>;
    }
  }, [selectedEffect, scenario, crater, airBlast, thermalRadiation, ejecta, burstAltitude, displayData, totalAffectedPopulation]);

  const effectButtons = [
    { name: "Sismo", label: "Sismo" },
    { name: "Pérdidas", label: "Pérdidas" },
    { name: "Cráter", label: "Cráter" },
    { name: "Onda de Choque", label: "Onda de Choque" },
    { name: "Retorno de eyecciones", label: "Retorno de eyecciones" },
    { name: "Radiación Térmica", label: "Radiación Térmica" },
    { name: "Resumen general", label: "Resumen general" }
  ];

  return (
    <div className="h-screen overflow-y-auto bg-blue-950 text-white font-sans p-4 sm:p-6">
      <div className="bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 max-w-7xl mx-auto">
        
        {/* Header con transición de color */}
        <header className="px-0 sm:px-10 py-10 border-b border-gray-800 mb-6 transition-all duration-500">
          <h1 className={`text-3xl font-bold tracking-widest transition-colors duration-500 ${activeStyle.text}`}>
            RESULTADOS DE LA SIMULACIÓN
          </h1>
          <div className="mt-4 text-xl text-gray-300 leading-relaxed min-h-12">
             <p>{headerText}</p>
          </div>
        </header>

        {/* Sección de Botones */}
        <div className="w-full bg-gray-800/50 p-6 rounded-xl shadow-xl mb-8 border border-gray-700">
          <h2 className={`text-xl font-bold mb-4 transition-colors duration-500 ${activeStyle.text}`}>
            Selecciona un efecto para ver más detalles.
          </h2>
          <div className="flex flex-wrap gap-4">
            {effectButtons.map((btn) => (
              <button
                key={btn.name}
                className={`p-3 flex-1 min-w-40 text-lg font-semibold rounded-xl transition-all shadow-md 
                  ${selectedEffect === btn.name 
                    ? `${effectStyles[btn.name].bg} text-black transform scale-105` 
                    : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  }
                `}
                onClick={() => {
                  setSelectedEffect(btn.name);
                  setHeaderText(headerTextsByEffect[btn.name]); 
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Columna Mapa */}
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
              <h2 className={`text-xl font-bold mb-3 transition-colors duration-500 ${activeStyle.text}`}>
                Zona de Impacto: <span className="text-white text-2xl ml-2">{displayData.zone}</span>
              </h2>
              <div className="h-96 rounded-lg overflow-hidden border border-gray-700 shadow-inner">
                  <MapContainer 
                        center={impactPos} // UPDATED
                        zoom={MAP_ZOOM} 
                        scrollWheelZoom={false} 
                        className="h-full w-full"
                      >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Capa GeoJSON del Mapa de Población 
                  {geoJsonData && (
                    <GeoJSON 
                      data={geoJsonData} 
                      style={{ color: "#4b5563", weight: 1, fillOpacity: 0.1, interactive: false }} 
                    />
                  )}*/}

                  {craterRadiusMeters > 0 ? (
                    <Circle 
                      center={impactPos} 
                      radius={craterRadiusMeters} 
                      pathOptions={{ 
                        color: activeStyle.hex, 
                        fillColor: activeStyle.hex, 
                        fillOpacity: 0.5, 
                        weight: 3 
                      }} 
                    />
                  ) : (
                    <Marker position={impactPos} />
                  )}
                </MapContainer>
              </div>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
              <h2 className={`text-xl font-bold mb-2 transition-colors duration-500 ${activeStyle.text}`}>Energía Total Liberada:</h2>
              <p className="text-4xl font-extrabold text-white">{displayData.totalEnergy}</p>
            </div>
          </div>

          {/* Columna Detalles Dinámicos */}
          <div className={`space-y-5 bg-gray-800 p-6 rounded-xl shadow-xl border-t-8 transition-all duration-500 ${activeStyle.border}`}>
            <h2 className={`text-xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
              Detalles del Impacto a Distancia
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-lg font-medium text-gray-300">Distancia del observador</span>
                <span className={`text-3xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
                  {displayData.currentDistanceKm} km
                </span>
              </div>
              <input
                type="range" min="0" max="100" value={distanceSliderValue}
                onChange={(e) => setDistanceSliderValue(Number(e.target.value))}
                className={`w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer ${activeStyle.accent}`}
              />
            </div>

            <div className="min-h-30 bg-black/20 p-4 rounded-lg border border-gray-700/50">
              {renderEffectDetails()}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-700">
              <h3 className={`text-xl font-bold transition-colors duration-500 ${activeStyle.text}`}>
                Efectos Sísmicos (a {displayData.currentDistanceKm} km)
              </h3>
              <p className="text-4xl font-extrabold text-red-500">MAG: {displayData.seismicDetails.magnitude}</p>
              <p className="text-2xl font-medium text-red-500">en la escala Richter</p>
              <p className="text-4xl font-extrabold text-red-500">{displayData.seismicDetails.mercalliIntensity}</p>
              <p className="text-2xl font-medium text-red-500">en la escala Mercalli</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            className="px-12 py-4 text-2xl font-extrabold rounded-xl shadow-2xl transition-all bg-gray-700 hover:bg-gray-600 hover:scale-105 text-white border-b-4 border-gray-900 active:border-b-0"
            onClick={() => navigate("/result")}
          >
            ¿Y... qué se pudo haber hecho?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Impacto;