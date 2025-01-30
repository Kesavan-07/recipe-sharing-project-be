const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyLogin = async (req, res, next) => {
  try {
    // ✅ Ensure token is present
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // ✅ Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // ✅ Debugging

    // ✅ Find User in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "Unauthorized: No user found" });
    }

    req.user = user; // Attach user info to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = { verifyLogin };
