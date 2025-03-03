const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../utils/config");

const auth = {
  // Middleware to verify login using token from Authorization header
  verifyLogin: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided." });
      }

      const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid token." });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      req.user = user;
      req.userId = decoded.id;
      next();
    } catch (error) {
      console.error("Authentication Error:", error.message);
      res.status(500).json({ message: "Server error during authentication." });
    }
  },
};

module.exports = auth;
