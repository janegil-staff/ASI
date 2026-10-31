// src/controllers/organizationController.js
const Organization = require('../models/Organization');
const crudController = require('./crudController');

module.exports = crudController(Organization, { filterable: ['type', 'country'], defaultSort: 'name' });
