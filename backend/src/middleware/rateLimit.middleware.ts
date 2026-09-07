import { rateLimit } from "express-rate-limit";

const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

export { adminLoginRateLimiter };