// src/server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`ASI API running on http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
