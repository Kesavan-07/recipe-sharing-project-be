const express = require("express");
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Public Routes
router.get("/all", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);

// ✅ Protected Routes (Require Authentication)
router.post(
  "/create",
  authMiddleware.verifyLogin,
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
