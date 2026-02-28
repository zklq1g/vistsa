require('dotenv').config();
const app = require('./server/src/app');

// Vercel serverless functions require exporting the express app directly
// rather than calling app.listen()
module.exports = app;
