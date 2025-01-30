const express = require("express");
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Public Routes
router.get("/all", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);

// ✅ Protected Routes (Require Authentication)
router.post("/create", auth.verifyLogin, recipeController.createRecipe);
router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);
router.put("/:id", auth.verifyLogin, recipeController.updateRecipe);
router.delete("/:id", auth.verifyLogin, recipeController.deleteRecipe);

module.exports = router;
