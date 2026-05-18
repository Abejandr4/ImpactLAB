import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from 'react-leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import pueblaData from '../assets/data/puebla.json';

const LocationPicker = ({ position, setPosition }) => {
  const [toast, setToast] = React.useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const clickedPoint = point([lng, lat]);
      const feature = {
        type: "Feature",
        geometry: pueblaData.geometries ? pueblaData.geometries[0] : pueblaData,
      };
      const isInsidePuebla = booleanPointInPolygon(clickedPoint, feature);

      if (isInsidePuebla) {
        setPosition([lat, lng]);
        setToast({ msg: "✓ Punto de impacto actualizado", ok: true });
      } else {
        setToast({ msg: "✗ Selecciona dentro de Puebla", ok: false });
      }
      setTimeout(() => setToast(null), 2500);
    },
  });

  return (
    <>
      {position && <Marker position={position} />}
      {toast && (
        <div style={{
          position: "absolute",
          bottom: "3.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: toast.ok ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
          color: "#fff",
          padding: "0.5rem 1.4rem",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: 600,
          zIndex: 1000,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
};

const PueblaMap = ({ position, setPosition }) => {
  const outerBounds = [[17.5, -100.0], [21.0, -96.0]];

  return (
    <MapContainer
      center={position}
      zoom={8}
      maxBounds={outerBounds}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <GeoJSON
        data={{ type: "Feature", geometry: pueblaData.geometries[0] }}
        style={{
          color: "#7c3aed",
          weight: 2.5,
          fillOpacity: 0.04,
          fillColor: "#7c3aed",
        }}
      />
      <LocationPicker position={position} setPosition={setPosition} />
      <Marker position={position}>
        <Popup>Punto de Impacto</Popup>
      </Marker>
    </MapContainer>
  );
};

export default PueblaMap;