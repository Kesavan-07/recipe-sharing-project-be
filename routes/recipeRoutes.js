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
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body; // Extract userId from the request body
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.likes.includes(userId)) {
      // Unlike the recipe
      recipe.likes = recipe.likes.filter((id) => id !== userId);
    } else {
      // Like the recipe
      recipe.likes.push(userId);
    }

    await recipe.save();
    res.status(200).json(recipe); // Return the updated recipe
  } catch (error) {
    console.error("Error liking recipe:", error.message || error);
    res.status(500).json({ message: "Failed to like recipe" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { userId, text } = req.body; // Extract userId and comment text
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const comment = { user: userId, text, createdAt: new Date() };
    recipe.comments.push(comment);

    await recipe.save();
    res.status(200).json(recipe); // Return the updated recipe
  } catch (error) {
    console.error("Error adding comment:", error.message || error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});


module.exports = router;
