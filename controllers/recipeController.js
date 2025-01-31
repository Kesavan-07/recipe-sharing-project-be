const Recipe = require("../models/Recipe");
const cloudinary = require("../utils/cloudinary");

const recipeController = {
  // ✅ Create Recipe (With Image Upload)
  createRecipe: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image is required." });
      }

      // Upload Image to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(req.file.path);

      // Create a new recipe document
      const newRecipe = new Recipe({
        title: req.body.title,
        ingredients: req.body.ingredients.split(","), // Ensure it's an array
        instructions: req.body.instructions,
        cookingTime: req.body.cookingTime,
        servings: req.body.servings,
        image: uploadedImage.secure_url, // Save Cloudinary URL
        user: req.userId, // Ensure user is stored
      });

      await newRecipe.save();
      res.status(201).json(newRecipe);
    } catch (error) {
      console.error("Error creating recipe:", error.message || error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  },

  // ✅ Get All Recipes (Includes Username)
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({}).populate("user", "username email"); // ✅ Fix: Only populate username & email
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  getMyRecipes: async (req, res) => {
    try {
      console.log("🔍 Fetching recipes for user ID:", req.user._id); // Debugging

      const recipes = await Recipe.find({ user: req.user._id });

      if (!recipes || recipes.length === 0) {
        return res.status(200).json([]); // ✅ Return empty array instead of an error
      }

      res.status(200).json(recipes);
    } catch (error) {
      console.error("❌ Error fetching user recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes." });
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
      const recipe = await Recipe.findById(req.params.id).lean(); // Fetch recipe by ID
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" }); // Handle not found
      }
      res.status(200).json(recipe); // Return the recipe
    } catch (error) {
      console.error("Error fetching recipe by ID:", error.message || error);
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
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5 stars" });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // Check if user already rated
      const existingRating = recipe.ratings.find(
        (r) => r.user.toString() === req.user.id
      );
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
      if (!text)
        return res.status(400).json({ message: "Comment cannot be empty" });

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      recipe.comments.push({ user: req.user.id, text });
      await recipe.save();

      res.json({
        message: "Comment added successfully",
        comment: { user: req.user.id, text },
      });
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

      if (commentIndex === -1)
        return res.status(404).json({ message: "Comment not found" });

      // Only allow the user who created the comment or an admin to delete
      if (
        recipe.comments[commentIndex].user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Unauthorized: You cannot delete this comment" });
      }

      // Remove the comment
      recipe.comments.splice(commentIndex, 1);
      await recipe.save();

      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  likeRecipe: async (req, res) => {
    try {
      const recipeId = req.params.id;
      const userId = req.userId; // User ID from auth middleware

      const recipe = await Recipe.findById(recipeId);

      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // Check if the user has already liked the recipe
      if (recipe.likes.includes(userId)) {
        recipe.likes = recipe.likes.filter((id) => id.toString() !== userId);
      } else {
        recipe.likes.push(userId);
      }

      await recipe.save();
      res
        .status(200)
        .json({ message: "Recipe liked/unliked", likes: recipe.likes.length });
    } catch (error) {
      console.error("Error liking recipe:", error);
      res
        .status(500)
        .json({ message: "Failed to like recipe", error: error.message });
    }
  },
};
module.exports = recipeController;
