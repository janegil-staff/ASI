// src/controllers/crudController.js
// Shared CRUD logic for any Mongoose model that uses a "slug" field.
// list supports ?q= (text search) &tag= &page= &limit= &sort= plus the model's filterable fields.
const asyncHandler = require('../utils/asyncHandler');
const clean = require('../utils/clean');

function crudController(Model, { filterable = [], defaultSort = 'name' } = {}) {
  const list = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = {};

    if (req.query.q) filter.$text = { $search: String(req.query.q) };
    if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();
    for (const field of filterable) {
      if (req.query[field] !== undefined) filter[field] = String(req.query[field]);
    }

    const sort = req.query.sort ? String(req.query.sort) : defaultSort;
    const [items, total] = await Promise.all([
      Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(filter),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), items: clean(items) });
  });

  const getOne = asyncHandler(async (req, res) => {
    const item = await Model.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(clean(item));
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(clean(item));
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndUpdate({ slug: req.params.slug }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(clean(item));
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ slug: req.params.slug });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  });

  return { list, getOne, create, update, remove };
}

module.exports = crudController;
