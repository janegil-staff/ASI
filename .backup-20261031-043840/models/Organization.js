// src/models/Organization.js
const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    type: {
      type: String,
      enum: ['lab', 'research', 'nonprofit', 'government', 'other'],
      default: 'other',
    },
    focus: { type: String, required: true },
    founded: { type: Number },
    closed: { type: Number },
    country: { type: String },
    website: { type: String },
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

organizationSchema.pre('validate', function setSlug(next) {
  if (this.name && !this.slug) this.slug = slugify(this.name);
  next();
});

organizationSchema.index({ name: 'text', focus: 'text', tags: 'text' });

module.exports = mongoose.model('Organization', organizationSchema);
