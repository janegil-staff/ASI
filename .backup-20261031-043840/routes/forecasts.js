// src/routes/forecasts.js
// Extra read endpoints for forecasts. Mounted before the generic CRUD routes
// so /summary, /targets and /trend aren't treated as slugs.
const express = require('express');
const Forecast = require('../models/Forecast');
const crudRouter = require('../utils/crudRouter');

const router = express.Router();

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// GET /api/forecasts/targets  - what each target means
router.get('/targets', (req, res) => {
  res.json(Object.entries(Forecast.TARGETS).map(([key, description]) => ({ key, description })));
});

// GET /api/forecasts/summary  - per target, current (non-superseded) forecasts only
router.get('/summary', async (req, res, next) => {
  try {
    const current = await Forecast.find({ supersededBy: { $in: [null, ''] } }).lean();
    const byTarget = {};
    for (const f of current) {
      (byTarget[f.target] ||= []).push(f);
    }
    const summary = Object.entries(byTarget).map(([target, list]) => {
      const years = list.map((f) => f.medianYear).filter((y) => typeof y === 'number');
      return {
        target,
        description: Forecast.TARGETS[target],
        forecasts: list.length,
        withMedianYear: years.length,
        medianOfMedians: median(years),
        earliest: years.length ? Math.min(...years) : null,
        latest: years.length ? Math.max(...years) : null,
      };
    });
    res.json({
      note: 'Forecasts use different definitions and methods; treat aggregates as a rough overview.',
      summary: summary.sort((a, b) => a.target.localeCompare(b.target)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/forecasts/trend?target=hlmi  - how forecasts moved over time
router.get('/trend', async (req, res, next) => {
  try {
    const target = String(req.query.target || '');
    if (!Forecast.TARGETS[target]) {
      return res.status(400).json({ error: `target must be one of: ${Object.keys(Forecast.TARGETS).join(', ')}` });
    }
    const items = await Forecast.find({ target, medianYear: { $ne: null } })
      .sort('madeYear')
      .select('forecaster forecasterType madeYear medianYear slug -_id')
      .lean();
    res.json({
      target,
      items: items.map((f) => ({ ...f, yearsAhead: f.medianYear - f.madeYear })),
    });
  } catch (err) {
    next(err);
  }
});

router.use(
  '/',
  crudRouter(Forecast, {
    filterable: ['target', 'forecasterType', 'madeYear'],
    defaultSort: 'madeYear',
  })
);

module.exports = router;
