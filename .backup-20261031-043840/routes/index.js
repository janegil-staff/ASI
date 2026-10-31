// src/routes/index.js
const express = require('express');
const mongoose = require('mongoose');
const crudRouter = require('../utils/crudRouter');
const Concept = require('../models/Concept');
const Organization = require('../models/Organization');
const Milestone = require('../models/Milestone');
const Forecast = require('../models/Forecast');
const forecastsRouter = require('./forecasts');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

router.get('/', (req, res) => {
  res.json({
    name: 'ASI API',
    description: 'Artificial Superintelligence: concepts, organizations, milestones and forecasts',
    endpoints: ['/api/concepts', '/api/organizations', '/api/milestones', '/api/forecasts', '/api/forecasts/summary', '/api/forecasts/trend?target=', '/api/timeline', '/api/search?q='],
  });
});

router.use('/concepts', crudRouter(Concept, { filterable: ['category'], defaultSort: 'name' }));
router.use('/organizations', crudRouter(Organization, { filterable: ['type', 'country'], defaultSort: 'name' }));
router.use('/milestones', crudRouter(Milestone, { filterable: ['kind', 'year'], defaultSort: 'year' }));
router.use('/forecasts', forecastsRouter);

// Chronological timeline, optionally limited by ?from=&to=
router.get('/timeline', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.year = {};
      if (req.query.from) filter.year.$gte = Number(req.query.from);
      if (req.query.to) filter.year.$lte = Number(req.query.to);
    }
    const items = await Milestone.find(filter).sort('year').select('year title kind slug').lean();
    res.json({ total: items.length, items });
  } catch (err) {
    next(err);
  }
});

// Search across all collections
router.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
    const text = { $text: { $search: q } };
    const score = { score: { $meta: 'textScore' } };
    const [concepts, organizations, milestones, forecasts] = await Promise.all([
      Concept.find(text, score).sort(score).limit(10).lean(),
      Organization.find(text, score).sort(score).limit(10).lean(),
      Milestone.find(text, score).sort(score).limit(10).lean(),
      Forecast.find(text, score).sort(score).limit(10).lean(),
    ]);
    res.json({ q, concepts, organizations, milestones, forecasts });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
