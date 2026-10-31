// src/models/Concept.js
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const conceptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    category: {
      type: String,
      enum: ['definition', 'theory', 'safety', 'capability', 'governance'],
      default: 'theory',
    },
    summary: { type: String, required: true },
    originator: { type: String },
    year: { type: Number },
    tags: [{ type: String, lowercase: true, trim: true }],
    related: [{ type: String }], // slugs of related concepts
  },
  { timestamps: true }
);

conceptSchema.pre('validate', function setSlug(next) {
  if (this.name && !this.slug) this.slug = slugify(this.name);
  next();
});

conceptSchema.index({ name: 'text', summary: 'text', tags: 'text' });

module.exports = mongoose.model('Concept', conceptSchema);
