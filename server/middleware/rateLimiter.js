import rateLimit from "express-rate-limit";

// Limiter for standard API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Stricter limiter for Auth routes to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/register attempts from this IP, please try again after 15 minutes",
  },
});

// Extremely strict limiter for the AI analysis endpoint to protect Groq API quota
export const aiAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 analyses per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You have exceeded the maximum number of AI analyses (15) allowed per hour. Please try again later.",
  },
});
