import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

const PUEBLA_BOUNDS = {
  north: 20.84, south: 17.88, west: -99.12, east: -96.72
};

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const isInsidePuebla = 
        lat <= PUEBLA_BOUNDS.north && lat >= PUEBLA_BOUNDS.south &&
        lng <= PUEBLA_BOUNDS.east && lng >= PUEBLA_BOUNDS.west;

      if (isInsidePuebla) {
        setPosition([lat, lng]);
      } else {
        alert("Por favor, selecciona una ubicación dentro del estado de Puebla.");
      }
    },
  });
  return position ? <Marker position={position} /> : null;
};

// Receive props from SkyfallX1
const PueblaMap = ({ position, setPosition }) => {
  const outerBounds = [[17.5, -100.0], [21.0, -96.0]];

  return (
    <div className="h-96 w-auto mb-4 rounded-lg overflow-hidden border border-gray-700">
      <MapContainer
        center={position}
        zoom={8}
        maxBounds={outerBounds}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationPicker position={position} setPosition={setPosition} />
        <Marker position={position}>
          <Popup>Punto de Impacto</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PueblaMap;