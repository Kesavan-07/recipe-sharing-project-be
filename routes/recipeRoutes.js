const express = require("express");
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ✅ Public Routes
router.get("/all", recipeController.getAllRecipes);
router.get("/:id", recipeController.getRecipeById);

// ✅ Protected Routes (Require Authentication)
router.post("/create", auth.verifyLogin,upload.single("image"), recipeController.createRecipe);
router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);
router.put("/:id", auth.verifyLogin, recipeController.updateRecipe);
router.delete("/:id", auth.verifyLogin, recipeController.deleteRecipe);
router.post("/rate", auth.verifyLogin, recipeController.rateRecipe); 
router.post("/comment", auth.verifyLogin, recipeController.addComment);
router.delete("/comment", auth.verifyLogin, recipeController.deleteComment);  // ✅ Delete a comment
router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);

module.exports = router;
