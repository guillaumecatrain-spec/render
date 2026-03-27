import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const SG_KEY = process.env.STORMGLASS_KEY;

app.get('/stormglass', async (req, res) => {
  if (!SG_KEY) {
    return res.status(500).json({ error: 'Missing STORMGLASS_KEY' });
  }

  const LAT = 48.7322;
  const LON = -3.4560;

  // ✅ Version compatible avec le plan gratuit de Stormglass
  const url = `https://api.stormglass.io/v2/weather/point?lat=${LAT}&lng=${LON}&params=windSpeed,windDirection`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: SG_KEY }
    });

    const data = await response.text();
    res.status(response.status).send(data);

  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur', details: String(err) });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Serveur en ligne. Essayez /stormglass');
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});