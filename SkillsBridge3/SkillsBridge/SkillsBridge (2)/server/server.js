const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public/
const publicPath = path.resolve(__dirname, '..', 'public');
console.log(`Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Catch-all for 404s
app.use((req, res) => {
  console.log(`404: Could not find ${req.url}`);
  res.status(404).send('Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
