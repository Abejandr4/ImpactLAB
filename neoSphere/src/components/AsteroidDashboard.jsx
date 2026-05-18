// src/components/AsteroidDashboard.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; // 1. Import useParams
import useAsteroidStore from '../store';
import AsteroidList from './AsteroidList';
import AsteroidDetails from './AsteroidDetails';

function AsteroidDashboard() {
  const { setAsteroids, setSelectedAsteroid, asteroids } = useAsteroidStore();
  const { asteroidId } = useParams(); // 2. Grab the param from the URL

  useEffect(() => {
    // Construct the correct path for the fetch request
    const jsonUrl = `${import.meta.env.BASE_URL}catalogo_asteroides_web.json`;

    fetch(jsonUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        data.sort((a, b) => (a.identificador || '').localeCompare(b.identificador || ''));
        setAsteroids(data);
      })
      .catch(err => console.error("Error loading asteroid data:", err));
  }, [setAsteroids]);


  // 3. New Effect: Auto-select based on URL
  useEffect(() => {
    if (asteroidId && asteroids.length > 0) {
      // Find asteroid where the identifier or name contains the URL string
      // We decodeURIComponent to handle spaces/special chars in the URL
      const decodedId = decodeURIComponent(asteroidId).toLowerCase();
      
      const match = asteroids.find(a => 
        (a.identificador && a.identificador.toLowerCase().includes(decodedId)) ||
        (a.full_name && a.full_name.toLowerCase().includes(decodedId))
      );

      if (match) {
        setSelectedAsteroid(match);
      }
    }
  }, [asteroidId, asteroids, setSelectedAsteroid]);

  return (
    <div className="dashboardContainer">
      <div className="listColumn">
        <AsteroidList />
      </div>
      <div className="detailsColumn">
        <AsteroidDetails />
      </div>
    </div>
  );
}

export default AsteroidDashboard;