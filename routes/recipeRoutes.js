const express = require("express");
const recipeController = require("../controllers/recipeController");
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const Recipe = require("../models/Recipe"); // Import Recipe model

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

// ✅ Like Recipe
router.post(
  "/:id/like",
  auth.verifyLogin,
  recipeController.likeRecipe,
  async (req, res) => {
    try {
      const { userId } = req.body; // Extract userId from the request body
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      if (recipe.likes.includes(userId)) {
        recipe.likes = recipe.likes.filter((id) => id !== userId); // Unlike
      } else {
        recipe.likes.push(userId); // Like
      }

      await recipe.save();
      res.status(200).json(recipe); // Return the updated recipe
    } catch (error) {
      console.error("Error liking recipe:", error.message || error);
      res.status(500).json({ message: "Failed to like recipe" });
    }
  }
);

// ✅ Add Comment
router.post("/:id/comments", auth.verifyLogin, async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ message: "User ID and text are required" });
    }

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

// ✅ Delete Comment
router.delete("/:id/comment", auth.verifyLogin, async (req, res) => {
  try {
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ message: "Comment ID is required" });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.comments = recipe.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );

    await recipe.save();
    res.status(200).json(recipe); // Return the updated recipe
  } catch (error) {
    console.error("Error deleting comment:", error.message || error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

module.exports = router;
