// src/controllers/conceptController.js
const Concept = require('../models/Concept');
const crudController = require('./crudController');

module.exports = crudController(Concept, { filterable: ['category'], defaultSort: 'name' });
