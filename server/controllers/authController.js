import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key_12345", {
    expiresIn: "7d",
  });
};

/**
 * Register a new user
 * POST /auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Exclude password from the returned object
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: userResponse,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user data provided",
      });
    }
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error occurred during registration",
      error: err.message,
    });
  }
};

/**
 * Authenticate a user and get token
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Auth success - return user details and token
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({
      success: true,
      message: "Successfully logged in",
      token: generateToken(user._id),
      user: userResponse,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error occurred during login",
      error: err.message,
    });
  }
};

/**
 * Authenticate a user via Google Sign-In
 * POST /auth/google
 */
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({
        success: false,
        message: "Google Sign-In is not configured on the server",
      });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not provide an email address",
      });
    }

    // 1. Try to find user by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. If not found by googleId, check if email already exists
      user = await User.findOne({ email });

      if (user) {
        // Link Google ID to existing email account
        user.googleId = googleId;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      } else {
        // 3. Create new user if they don't exist
        user = await User.create({
          name: name || email.split("@")[0],
          email,
          googleId,
          avatar,
        });
      }
    } else {
      // If user exists and picture has updated, update avatar
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    res.json({
      success: true,
      message: "Successfully authenticated with Google",
      token: generateToken(user._id),
      user: userResponse,
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(400).json({
      success: false,
      message: "Google authentication failed",
      error: err.message,
    });
  }
};

/**
 * Get current authenticated user profile
 * GET /auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching profile",
      error: err.message,
    });
  }
};
