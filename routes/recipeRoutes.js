const express = require("express");
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ✅ Public Routes
router.get("/all", recipeController.getAllRecipes);

// ✅ Protected Routes (Require Authentication)
router.post(
  "/create",
  auth.verifyLogin,
  upload.single("image"),
  recipeController.createRecipe
);

// ✅ Fix: Ensure this route comes BEFORE `/:id`
router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);

// ✅ Dynamic Routes (Must Come After `/my-recipes`)
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", auth.verifyLogin, recipeController.updateRecipe);
router.delete("/:id", auth.verifyLogin, recipeController.deleteRecipe);

// ✅ Other Routes
router.post("/rate", auth.verifyLogin, recipeController.rateRecipe);
router.post("/comment", auth.verifyLogin, recipeController.addComment);
router.delete("/comment", auth.verifyLogin, recipeController.deleteComment);

module.exports = router;
