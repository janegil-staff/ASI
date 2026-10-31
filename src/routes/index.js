// src/routes/index.js
const express = require('express');
const { info, health, search } = require('../controllers/apiController');
const { timeline } = require('../controllers/milestoneController');
const conceptRoutes = require('./conceptRoutes');
const organizationRoutes = require('./organizationRoutes');
const milestoneRoutes = require('./milestoneRoutes');
const forecastRoutes = require('./forecastRoutes');

const router = express.Router();

router.get('/', info);
router.get('/health', health);
router.get('/search', search);
router.get('/timeline', timeline);

router.use('/concepts', conceptRoutes);
router.use('/organizations', organizationRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/forecasts', forecastRoutes);

module.exports = router;
