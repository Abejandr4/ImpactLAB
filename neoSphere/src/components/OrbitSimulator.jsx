// src/components/OrbitSimulator.jsx
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Line, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PLANET_NAME_MAP = {
  "Mercury": "Mercurio",
  "Venus": "Venus",
  "Earth": "Tierra",
  "Mars": "Marte",
  "Jupiter": "Júpiter",
  "Saturn": "Saturno",
  "Uranus": "Urano",
  "Neptune": "Neptuno",
  "Sun": "Sol",
  "Asteroids": "Asteroides" // Añadido para la leyenda
};

// This is now the INITIAL state for the planet colors
const INITIAL_PLANET_COLORS = {
  "Mercury": "#a0a0a0",
  "Venus": "#d4a06a",
  "Earth": "#06b6d4",
  "Mars": "#ff4d4d",
  "Jupiter": "#ffc300",
  "Saturn": "#e6d5a8",
  "Uranus": "#a8e6e6",
  "Neptune": "#6a82d4",
};

// Background component for space
function SpaceBackground() {
  const texture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}8k_stars_milky_way.jpg`);
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Sun() {
  const sunTexture = useLoader(THREE.TextureLoader, `${import.meta.env.BASE_URL}2k_sun.jpg`);
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial map={sunTexture} />
        <Text position={[0, 0.3, 0]} fontSize={0.2} color="white" anchorX="center">
          {PLANET_NAME_MAP["Sun"]}
        </Text>
      </mesh>
      <pointLight position={[0, 0, 0]} color="var(--color-primary)" intensity={3} distance={100} />
    </>
  );
}

// Scene now accepts the full color objects as props and hideOrbits state
function Scene({ planetColors, asteroidColor, hideOrbits, targetAsteroid }) {
  const [orbits, setOrbits] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrbits() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}orbitas_3d.json`);
        if (!response.ok) throw new Error('orbitas_3d.json not found.');
        const data = await response.json();
        setOrbits(data);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchOrbits();
  }, []);

  return (
    <>
      <SpaceBackground />
      <Sun />

      {Object.entries(orbits).map(([nombre, orbitData]) => {
        if (!orbitData.coordenadas || orbitData.coordenadas.length === 0) return null;
        
        // Check if the orbit belongs to a planet using the passed colors object
        const isPlanet = planetColors.hasOwnProperty(nombre);
        const isTarget = nombre === targetAsteroid;
        
        // CORRECCIÓN FERONIA: Si hideOrbits está activo, ocultamos TODO lo que no sea planeta y no sea el objetivo buscado
        if (hideOrbits && !isPlanet && !isTarget) {
          return null;
        }
        
        // Assign color dynamically
        const color = isPlanet ? planetColors[nombre] : asteroidColor;

        // NUEVO: Define la posición para la etiqueta de texto usando el primer punto de la órbita.
        const textPosition = orbitData.coordenadas[0];

        // NUEVO: Se usa un Fragment (<>) para devolver la Línea y el Texto juntos.
        return (
          <React.Fragment key={nombre}>
            <Line
              points={orbitData.coordenadas.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
              color={color}
              lineWidth={isPlanet ? 1.5 : 1}
            />
            {/* NUEVO: Se añade el componente <Text> para mostrar el nombre */}
            <Text
              // Se posiciona en el primer punto de la órbita con un pequeño desplazamiento hacia arriba
              position={[textPosition[0], textPosition[1] + 0.15, textPosition[2]]}
              fontSize={isPlanet ? 0.25 : 0.1} // Nombres de planetas más grandes
              color="white"
              anchorX="left"
              anchorY="middle"
            >
              {PLANET_NAME_MAP[nombre] || nombre}
            </Text>
          </React.Fragment>
        );
      })}
      {error && <Text position={[0, 0, 0]} color="var(--color-danger)" fontSize={0.2} anchorX="center">{error}</Text>}
    </>
  );
}

function OrbitSimulator({ onReturn, targetAsteroid }) {
  const [planetColors, setPlanetColors] = useState(INITIAL_PLANET_COLORS);
  const [asteroidColor, setAsteroidColor] = useState('#8c949fff');
  const [canvasKey, setCanvasKey] = useState(0);
  const [hideOrbits, setHideOrbits] = useState(false);
  
  // Use ref to store fixed hidden asteroids (Nota: con la nueva lógica de Scene, este ref ya no es estrictamente necesario para ocultar, pero lo mantenemos para no romper la estructura)
  const hiddenAsteroids = useRef([]);
  const isInitialized = useRef(false);

  // Auto-refresh 1 second after opening
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanvasKey(prev => prev + 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handler to update a specific planet's color
  const handlePlanetColorChange = (planetName, newColor) => {
    setPlanetColors(prevColors => ({
      ...prevColors,
      [planetName]: newColor,
    }));
  };

  // Handler to refresh - reload everything
  const handleRefresh = () => {
    setPlanetColors(INITIAL_PLANET_COLORS);
    setAsteroidColor('#8c949fff');
    setCanvasKey(prev => prev + 1); // Force complete Canvas remount
  };

  // Toggle hide orbits
  const toggleHideOrbits = () => {
    setHideOrbits(prev => !prev);
  };

  return (
    <div className="simulatorWrapper">
      <div className="controlsPanel">
        {/* Asteroid control on the left */}
        <div className="controlItem">
          {/* TRADUCCIÓN: Usamos el mapa para poner "Asteroides" */}
          <label htmlFor="asteroidColor">{PLANET_NAME_MAP["Asteroids"]}</label>
          <input
            type="color"
            id="asteroidColor"
            value={asteroidColor}
            onChange={(e) => setAsteroidColor(e.target.value)}
          />
        </div>
        
        {/* Vertical divider */}
        <div style={{ width: '1px', height: '60px', backgroundColor: 'var(--color-border)' }}></div>

        {/* Planet grid on the right */}
        <div className="planetsGrid">
          {Object.entries(planetColors).map(([name, color]) => (
            <div className="controlItem" key={name}>
              {/* TRADUCCIÓN: Usamos el mapa para los nombres de los planetas */}
              <label htmlFor={`${name}-color`}>{PLANET_NAME_MAP[name] || name}</label>
              <input
                type="color"
                id={`${name}-color`}
                value={color}
                onChange={(e) => handlePlanetColorChange(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom right buttons */}
      <div className="simulatorButtons">
        <button className="simulatorActionButton refreshButton" onClick={handleRefresh}>
          ↻ Recargar
        </button>
        <button className='simulatorActionButton refreshButton' onClick={toggleHideOrbits}>
          {hideOrbits ? 'Mostrar otros asteroides' : 'Ocultar otros asteroides'}
        </button>
        <button className="simulatorActionButton refreshButton" onClick={onReturn}>
          DETALLES DEL ASTEROIDE
        </button>
      </div>

      <Suspense fallback={<div className="text-white">Cargando simulador de órbitas...</div>}>
        <Canvas key={canvasKey} camera={{ position: [20, 20, 20], fov: 75, near: 0.1, far: 1000 }}>
          <Scene 
            planetColors={planetColors} 
            asteroidColor={asteroidColor}
            hideOrbits={hideOrbits}
            targetAsteroid={targetAsteroid}
          />
          
          <OrbitControls minDistance={1} maxDistance={80} target={[0,-0.2,0]} />
          
        </Canvas>
      </Suspense>
    </div>
  );
}

export default OrbitSimulator;