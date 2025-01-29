const express = require("express");
const recipeController = require("../controllers/recipeController");
const authMiddleware = require("../middleware/auth"); // Authentication middleware

const router = express.Router();

router.post("/create", recipeController.createRecipe); // Publicly accessible for testing; switch to authMiddleware.verifyLogin later if needed.
router.get("/all", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", authMiddleware.verifyLogin, recipeController.updateRecipe);
router.delete(
  "/:id",
  authMiddleware.verifyLogin,
  recipeController.deleteRecipe
);

module.exports = router;
