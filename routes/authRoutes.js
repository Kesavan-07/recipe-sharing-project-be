const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth.verifyLogin, (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userData } = req.user.toObject(); // Exclude password
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
module.exports = router;
