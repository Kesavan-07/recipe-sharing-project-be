const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const auth = {
  verifyLogin: async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1]; // ✅ Extract token correctly

      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Verify token
      req.user = await User.findById(decoded.id).select("-password"); // ✅ Get user from DB

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User does not exist" });
      }

      next(); // ✅ Proceed if everything is fine
    } catch (error) {
      res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
  },
};

module.exports = auth;
