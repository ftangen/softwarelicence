const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const { runMigrations } = require('./db/migrate');
const apiRouter = require('./routes');
const HttpError = require('./utils/httpError');

runMigrations();

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Serves the built frontend (frontend/dist) once it exists. In dev, the
// frontend runs separately via its own Vite dev server + proxy instead.
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Software & License Tracker backend listening on port ${PORT}`);
});
