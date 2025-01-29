const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const SALT_ROUNDS = 10;

const authController = {
  register: async (req, res) => {
    try {
      console.log("🔹 Incoming Registration Data:", req.body); // ✅ Log raw input

      const { username, email, password, role } = req.body;

      if (!role) {
        console.warn("⚠️ No role provided in request. Defaulting to 'user'.");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn("⚠️ User already exists:", existingUser);
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: role || "user", // ✅ Ensure role is set
      });

      await newUser.save();
      console.log("✅ User Registered Successfully:", newUser); // ✅ Log saved user

      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      console.error("❌ Error Registering User:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

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
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ token, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  myProfile: async (req, res) => {
    try {
      console.log("Fetching profile for user ID:", req.userId); // ✅ Debugging

      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        console.warn("User not found in database:", req.userId);
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || "user", // ✅ Ensure role is returned
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  logout: async (req, res) => {
    res.status(200).json({ message: "Logout successful" });
  },
};
  // // Logout
  // logout: async (req, res) => {
  // res.clearCookie("token", {
  //   httpOnly: true,
  //   secure: false, // Ensure this is false in development if testing locally
  //   sameSite: "None", // Important for cross-origin requests
  // });
module.exports = authController;
