// src/middleware/requireApiKey.js
// Protects write routes. Send the key in the "x-api-key" header.
function requireApiKey(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'Write access is disabled (ADMIN_API_KEY not set)' });
  }
  if (req.get('x-api-key') !== expected) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

module.exports = requireApiKey;
