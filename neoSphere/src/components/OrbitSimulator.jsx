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
        const isTarget = nombre === targetAsteroid;
        if (hideOrbits && !isPlanet && !isTarget) return null;

        const color = isPlanet ? planetColors[nombre] : asteroidColor;
        const textPosition = orbitData.coordenadas[0];

        return (
          <React.Fragment key={nombre}>
            <Line
              points={orbitData.coordenadas.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
              color={color}
              lineWidth={isPlanet ? 1.5 : 1}
            />
            <Text
              position={[textPosition[0], textPosition[1] + 0.15, textPosition[2]]}
              fontSize={isPlanet ? 0.25 : 0.1}
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
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [bootTime] = useState(Date.now());
  const [uptime, setUptime] = useState('00:00:00');

  // Uptime ticker para realismo
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
    setCanvasKey(prev => prev + 1);
  };

  const toggleHideOrbits = () => setHideOrbits(prev => !prev);

  return (
    <div className="relative w-full h-full">
      {/* ============ HUD PANEL — TOP LEFT ============ */}
      <div
        className="absolute top-24 left-4 z-30 font-mono text-emerald-400 select-none"
        style={{
          width: panelCollapsed ? '220px' : '360px',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Outer frame with angular cut corners */}
        <div
          className="relative bg-black/85 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          style={{
            clipPath: 'polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))',
          }}
        >
          {/* Scan line overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.4) 2px, rgba(16,185,129,0.4) 3px)',
            }}
          />

          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-500/30 bg-emerald-950/30">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[10px] tracking-[0.2em] text-emerald-300">PANEL DE CONTROL</span>
            </div>
            <button
              onClick={() => setPanelCollapsed(c => !c)}
              className="text-emerald-400 hover:text-emerald-200 text-xs px-1 transition"
            >
              {panelCollapsed ? '[+]' : '[—]'}
            </button>
          </div>

          {/* Status strip */}
          <div className="px-3 py-1.5 border-b border-emerald-500/20 flex justify-between text-[9px] tracking-widest text-emerald-500/70">
            <span>ESTATUS: <span className="text-emerald-300">EN LINEA</span></span>
          </div>

          {!panelCollapsed && (
            <div className="p-3 space-y-3">
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
                <div className="flex-1 h-px bg-emerald-500/30" />
                <span className="text-[9px] tracking-[0.2em] text-emerald-500/60">PLANETAS</span>
                <div className="flex-1 h-px bg-emerald-500/30" />
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
              <div className="pt-2 border-t border-emerald-500/20 flex justify-between text-[9px] tracking-widest text-emerald-500/50">
                <span>CHANNELS: <span className="text-emerald-300">09</span></span>
                <span>SYNC: <span className="text-emerald-300">100%</span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ BOTTOM RIGHT ACTION BUTTONS ============ */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2 font-mono">
        <HudButton onClick={handleRefresh}>↻ RECARGAR</HudButton>
        <HudButton onClick={toggleHideOrbits}>
          {hideOrbits ? '◉ MOSTRAR ASTEROIDES' : '◯ OCULTAR ASTEROIDES'}
        </HudButton>
        <HudButton onClick={onReturn} variant="primary">
          ▶ DETALLES DEL ASTEROIDE
        </HudButton>
      </div>

      {/* ============ CANVAS ============ */}
      <Suspense fallback={<div className="text-emerald-400 font-mono p-4">[SYS] Cargando simulador de órbitas...</div>}>
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
      className={`group relative flex items-center gap-2 px-2 py-1.5 border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400/60 transition cursor-pointer ${compact ? '' : 'border-emerald-500/40'}`}
    >
      {/* Color swatch with glow */}
      <span
        className="relative inline-block w-6 h-6 border border-emerald-500/50 shrink-0"
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

      {/* Text block */}
      <div className="flex flex-col leading-tight min-w-0 flex-1">
        <span className="text-[8px] tracking-[0.15em] text-emerald-500/60 truncate">
          {code}
        </span>
        <span className="text-[11px] text-emerald-200 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>

      {/* LED indicator */}
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] shrink-0" />
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
        relative px-4 py-2 text-xs tracking-[0.15em] uppercase
        border backdrop-blur-md transition-all
        ${isPrimary
          ? 'bg-emerald-900/40 border-emerald-400/60 text-emerald-200 hover:bg-emerald-800/60 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
          : 'bg-black/70 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50 hover:border-emerald-400/60'}
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