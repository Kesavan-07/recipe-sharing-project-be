const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = {
  // Middleware to verify login
  verifyLogin: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is missing." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password"); // Exclude password

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      req.user = user;
      req.userId = decoded.id;
      next();
    } catch (error) {
      console.error("Error verifying token:", error.message);
      res.status(401).json({ message: "Unauthorized: Invalid token." });
    }
  },

  // Middleware to verify user can follow/unfollow (Authentication required)
  verifyFollow: async (req, res, next) => {
    try {
      const { id } = req.params; // The user being followed/unfollowed
      const loggedInUser = await User.findById(req.userId);

      if (!loggedInUser) {
        return res.status(404).json({ message: "Logged-in user not found." });
      }

      if (id === req.userId) {
        return res
          .status(400)
          .json({ message: "You cannot follow/unfollow yourself." });
      }

      req.followUserId = id; // Store target user ID
      next();
    } catch (error) {
      console.error("Error verifying follow/unfollow request:", error.message);
      res.status(500).json({ message: "Server error." });
    }
  },
};

module.exports = auth;
