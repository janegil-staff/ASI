// src/utils/clean.js
// Removes internal MongoDB/Mongoose fields from API responses.
const HIDDEN = ['_id', '__v', 'createdAt', 'updatedAt', 'score'];

function cleanOne(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  for (const key of HIDDEN) delete obj[key];
  return obj;
}

function clean(data) {
  return Array.isArray(data) ? data.map(cleanOne) : cleanOne(data);
}

module.exports = clean;
