const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const SALT_ROUNDS = 10;

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if all fields are provided
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      try {
        // Check if user already exists with the same email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "User already exists with this email" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create a new user instance
        const newUser = new User({
          username,
          email,
          password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message
        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        // If the error is due to duplicate key error (email)
        if (error.code === 11000) {
          return res.status(400).json({
            message: "Email already in use. Please use a different email.",
          });
        }

        // Log and respond with a generic server error message
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Server error while creating user" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }

      // Check if password matches
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

      // Send the response with the token and user info
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: error.message });
    }
  },

  // Logout
  logout: async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Ensure this is false in development if testing locally
    sameSite: "None", // Important for cross-origin requests
  });

  return res.status(200).json({ message: "Logged out successfully" });
},

  // Get user profile
  myProfile: async (req, res) => {
    try {
      const userId = req.userId;

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = authController;
