// src/utils/crudRouter.js
// Builds a REST router for a Mongoose model:
//   GET    /            list (?q=search &tag= &page= &limit= &sort= + any filterable field)
//   GET    /:slug       get one
//   POST   /            create   (x-api-key)
//   PUT    /:slug       update   (x-api-key)
//   DELETE /:slug       delete   (x-api-key)
const express = require('express');
const requireApiKey = require('../middleware/requireApiKey');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function crudRouter(Model, { filterable = [], defaultSort = 'name' } = {}) {
  const router = express.Router();

  router.get(
    '/',
    wrap(async (req, res) => {
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

      res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
    })
  );

  router.get(
    '/:slug',
    wrap(async (req, res) => {
      const item = await Model.findOne({ slug: req.params.slug }).lean();
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    })
  );

  router.post(
    '/',
    requireApiKey,
    wrap(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    })
  );

  router.put(
    '/:slug',
    requireApiKey,
    wrap(async (req, res) => {
      const item = await Model.findOneAndUpdate({ slug: req.params.slug }, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    })
  );

  router.delete(
    '/:slug',
    requireApiKey,
    wrap(async (req, res) => {
      const item = await Model.findOneAndDelete({ slug: req.params.slug });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    })
  );

  return router;
}

module.exports = crudRouter;
