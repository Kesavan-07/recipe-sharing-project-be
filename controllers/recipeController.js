const Recipe = require("../models/Recipe");

const recipeController = {
  // ✅ Create Recipe (With Image Upload)
  createRecipe: async (req, res) => {
    try {
      const { title, ingredients, instructions, cookingTime, servings, video } =
        req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : ""; // 🔹 Save uploaded image path

      const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image,
        video,
        user: req.user.id,
      });

      await newRecipe.save();
      res
        .status(201)
        .json({ message: "Recipe created successfully!", recipe: newRecipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // ✅ Get All Recipes (Includes Username)
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({}).populate("user", "username email"); // ✅ Populate user details
      res.status(200).json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // ✅ Get My Recipes
  getMyRecipes: async (req, res) => {
    try {
      const userId = req.user.id;
      const myRecipes = await Recipe.find({ user: userId })
        .populate("user", "username email") // ✅ Populate user details
        .lean();

      if (!myRecipes.length) {
        return res
          .status(404)
          .json({ message: "No recipes found for this user." });
      }

      res.status(200).json(myRecipes);
    } catch (error) {
      console.error("❌ Error fetching user recipes:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  // ✅ Update Recipe
  updateRecipe: async (req, res) => {
    try {
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res
        .status(200)
        .json({ message: "Recipe updated", recipe: updatedRecipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  // ✅ Get Recipe by ID
  getRecipeById: async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id).lean();
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // ✅ Delete Recipe
  deleteRecipe: async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
      if (!deletedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  rateRecipe: async (req, res) => {
    try {
      const { recipeId, rating } = req.body;
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // Check if user already rated
      const existingRating = recipe.ratings.find((r) => r.user.toString() === req.user.id);
      if (existingRating) {
        existingRating.rating = rating; // Update existing rating
      } else {
        recipe.ratings.push({ user: req.user.id, rating });
      }

      await recipe.save();
      res.json({ message: "Rating submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  // ✅ Comment on Recipe
  addComment: async (req, res) => {
    try {
      const { recipeId, text } = req.body;
      if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      recipe.comments.push({ user: req.user.id, text });
      await recipe.save();

      res.json({ message: "Comment added successfully", comment: { user: req.user.id, text } });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  deleteComment: async (req, res) => {
    try {
      const { recipeId, commentId } = req.body;

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      // Find the comment in the recipe
      const commentIndex = recipe.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );

      if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });

      // Only allow the user who created the comment or an admin to delete
      if (
        recipe.comments[commentIndex].user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Unauthorized: You cannot delete this comment" });
      }

      // Remove the comment
      recipe.comments.splice(commentIndex, 1);
      await recipe.save();

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};
module.exports = recipeController;
