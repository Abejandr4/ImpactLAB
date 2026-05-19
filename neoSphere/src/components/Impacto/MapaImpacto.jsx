// src/components/Impacto/MapaImpacto.jsx
//
// Mapa Leaflet con lógica condicional de círculos:
//
//   - Categoría normal (crater/termica/onda/sismo/eyecta):
//       - Círculo máximo: radio del efecto, opacidad baja (~15%)
//       - Círculo observador: distancia actual del slider,
//                              clampeada al máximo, opacidad alta (~40%)
//
//   - Categoría "vulnerabilidad" (Pérdidas):
//       - TODOS los círculos máximos de los efectos disponibles, a la vez
//       - El chip activo (filtroEfecto) se resalta (opacidad media + borde)
//       - Los demás quedan tenues (solo contorno fino)
//       - Si filtroEfecto === "todos", todos se ven con opacidad uniforme
//
// Auto-zoom: cuando cambia openCategory, el mapa hace fitBounds del radio
// máximo activo para que encaje en el viewport.

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { PALETTE, CATEGORIES } from "../../utils/categorias";
import Tooltip from "./Tooltip";
import { analogiaEnergia } from "../../utils/analogias";

const MAP_ZOOM_DEFAULT = 9;

// =============================================================
// Helpers
// =============================================================

// Lista de efectos que se pueden dibujar en modo Pérdidas, con el radioKey
// que corresponde en affectedData. Orden: del más grande al más chico
// (se pintan en este orden para que los chicos queden encima visualmente).
const EFECTOS_VULNERABILIDAD = [
  { id: "sismo",   catId: "sismo",   radioKey: "seismicRadius_km",  requiresSuperficial: true  },
  { id: "termica", catId: "termica", radioKey: "thermalRadius_km",  requiresSuperficial: false },
  { id: "onda",    catId: "onda",    radioKey: "blastRadius_km",    requiresSuperficial: false },
  { id: "eyecta",  catId: "ejecta",  radioKey: "ejectaRadius_km",   requiresSuperficial: true  },
  { id: "crater",  catId: "crater",  radioKey: "craterRadius_km",   requiresSuperficial: true  },
];

const getColor = (catId) =>
  CATEGORIES.find((c) => c.id === catId)?.hex || PALETTE.textSec;

// Devuelve el radioKey de la categoría abierta (no aplica a vulnerabilidad).
const getRadioKey = (catId) =>
  CATEGORIES.find((c) => c.id === catId)?.radioKey;

// =============================================================
// Componente interno: ajusta el zoom según la categoría activa
// =============================================================
// Vive DENTRO del MapContainer para tener acceso al hook useMap().
const AutoZoom = ({ impactPos, radioMaximo_m }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!radioMaximo_m || radioMaximo_m <= 0) {
      map.setView(impactPos, MAP_ZOOM_DEFAULT, { animate: true });
      return;
    }

    // toBounds(diametro) acepta el diámetro en metros y devuelve un LatLngBounds
    // centrado en el latLng. No requiere que un círculo esté añadido al mapa,
    // a diferencia de L.circle(...).getBounds() que sí requiere renderer.
    const bounds = L.latLng(impactPos[0], impactPos[1]).toBounds(
      radioMaximo_m * 2
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 14,
      animate: true,
    });
  }, [map, impactPos, radioMaximo_m]);

  return null;
};

// =============================================================
// Componente principal
// =============================================================

