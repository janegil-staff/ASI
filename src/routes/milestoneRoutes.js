// src/routes/milestoneRoutes.js
const express = require('express');
const requireApiKey = require('../middleware/requireApiKey');
const { list, getOne, create, update, remove } = require('../controllers/milestoneController');

const router = express.Router();

router.get('/', list);
router.get('/:slug', getOne);
router.post('/', requireApiKey, create);
router.put('/:slug', requireApiKey, update);
router.delete('/:slug', requireApiKey, remove);

module.exports = router;
