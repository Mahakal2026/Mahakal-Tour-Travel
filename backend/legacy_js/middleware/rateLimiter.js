const rateLimit = require("express-rate-limit");

// Global API Rate Limiter
// 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Strict Login Rate Limiter
// 5 failed attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

module.exports = { apiLimiter, loginLimiter };
