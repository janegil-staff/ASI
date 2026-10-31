// src/controllers/forecastController.js
const Forecast = require('../models/Forecast');
const crudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const clean = require('../utils/clean');

const crud = crudController(Forecast, {
  filterable: ['target', 'forecasterType', 'madeYear'],
  defaultSort: 'madeYear',
});

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// GET /api/forecasts/targets
const targets = (req, res) => {
  res.json(Object.entries(Forecast.TARGETS).map(([key, description]) => ({ key, description })));
};

// GET /api/forecasts/summary  (current, non-superseded forecasts only)
const summary = asyncHandler(async (req, res) => {
  const current = await Forecast.find({ supersededBy: { $in: [null, ''] } }).lean();
  const byTarget = {};
  for (const f of current) {
    (byTarget[f.target] ||= []).push(f);
  }

  const result = Object.entries(byTarget).map(([target, list]) => {
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
    summary: result.sort((a, b) => a.target.localeCompare(b.target)),
  });
});

// GET /api/forecasts/trend?target=hlmi
const trend = asyncHandler(async (req, res) => {
  const target = String(req.query.target || '');
  if (!Forecast.TARGETS[target]) {
    return res.status(400).json({ error: `target must be one of: ${Object.keys(Forecast.TARGETS).join(', ')}` });
  }
  const items = await Forecast.find({ target, medianYear: { $ne: null } })
    .sort('madeYear')
    .select('forecaster forecasterType madeYear medianYear slug')
    .lean();

  res.json({
    target,
    items: clean(items).map((f) => ({ ...f, yearsAhead: f.medianYear - f.madeYear })),
  });
});

module.exports = { ...crud, targets, summary, trend };
