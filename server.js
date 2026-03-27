import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const SG_KEY = process.env.STORMGLASS_KEY;

console.log('✅ Serveur Node démarré');
console.log('✅ SG_KEY définie ?', !!SG_KEY);

app.get('/stormglass', async (req, res) => {
  console.log('➡️ Requête reçue sur /stormglass');

  if (!SG_KEY) {
    console.log('❌ SG_KEY manquante !');
    return res.status(500).json({ error: 'Missing STORMGLASS_KEY' });
  }

  const LAT = 48.7322;
  const LON = -3.4560;

  const url = `https://api.stormglass.io/v2/ocean/point?lat=${LAT}&lng=${LON}&params=windSpeed,windDirection,waveHeight,wavePeriod&source=sg`;
  console.log('🌍 URL Stormglass utilisée :', url);

  try {
    console.log('📡 Envoi requête vers Stormglass…');
    const response = await fetch(url, { headers: { Authorization: SG_KEY }});

    console.log('📨 Status Stormglass :', response.status);

    const data = await response.text();
    console.log('✅ Réponse envoyée au client');
    res.status(response.status).send(data);

  } catch (err) {
    console.log('🔥 ERREUR :', err);
    res.status(500).json({ error: 'Erreur serveur', details: String(err) });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Serveur en ligne. Essayez /stormglass');
});

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});