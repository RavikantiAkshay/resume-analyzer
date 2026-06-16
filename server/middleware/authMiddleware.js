import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect private routes using JWT verification
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for JWT in cookies first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Fallback to Bearer token in the Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
      }

      // Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB excluding the password and attach to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      // Proceed to the next middleware or route handler
      return next();
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
        error: err.message,
      });
    }
  }

  // Handle missing token case
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};
