// src/components/OrbitSimulator.jsx
import React, { useState, useEffect, Suspense, useMemo } from 'react';
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
  "Asteroids": "Asteroides"
};

const PLANET_CODES = {
  "Mercury": "MER-01",
  "Venus":   "VEN-02",
  "Earth":   "TER-03",
  "Mars":    "MAR-04",
  "Jupiter": "JUP-05",
  "Saturn":  "SAT-06",
  "Uranus":  "URA-07",
  "Neptune": "NEP-08",
};

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
        const isPlanet = planetColors.hasOwnProperty(nombre);
        
        const isTarget = targetAsteroid && (
          nombre.toLowerCase().includes(targetAsteroid.toLowerCase()) ||
          targetAsteroid.toLowerCase().includes(nombre.toLowerCase())
        );

        if (hideOrbits && !isPlanet && !isTarget) return null;

        const color = isPlanet 
          ? planetColors[nombre] 
          : isTarget 
            ? '#ff0055' 
            : asteroidColor;

        const lineWidth = isPlanet ? 1.5 : isTarget ? 3.0 : 1;
        const textPosition = orbitData.coordenadas[0];

        return (
          <React.Fragment key={nombre}>
            <Line
              points={orbitData.coordenadas.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
              color={color}
              lineWidth={lineWidth}
            />
            <Text
              position={[textPosition[0], textPosition[1] + 0.15, textPosition[2]]}
              fontSize={isPlanet ? 0.25 : isTarget ? 0.22 : 0.1}
              color={isTarget ? '#ff0055' : 'white'}
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

function OrbitSimulator({ onReturn, targetAsteroid, asteroids = [], selectedAsteroid, setSelectedAsteroid }) {
  const [planetColors, setPlanetColors] = useState(INITIAL_PLANET_COLORS);
  const [asteroidColor, setAsteroidColor] = useState('#8c949fff');
  const [canvasKey, setCanvasKey] = useState(0);
  const [hideOrbits, setHideOrbits] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [bootTime] = useState(Date.now());
  const [uptime, setUptime] = useState('00:00:00');
  const [localSearch, setLocalSearch] = useState("");

  const hudFilteredAsteroids = useMemo(() => {
    if (!localSearch) return asteroids;
    return asteroids.filter(ast => {
      const name = (ast.full_name || ast.identificador || "").toLowerCase();
      return name.includes(localSearch.toLowerCase());
    });
  }, [asteroids, localSearch]);

  useEffect(() => {
    if (targetAsteroid) {
      setHideOrbits(true);
    }
  }, [targetAsteroid]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - bootTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [bootTime]);

  useEffect(() => {
    const timer = setTimeout(() => setCanvasKey(prev => prev + 1), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlanetColorChange = (planetName, newColor) => {
    setPlanetColors(prev => ({ ...prev, [planetName]: newColor }));
  };

  const handleRefresh = () => {
    setPlanetColors(INITIAL_PLANET_COLORS);
    setAsteroidColor('#8c949fff');
    setHideOrbits(targetAsteroid ? true : false);
    setCanvasKey(prev => prev + 1);
  };

  const toggleHideOrbits = () => setHideOrbits(prev => !prev);

  return (
    <div className="relative w-full h-full">
      {/* ============ HUD PANEL — CENTERED VERTICALLY ============ */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-4 z-30 font-sans text-violet-400 select-none flex flex-col"
        style={{
          width: panelCollapsed ? '220px' : '360px',
          transition: 'width 0.3s ease',
          maxHeight: '85%'
        }}
      >
        <div
          className="relative bg-[#a855f7]/20 border border-[#a855f7]/50 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden"
          style={{
            clipPath: 'polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))',
          }}
        >
          {/* Scan line overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168,85,247,0.4) 2px, rgba(168,85,247,0.4) 3px)',
            }}
          />

          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-violet-500/30 bg-violet-950/30 shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_6px_#a855f7]" />
              <span className="text-[10px] tracking-[0.2em] text-violet-300">PANEL DE CONTROL</span>
            </div>
            <button
              onClick={() => setPanelCollapsed(c => !c)}
              className="text-violet-400 hover:text-violet-200 text-xs px-1 transition"
            >
              {panelCollapsed ? '[+]' : '[—]'}
            </button>
          </div>

          {/* Status strip */}
          <div className="px-3 py-1.5 border-b border-violet-500/20 flex justify-between text-[9px] tracking-widest text-violet-500/70 shrink-0">
            <span>ESTATUS: <span className="text-violet-300">EN LINEA</span></span>
            <span>SYS_UP: <span className="text-violet-300">{uptime}</span></span>
          </div>

          {!panelCollapsed && (
            <div className="p-3 space-y-3 overflow-y-auto max-h-[65vh]">
              
              {/* LISTA INTERACTIVA DE SELECCIÓN */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] tracking-[0.2em] text-violet-500/60 uppercase font-bold">// SELECCIÓN DE OBJETIVO</span>
                <input 
                  type="text"
                  placeholder="Filtrar lista..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-violet-950/40 border border-violet-500/30 px-2 py-1 text-xs text-violet-300 placeholder:text-violet-800 focus:outline-none focus:border-violet-400 rounded-sm font-sans"
                />
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto border border-violet-500/20 bg-black/50 p-1 rounded-sm">
                  {hudFilteredAsteroids.length === 0 ? (
                    <span className="text-[10px] text-violet-700 p-1 italic text-center">Sin asteroides</span>
                  ) : (
                    hudFilteredAsteroids.map(ast => {
                      const currentName = ast.full_name || ast.identificador;
                      const isSelected = selectedAsteroid?.identificador === ast.identificador;
                      
                      return (
                        <button
                          key={ast.identificador}
                          onClick={() => setSelectedAsteroid(ast)}
                          className={`w-full text-left px-2 py-1 text-[11px] font-sans transition-all flex justify-between ${
                            isSelected 
                              ? 'bg-violet-500/20 text-violet-200 font-bold border-l-2 border-violet-400 pl-1' 
                              : 'bg-transparent text-violet-500/60 hover:bg-violet-500/10'
                          }`}
                        >
                          <span className="truncate pr-1">{isSelected ? '▶ ' : ''}{currentName}</span>
                          <span className="text-[9px] opacity-40 shrink-0">{ast.diameter ? `${ast.diameter.toFixed(1)}km` : ''}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* DETALLES MATEMÁTICOS DE TELEMETRÍA */}
              {selectedAsteroid && (
                <div className="p-2.5 bg-violet-950/20 border border-violet-500/30 rounded-sm text-[11px] space-y-1">
                  <div className="text-violet-300 font-bold truncate">TARGET: {targetAsteroid}</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-violet-400/80 pt-1 border-t border-violet-500/10">
                    <div>DIÁMETRO: <span className="text-violet-200">{selectedAsteroid.diameter ? `${selectedAsteroid.diameter.toFixed(2)} km` : 'N/D'}</span></div>
                    <div>PERIHELIO: <span className="text-violet-200">{selectedAsteroid.q ? `${selectedAsteroid.q.toFixed(2)} UA` : 'N/D'}</span></div>
                    <div>AFELIO: <span className="text-violet-200">{selectedAsteroid.ad ? `${selectedAsteroid.ad.toFixed(2)} UA` : 'N/D'}</span></div>
                    <div>PELIGROSO: <span className={selectedAsteroid.es_peligroso === true || selectedAsteroid.es_peligroso === 'Y' ? "text-rose-400 font-bold" : "text-violet-300"}>{selectedAsteroid.es_peligroso === true || selectedAsteroid.es_peligroso === 'Y' ? 'PHA' : 'NO'}</span></div>
                  </div>
                </div>
              )}

              {/* Asteroid channel */}
              <div>
                <ColorChannel
                  code="AST-Σ"
                  label={PLANET_NAME_MAP["Asteroids"]}
                  color={asteroidColor}
                  onChange={(c) => setAsteroidColor(c)}
                />
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-violet-500/30" />
                <span className="text-[9px] tracking-[0.2em] text-violet-500/60 font-bold">PLANETAS</span>
                <div className="flex-1 h-px bg-violet-500/30" />
              </div>

              {/* Planet channels */}
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(planetColors).map(([name, color]) => (
                  <ColorChannel
                    key={name}
                    code={PLANET_CODES[name] || name.slice(0, 3).toUpperCase()}
                    label={PLANET_NAME_MAP[name] || name}
                    color={color}
                    onChange={(c) => handlePlanetColorChange(name, c)}
                    compact
                  />
                ))}
              </div>

              {/* Footer readout */}
              <div className="pt-2 border-t border-violet-500/20 flex justify-between text-[9px] tracking-widest text-violet-500/50 shrink-0">
                <span>CHANNELS: <span className="text-violet-300">09</span></span>
                <span>SYNC: <span className="text-violet-300">100%</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ BOTTOM RIGHT ACTION BUTTONS ============ */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 font-sans">
        <HudButton onClick={handleRefresh}>↻ RECARGAR</HudButton>
        <HudButton onClick={toggleHideOrbits}>
          {hideOrbits ? '◉ MOSTRAR ASTEROIDES' : '◯ OCULTAR ASTEROIDES'}
        </HudButton>
      </div>

      {/* ============ CANVAS RENDERING ORIGINAL NATIVO ============ */}
      <Suspense fallback={<div className="text-violet-400 font-sans p-4">[SYS] Cargando simulador de órbitas...</div>}>
        <Canvas
          key={canvasKey}
          camera={{ position: [20, 20, 20], fov: 75, near: 0.1, far: 1000 }}
          className="absolute inset-0 z-0"
        >
          <Scene
            planetColors={planetColors}
            asteroidColor={asteroidColor}
            hideOrbits={hideOrbits}
            targetAsteroid={targetAsteroid}
          />
          <OrbitControls minDistance={1} maxDistance={80} target={[0, -0.2, 0]} />
        </Canvas>
      </Suspense>
    </div>
  );
}

/* ------- Sub-componente: canal de color individual ------- */
function ColorChannel({ code, label, color, onChange, compact = false }) {
  return (
    <label
      className={`group relative flex items-center gap-2 px-2 py-1.5 border border-violet-500/20 bg-violet-950/20 hover:bg-violet-900/30 hover:border-violet-400/60 transition cursor-pointer ${compact ? '' : 'border-violet-500/40'}`}
    >
      <span
        className="relative inline-block w-6 h-6 border border-violet-500/50 shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      >
        <input
          type="color"
          value={color.length === 9 ? color.slice(0, 7) : color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </span>

      <div className="flex flex-col leading-tight min-w-0 flex-1 font-sans">
        <span className="text-[8px] tracking-[0.15em] text-violet-500/60 truncate">
          {code}
        </span>
        <span className="text-[11px] text-violet-200 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>

      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_4px_#a855f7] shrink-0" />
    </label>
  );
}

/* ------- Sub-componente: botón HUD ------- */
function HudButton({ children, onClick, variant = 'default' }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 text-xs tracking-[0.15em] uppercase font-sans
        border backdrop-blur-md transition-all
        ${isPrimary
          ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 border-violet-400/60 text-violet-200 hover:bg-violet-800/60 hover:border-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
          : 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-violet-400 hover:bg-violet-950/50 hover:border-violet-400/60'}
      `}
      style={{
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
      }}
    >
      {children}
    </button>
  );
}

export default OrbitSimulator;