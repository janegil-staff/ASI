// src/routes/forecastRoutes.js
const express = require('express');
const requireApiKey = require('../middleware/requireApiKey');
const {
  list,
  getOne,
  create,
  update,
  remove,
  targets,
  summary,
  trend,
} = require('../controllers/forecastController');

const router = express.Router();

// Fixed paths before /:slug so they aren't read as slugs
router.get('/targets', targets);
router.get('/summary', summary);
router.get('/trend', trend);

router.get('/', list);
router.get('/:slug', getOne);
router.post('/', requireApiKey, create);
router.put('/:slug', requireApiKey, update);
router.delete('/:slug', requireApiKey, remove);

module.exports = router;
