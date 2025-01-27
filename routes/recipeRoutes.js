const express = require("express");
const recipeController = require("../controllers/recipeController");

const recipeRouter = express.Router();

recipeRouter.post("/api/v1/recipes", recipeController.createRecipe);
recipeRouter.get("/api/v1/recipes", recipeController.getAllRecipes);
recipeRouter.get("/api/v1/recipes/:id", recipeController.getRecipeById);
recipeRouter.put("/api/v1/recipes/:id", recipeController.updateRecipe);
recipeRouter.delete("/api/v1/recipes/:id", recipeController.deleteRecipe);

module.exports = recipeRouter;
