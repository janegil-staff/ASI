// src/controllers/milestoneController.js
const Milestone = require('../models/Milestone');
const crudController = require('./crudController');
const asyncHandler = require('../utils/asyncHandler');
const clean = require('../utils/clean');

const crud = crudController(Milestone, { filterable: ['kind', 'year'], defaultSort: 'year' });

// GET /api/timeline?from=&to=
const timeline = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter.year = {};
    if (req.query.from) filter.year.$gte = Number(req.query.from);
    if (req.query.to) filter.year.$lte = Number(req.query.to);
  }
  const items = await Milestone.find(filter).sort('year').select('year title kind slug').lean();
  res.json({ total: items.length, items: clean(items) });
});

module.exports = { ...crud, timeline };
