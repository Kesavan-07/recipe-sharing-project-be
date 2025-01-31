const express = require("express");
const cloudinary = require("../utils/cloudinary");
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const Recipe = require("../models/Recipe");

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

// ✅ My Recipes
router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);

// ✅ Dynamic Routes (Must Come After `/my-recipes`)
router.get("/:id", recipeController.getRecipeById);
router.put("/:id", auth.verifyLogin, recipeController.updateRecipe);
router.delete("/:id", auth.verifyLogin, recipeController.deleteRecipe);

// ✅ Rate Recipe
router.post("/:id/rate", auth.verifyLogin, async (req, res) => {
  try {
    const { userId, rating } = req.body;

    if (!userId || rating == null) {
      return res
        .status(400)
        .json({ message: "User ID and rating are required" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const existingRating = recipe.ratings.find(
      (r) => r.userId.toString() === userId
    );

    if (existingRating) {
      existingRating.value = rating; // Update existing rating
    } else {
      recipe.ratings.push({ userId, value: rating }); // Add new rating
    }

    await recipe.save();
    res.status(200).json(recipe); // Return the updated recipe
  } catch (error) {
    console.error("Error rating recipe:", error.message || error);
    res.status(500).json({ message: "Failed to submit rating" });
  }
});

module.exports = router;
