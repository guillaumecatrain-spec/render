import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const SG_KEY = process.env.STORMGLASS_KEY;
const TIDE_KEY = process.env.WORLDTIDES_KEY;

// ✅ Stormglass cache (3h)
let cachedStormglass = null;
let cacheStormTime = null;
const STORM_CACHE_DURATION = 3 * 60 * 60 * 1000;

app.get('/stormglass', async (req, res) => {
  const now = Date.now();
  if (cachedStormglass && cacheStormTime && (now - cacheStormTime < STORM_CACHE_DURATION)) {
    return res.status(200).send(cachedStormglass);
  }
  if (!SG_KEY) return res.status(500).json({ error: 'Missing STORMGLASS_KEY' });

  const LAT = 48.7322;
  const LON = -3.4560;
  const url = `https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LON}&params=windSpeed,windDirection`;

  try {
    const response = await fetch(url, { headers: { Authorization: SG_KEY }});
    const data = await response.text();
    cachedStormglass = data;
    cacheStormTime = now;
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur Stormglass', details: String(err) });
  }
});

// ✅ WorldTides cache (3 appels/jour = toutes les 8h)
let cachedTides = null;
let cacheTidesTime = null;
const TIDES_CACHE_DURATION = 8 * 60 * 60 * 1000;

app.get('/tides', async (req, res) => {
  const now = Date.now();
  if (cachedTides && cacheTidesTime && (now - cacheTidesTime < TIDES_CACHE_DURATION)) {
    return res.status(200).send(cachedTides);
  }
  if (!TIDE_KEY) return res.status(500).json({ error: 'Missing WORLDTIDES_KEY' });

  const LAT = 48.7322;
  const LON = -3.4560;
  const url = `https://www.worldtides.info/api/v3?extremes&lat=${LAT}&lon=${LON}&key=${TIDE_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    cachedTides = data;
    cacheTidesTime = now;
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur WorldTides', details: String(err) });
  }
});

// ✅ Display
app.get('/display', (req, res) => {
  res.sendFile('display_no_wind_panel.html', { root: '.' });
});

// ✅ Index
app.get('/', (req, res) => {
  res.sendFile('index_centered.html', { root: '.' });
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
