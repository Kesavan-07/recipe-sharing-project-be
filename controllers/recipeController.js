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
      const { id } = req.params;
      const { userId, rating } = req.body;

      const recipe = await Recipe.findById(id);
      if (!recipe)
        return res.status(404).json({ message: "Recipe not found." });

      // Update or add rating
      const existingRating = recipe.ratings.find((r) => r.userId === userId);
      if (existingRating) {
        existingRating.rating = rating;
      } else {
        recipe.ratings.push({ userId, rating });
      }

      const totalRating = recipe.ratings.reduce((acc, r) => acc + r.rating, 0);
      recipe.averageRating = totalRating / recipe.ratings.length;

      await recipe.save();
      res.status(200).json(recipe);
    } catch (err) {
      console.error("Error rating recipe:", err);
      res.status(500).json({ message: "Server error" });
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
      const { id } = req.params;
      const { userId } = req.body;

      const recipe = await Recipe.findById(id);
      if (!recipe)
        return res.status(404).json({ message: "Recipe not found." });

      // Toggle like
      const isLiked = recipe.likes.includes(userId);
      if (isLiked) {
        recipe.likes = recipe.likes.filter((uid) => uid !== userId);
      } else {
        recipe.likes.push(userId);
      }

      await recipe.save();
      res.status(200).json(recipe);
    } catch (err) {
      console.error("Error liking recipe:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};
module.exports = recipeController;
