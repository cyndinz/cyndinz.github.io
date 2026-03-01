// Shared CORS helper for all API endpoints
// Dynamically sets the correct Access-Control-Allow-Origin based on the request origin

const ALLOWED_ORIGINS = [
  'https://gaafree.com',
  'https://www.gaafree.com',
  'https://gaafree.vercel.app',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Default to production origin
    res.setHeader('Access-Control-Allow-Origin', 'https://gaafree.com');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}