const MapaImpacto = ({
  impactPos,
  openCategory,
  filtroEfecto,
  affectedData,
  currentDistanceKm,
  isAirburst,
  impactEnergyMegatons,
  tooltipAbierto,      
  onToggleTooltip,
}) => {
  // -----------------------------------------------------------
  // CÁLCULO DEL RADIO MÁXIMO PARA AUTO-ZOOM
  // -----------------------------------------------------------
  let radioMaximo_m = 0;

  if (openCategory === "vulnerabilidad") {
    const efectos = EFECTOS_VULNERABILIDAD.filter(
      (e) => !isAirburst || !e.requiresSuperficial
    );
    radioMaximo_m = Math.max(
      ...efectos.map((e) => (affectedData?.[e.radioKey] || 0) * 1000),
      0
    );
  } else {
    const radioKey = getRadioKey(openCategory);
    radioMaximo_m = (affectedData?.[radioKey] || 0) * 1000;
  }

  // -----------------------------------------------------------
  // CÍRCULOS A DIBUJAR
  // -----------------------------------------------------------
  const renderCirculos = () => {
    // ---------------- MODO PÉRDIDAS ----------------
    if (openCategory === "vulnerabilidad") {
      const efectos = EFECTOS_VULNERABILIDAD.filter(
        (e) => !isAirburst || !e.requiresSuperficial
      );

      return efectos.map((e) => {
        const radio_m = (affectedData?.[e.radioKey] || 0) * 1000;
        if (radio_m <= 0) return null;

        const color = getColor(e.catId);
        const isActive = filtroEfecto === e.id;
        const isTodos = filtroEfecto === "todos";

        let fillOpacity, weight, opacity;
        if (isTodos) {
          fillOpacity = 0.18;
          weight = 1.5;
          opacity = 0.8;
        } else if (isActive) {
          fillOpacity = 0.4;
          weight = 3;
          opacity = 1;
        } else {
          fillOpacity = 0.05;
          weight = 1;
          opacity = 0.5;
        }

        return (
          <Circle
            key={e.id}
            center={impactPos}
            radius={radio_m}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity,
              weight,
              opacity,
            }}
          />
        );
      });
    }

    // ---------------- MODO CATEGORÍA NORMAL ----------------
    if (radioMaximo_m <= 0) {
      return <Marker position={impactPos} />;
    }

    const cat = CATEGORIES.find((c) => c.id === openCategory);
    const color = cat?.hex || PALETTE.textSec;

    const observador_m = Math.min(
      (currentDistanceKm || 0) * 1000,
      radioMaximo_m
    );

    return (
      <>
        <Circle
          center={impactPos}
          radius={radioMaximo_m}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.13,
            weight: 1.5,
            opacity: 0.6,
          }}
        />
        {observador_m > 0 && (
          <Circle
            center={impactPos}
            radius={observador_m}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.38,
              weight: 3,
              opacity: 1,
            }}
          />
        )}
      </>
    );
  };

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        borderRadius: 16,
        border: `1px solid ${PALETTE.cardBorder}`,
      }}
    >
      <div
        className="absolute top-4 left-4 z-[500] px-3 py-1.5 rounded-lg backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: `1px solid ${PALETTE.cardBorder}`,
        }}
      >
        <span
          style={{
            color: PALETTE.textSec,
            fontSize: "0.78rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {impactPos[0].toFixed(4)}°N · {Math.abs(impactPos[1]).toFixed(4)}°O
        </span>
      </div>

      <div
        className="absolute bottom-4 left-4 z-[500] px-4 py-3 rounded-2xl backdrop-blur-md"
        style={{
          background: "rgba(0,0,0,0.8)",
          border: `1px solid ${PALETTE.cardBorder}`,
          maxWidth: 340,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "0.25rem",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: PALETTE.textSec,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Energía total liberada
          </span>
          <Tooltip
            tooltipId="global.energia"
            abierto={tooltipAbierto === "global.energia"}
            onToggle={() => onToggleTooltip("global.energia")}
            accent="#fff"
          />
        </div>

        <p
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {(impactEnergyMegatons || 0).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}{" "}
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 400,
              color: PALETTE.textSec,
            }}
          >
            MT
          </span>
        </p>

        {analogiaEnergia(impactEnergyMegatons) && (
          <p
            style={{
              margin: "0.4rem 0 0",
              fontSize: "0.8rem",
              color: PALETTE.textMain,
              fontStyle: "italic",
              opacity: 0.85,
              lineHeight: 1.4,
            }}
          >
            ≈ {analogiaEnergia(impactEnergyMegatons)}
          </p>
        )}
      </div>

      <MapContainer
        center={impactPos}
        zoom={MAP_ZOOM_DEFAULT}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#000" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {renderCirculos()}

        <AutoZoom impactPos={impactPos} radioMaximo_m={radioMaximo_m} />
      </MapContainer>
    </div>
  );
};

export default MapaImpacto;