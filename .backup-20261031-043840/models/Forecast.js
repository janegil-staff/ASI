// src/models/Forecast.js
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

// What is being forecast. Definitions differ between sources, so they are kept apart.
const TARGETS = {
  agi: 'Artificial general intelligence (definition varies by source)',
  hlmi: 'High-level machine intelligence: unaided machines can do every task better and cheaper than humans',
  tai: 'Transformative AI: AI with impact comparable to the industrial revolution',
  asi: 'Artificial superintelligence: far beyond human ability in virtually all domains',
  singularity: 'Technological singularity',
  faol: 'Full automation of labor: all human occupations fully automatable',
};

const probabilitySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    p: { type: Number, required: true, min: 0, max: 1 }, // cumulative probability by that year
  },
  { _id: false }
);

const forecastSchema = new mongoose.Schema(
  {
    forecaster: { type: String, required: true, trim: true },
    forecasterType: {
      type: String,
      enum: ['individual', 'survey', 'community', 'model', 'scenario'],
      required: true,
    },
    slug: { type: String, unique: true, index: true },
    target: { type: String, enum: Object.keys(TARGETS), required: true, index: true },
    madeYear: { type: Number, required: true, index: true },
    medianYear: { type: Number }, // year with ~50% probability (or central estimate); null if not given
    probabilities: [probabilitySchema],
    rangeText: { type: String }, // for vague forecasts, e.g. "a few thousand days"
    summary: { type: String, required: true },
    sourceTitle: { type: String, required: true },
    sourceUrl: { type: String },
    supersededBy: { type: String }, // slug of a newer forecast from the same forecaster
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

forecastSchema.pre('validate', function setSlug(next) {
  if (this.forecaster && !this.slug) {
    this.slug = slugify(`${this.forecaster}-${this.target}-${this.madeYear}`);
  }
  next();
});

forecastSchema.index({ forecaster: 'text', summary: 'text', sourceTitle: 'text', tags: 'text' });

const Forecast = mongoose.model('Forecast', forecastSchema);
Forecast.TARGETS = TARGETS;

module.exports = Forecast;
