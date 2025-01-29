const express = require("express");
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// 📂 Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });

// ✅ Public Route: Fetch All Recipes
router.get("/all", recipeController.getAllRecipes);

// ✅ Public Route: Get Recipe by ID
router.get("/:id", recipeController.getRecipeById);

// ✅ Protected Routes: Require Authentication
router.post(
  "/create",
  authMiddleware.verifyLogin,
  upload.single("image"), // Accept an image file
  recipeController.createRecipe
);
router.get(
  "/my-recipes",
  authMiddleware.verifyLogin,
  recipeController.getMyRecipes
);
router.put("/:id", authMiddleware.verifyLogin, recipeController.updateRecipe);
router.delete(
  "/:id",
  authMiddleware.verifyLogin,
  recipeController.deleteRecipe
);

module.exports = router;
