// Vercel Serverless Function Handler
// Routes incoming /api/* requests to the Express application
require('../backend/config/envLoader');
const app = require('../backend/server');

module.exports = app;

