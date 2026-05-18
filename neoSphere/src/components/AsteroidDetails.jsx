// src/components/AsteroidDetails.jsx
import React, { useState, useEffect, useRef } from 'react'; // Imporamos useRef
import useAsteroidStore from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import OrbitSimulator from './OrbitSimulator';

// --- Reusable Popup Component ---
function InfoPopup({ content, onClose }) {
  if (!content) return null;
  return (
    <motion.div className="infoPopupOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="infoPopupContent" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <h3 className="infoPopupTitle">{content.title}</h3>
        <p className="infoPopupDescription">{content.description}</p>
        <button onClick={onClose} className="infoPopupCloseButton">Entendido</button>
      </motion.div>
    </motion.div>
  );
}

// --- Reusable Module Button Component ---
const ModuleButton = ({ label, value, onClick, unit = '' }) => (
  <motion.button className="moduleButton" onClick={onClick} whileTap={{ scale: 0.95 }}>
    <div className="dataLabel">{label}</div>
    <div className="dataValue">
      {value}
      {unit && <span className="dataUnit"> {unit}</span>}
    </div>
  </motion.button>
);

const POPUP_DEFINITIONS = {
  MOID: { title: 'MOID', description: 'Distancia mínima entre las órbitas del asteroide y la Tierra.' },
  PERIHELION: { title: 'Perihelio (q)', description: 'Punto más cercano al Sol.' },
  APHELION: { title: 'Afelio (ad)', description: 'Punto más lejano al Sol.' },
  DIAMETER: { title: 'Diámetro Estimado', description: 'Tamaño calculado en kilómetros.' },
  ROTATION: { title: 'Periodo de Rotación', description: 'Tiempo que tarda en girar sobre su propio eje (horas).' },
  MAGNITUDE: { title: 'Magnitud Absoluta (H)', description: 'Brillo intrínseco del objeto.' },
  ALBEDO: { title: 'Albedo', description: 'Capacidad de reflectividad de la superficie.' },
  HAZARD: { title: 'PHA', description: 'Clasificación de Asteroide Potencialmente Peligroso.' },
};

function AsteroidDetails() {
  const { selectedAsteroid, setSelectedAsteroid } = useAsteroidStore(); // Extraemos setSelectedAsteroid si el HUD del simulador necesita mutarlo
  const [popupContent, setPopupContent] = useState(null);
  const [simulatorKey, setSimulatorKey] = useState(0);
  
  // Referencia para hacer scroll al panel de información escrita
  const detailsRef = useRef(null);

  // Forzar reinicio suave del simulador si cambia el asteroide para recalcular enfoques
  useEffect(() => {
    if (selectedAsteroid) {
      setSimulatorKey((prev) => prev + 1);
    }
  }, [selectedAsteroid]);

  if (!selectedAsteroid) {
    return (
      <div className="detailsPanel welcomeMessage">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="welcomeSubtitle">Selecciona un asteroide para ver sus datos y órbita</p>
        </motion.div>
      </div>
    );
  }

  const isHazardous = selectedAsteroid.es_peligroso === true || selectedAsteroid.es_peligroso === 'Y';
  const asteroidName = selectedAsteroid.full_name || selectedAsteroid.identificador;

  // Función que se dispara al dar click en "DETALLES DEL ASTEROIDE" en el HUD inferior derecho
  const handleScrollToDetails = () => {
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <AnimatePresence>
        {popupContent && <InfoPopup content={popupContent} onClose={() => setPopupContent(null)} />}
      </AnimatePresence>
      
      <motion.div 
        key={selectedAsteroid.identificador}
        className="detailsPanel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ============ SIMULADOR INTEGRADO COEXISTENTE ============ */}
        <div className="simulatorContainer" style={{ position: 'relative', height: '400px', marginBottom: '1.5rem' }}>        
          <OrbitSimulator 
            key={simulatorKey} 
            selectedAsteroid={selectedAsteroid}
            setSelectedAsteroid={setSelectedAsteroid}
            targetAsteroid={asteroidName} // Pasamos el nombre para habilitar la telemetría del HUD y líneas de órbita personalizadas
            onReturn={handleScrollToDetails} // Vinculamos la acción del botón de abajo a la derecha
          />
        </div>

        {/* Punto de anclaje de scroll asignado a la referencia */}
        <div ref={detailsRef} className="detailsHeader pt-4">
          <h1 className="detailsTitle">{asteroidName}</h1>
        </div>
        
        <div className='moduleGroup'>
          <h2 className="moduleGroupTitle">Distancias y órbita</h2>
          <p className='infoDetails'>(Dale click a las cajas para más información)</p>
          <div className="moduleGrid">
            <ModuleButton label="Distancia mínima de intersección orbital (MOID)" value={selectedAsteroid.distancia_min_orbita_au?.toFixed(4) || 'Sin asignar'} unit="UA" onClick={() => setPopupContent(POPUP_DEFINITIONS.MOID)} />
            <ModuleButton label="Perihelio (la más cercana al Sol)" value={selectedAsteroid.q?.toFixed(3) || 'Sin asignar'} unit="UA" onClick={() => setPopupContent(POPUP_DEFINITIONS.PERIHELION)} />
            <ModuleButton label="Afelio (la más lejana al Sol)" value={selectedAsteroid.ad?.toFixed(3) || 'Sin asignar'} unit="UA" onClick={() => setPopupContent(POPUP_DEFINITIONS.APHELION)} />
            <ModuleButton label="Periodo orbital" value={selectedAsteroid.periodo_orbital_anios?.toFixed(2) || 'Sin asignar'} unit="años" />
          </div>
        </div>

        <div className="moduleGroup">
          <h2 className="moduleGroupTitle">Características físicas</h2>
          <div className="moduleGrid">
            <ModuleButton label="Diámetro estimado" value={selectedAsteroid.diameter?.toFixed(2) || 'Sin asignar'} unit="km" onClick={() => setPopupContent(POPUP_DEFINITIONS.DIAMETER)} />
            <ModuleButton label="Periodo de rotación" value={selectedAsteroid.periodo_rotacion_horas?.toFixed(2) || 'Sin asignar'} unit="horas" onClick={() => setPopupContent(POPUP_DEFINITIONS.ROTATION)} />
          </div>
        </div>
        
        <div className="moduleGroup2">
          <h2 className="moduleGroupTitle">Luminancia y Peligro</h2>
          <div className="moduleGrid">
            <ModuleButton label="Magnitud absoluta" value={selectedAsteroid.magnitud_absoluta?.toFixed(2) || 'Sin asignar'} onClick={() => setPopupContent(POPUP_DEFINITIONS.MAGNITUDE)} />
            <ModuleButton label="Albedo" value={selectedAsteroid.albedo || 'Sin asignar'} onClick={() => setPopupContent(POPUP_DEFINITIONS.ALBEDO)} />
            <ModuleButton label="Nivel de peligro" value={isHazardous ? 'PHA (peligroso)' : 'No es PHA (no es peligroso)'} onClick={() => setPopupContent(POPUP_DEFINITIONS.HAZARD)} />
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AsteroidDetails;