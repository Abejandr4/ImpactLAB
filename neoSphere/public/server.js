const express = require('express');
const fs = require('fs');
const app = express();

// Load data into memory once
const fullData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.get('/impact-data', (req, res) => {
  const { lat, lon, radius } = req.query;
  const centerLat = parseFloat(lat);
  const centerLon = parseFloat(lon);
  const searchRadius = parseFloat(radius);

  const filtered = fullData.filter(point => {
    // Basic Haversine approximation or convert degrees to km
    const ky = 111.1; 
    const kx = 111.1 * Math.cos(centerLat * Math.PI / 180);
    
    const dx = Math.abs(point.lon - centerLon) * kx;
    const dy = Math.abs(point.lat - centerLat) * ky;
    
    const distanceKm = Math.sqrt(dx * dx + dy * dy);
    return distanceKm <= searchRadius;
  });

  // Ensure 'filtered' contains objects formatted as GeoJSON Features
  // if your data.json isn't already in that format.
  res.json(filtered);
});