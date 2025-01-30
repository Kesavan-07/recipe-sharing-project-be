const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", auth.verifyLogin, (req, res) => {
  try {
    const { password, ...userData } = req.user.toObject(); // Exclude password
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
module.exports = router;
