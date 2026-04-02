export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const response = await fetch(decodeURIComponent(url));
    if (!response.ok) return res.status(502).json({ error: 'Upstream fetch failed' });
    const text = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/calendar');
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
