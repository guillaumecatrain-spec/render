import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const SG_KEY = process.env.STORMGLASS_KEY;
const TIDE_KEY = process.env.WORLDTIDES_KEY;

// ✅ Cache Stormglass (3h)
let cachedStormglass = null;
let cacheTime = null;
const CACHE_DURATION = 3 * 60 * 60 * 1000;

// ✅ Route Stormglass avec cache
app.get('/stormglass', async (req, res) => {
  const now = Date.now();

  if (cachedStormglass && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return res.status(200).send(cachedStormglass);
  }

  if (!SG_KEY) {
    return res.status(500).json({ error: 'Missing STORMGLASS_KEY' });
  }

  const LAT = 48.7322;
  const LON = -3.4560;

  const url = `https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LON}&params=windSpeed,windDirection`;

  try {
    const response = await fetch(url, { headers: { Authorization: SG_KEY }});
    const data = await response.text();

    cachedStormglass = data;
    cacheTime = now;

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur Stormglass', details: String(err) });
  }
});

// ✅ Route marées WorldTides
app.get('/tides', async (req, res) => {
  if (!TIDE_KEY) {
    return res.status(500).json({ error: 'Missing WORLDTIDES_KEY' });
  }

  const LAT = 48.7322;
  const LON = -3.4560;

  const url = `https://www.worldtides.info/api/v3?extremes&lat=${LAT}&lon=${LON}&key=${TIDE_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur WorldTides', details: String(err) });
  }
});

// ✅ Page d'affichage Frame 32
app.get('/display', (req, res) => {
  res.sendFile('tides_display_frame32_centered.html', { root: '.' });
});

app.get('/', (req, res) => {
  res.send('✅ API en ligne. Routes : /stormglass, /tides, /display');
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
