// src/controllers/apiController.js
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const clean = require('../utils/clean');
const Concept = require('../models/Concept');
const Organization = require('../models/Organization');
const Milestone = require('../models/Milestone');
const Forecast = require('../models/Forecast');

// GET /api
const info = (req, res) => {
  res.json({
    name: 'ASI API',
    description: 'Artificial Superintelligence: concepts, organizations, milestones and forecasts',
    endpoints: [
      '/api/concepts',
      '/api/organizations',
      '/api/milestones',
      '/api/forecasts',
      '/api/forecasts/targets',
      '/api/forecasts/summary',
      '/api/forecasts/trend?target=',
      '/api/timeline',
      '/api/search?q=',
    ],
  });
};

// GET /api/health
const health = (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
};

// GET /api/search?q=
const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

  const text = { $text: { $search: q } };
  const score = { score: { $meta: 'textScore' } };
  const find = (Model) => Model.find(text, score).sort(score).limit(10).lean();

  const [concepts, organizations, milestones, forecasts] = await Promise.all([
    find(Concept),
    find(Organization),
    find(Milestone),
    find(Forecast),
  ]);

  res.json({
    q,
    concepts: clean(concepts),
    organizations: clean(organizations),
    milestones: clean(milestones),
    forecasts: clean(forecasts),
  });
});

module.exports = { info, health, search };
