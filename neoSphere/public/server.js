const express = require('express');
const fs = require('fs');
const app = express();

// Load data into memory once
const fullData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

app.get('/impact-data', (req, res) => {
  const { lat, lon, radius } = req.query;
  
  // Filter the array so we only send what's needed
  const filtered = fullData.filter(point => {
    const distance = Math.sqrt(Math.pow(point.lat - lat, 2) + Math.pow(point.lon - lon, 2));
    return distance <= parseFloat(radius);
  });

  res.json(filtered);
});

app.listen(3001, () => console.log('Server running on port 3001'));