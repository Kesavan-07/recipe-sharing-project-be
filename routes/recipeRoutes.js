const express = require("express");
const recipeController = require("../controllers/recipeController");

const router = express.Router();

router.post("/create", recipeController.createRecipe);
router.get("/all", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", recipeController.updateRecipe);
router.delete("/:id", recipeController.deleteRecipe);

module.exports = router;
