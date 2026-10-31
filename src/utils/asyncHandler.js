// src/utils/asyncHandler.js
// Wraps async controller functions so thrown errors reach the error handler.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
