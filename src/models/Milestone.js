// src/models/Milestone.js
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    year: { type: Number, required: true, index: true },
    kind: {
      type: String,
      enum: ['idea', 'publication', 'organization', 'statement', 'policy', 'technical'],
      default: 'idea',
    },
    description: { type: String, required: true },
    people: [{ type: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

milestoneSchema.pre('validate', function setSlug(next) {
  if (this.title && !this.slug) this.slug = slugify(`${this.year}-${this.title}`);
  next();
});

milestoneSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Milestone', milestoneSchema);
