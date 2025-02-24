const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const authController = {
  // 🔹 User Registration
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      // Generate JWT Token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        JWT_SECRET,
        {
          expiresIn: "7d", // Token expires in 7 days
        }
      );

      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
        token,
      });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // 🔹 User Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT Token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "Strict",
        expires: new Date(Date.now() + 3600000), // 1-hour expiration
      });

      res.status(200).json({ token, user });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // 🔹 Get User Profile
  myProfile: async (req, res) => {
    try {
      console.log("Fetching profile for user ID:", req.userId);

      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user",
      });
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // 🔹 Logout
  logout: async (req, res) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("❌ Logout error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = authController;
