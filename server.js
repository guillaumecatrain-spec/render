import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const SG_KEY = process.env.STORMGLASS_KEY;
const TIDE_KEY = process.env.WORLDTIDES_KEY; // <!-- add this in Render Env Vars

app.get('/stormglass', async (req, res) => {
  if (!SG_KEY) return res.status(500).json({ error: 'Missing STORMGLASS_KEY' });

  const LAT = 48.7322;
  const LON = -3.4560;
  const url = `https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LON}&params=windSpeed,windDirection`;

  try {
    const response = await fetch(url, { headers: { Authorization: SG_KEY }});
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: String(err) });
  }
});

// ✅ Route des marées via WorldTides API
app.get('/tides', async (req, res) => {
  if (!TIDE_KEY) return res.status(500).json({ error: 'Missing WORLDTIDES_KEY' });

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

app.get('/', (req, res) => {
  res.send('✅ API en ligne. Routes : /stormglass et /tides');
});

app.get("/display", (req, res) => {
  res.sendFile("tides_display.html", { root: "." });
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
