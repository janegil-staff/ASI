// src/seed/seed.js
// Usage: npm run seed   (wipes and refills all collections)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Concept = require('../models/Concept');
const Organization = require('../models/Organization');
const Milestone = require('../models/Milestone');
const Forecast = require('../models/Forecast');
const { concepts, organizations, milestones } = require('./data');
const forecasts = require('./forecasts');

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    await Promise.all([Concept.deleteMany({}), Organization.deleteMany({}), Milestone.deleteMany({}), Forecast.deleteMany({})]);

    // create() (not insertMany) so the pre-validate slug hooks run
    await Concept.create(concepts);
    await Organization.create(organizations);
    await Milestone.create(milestones);
    await Forecast.create(forecasts);
    await Promise.all([Concept.syncIndexes(), Organization.syncIndexes(), Milestone.syncIndexes(), Forecast.syncIndexes()]);

    console.log(`Seeded ${concepts.length} concepts, ${organizations.length} organizations, ${milestones.length} milestones, ${forecasts.length} forecasts`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
