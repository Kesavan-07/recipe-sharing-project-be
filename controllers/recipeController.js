const Recipe = require("../models/Recipe");

const recipeController = {
  // ✅ Create Recipe
  createRecipe: async (req, res) => {
    try {
      const {
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image,
        video,
      } = req.body;

      // ✅ Check if the recipe already exists
      const recipeExists = await Recipe.findOne({ title });
      if (recipeExists) {
        return res
          .status(400)
          .json({ message: "Recipe with this title already exists." });
      }

      // ✅ Create new recipe
      const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image: image || "https://via.placeholder.com/150", // Default image
        video: video || "", // Default empty video
      });

      await newRecipe.save();
      console.log("📌 New Recipe Created:", newRecipe); // ✅ Debugging log
      res
        .status(201)
        .json({ message: "Recipe created successfully", recipe: newRecipe });
    } catch (error) {
      console.error("❌ Error creating recipe:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // ✅ Get All Recipes
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({}).lean();
      console.log("📌 Fetched Recipes:", recipes.length);

      if (!recipes.length) {
        return res.status(404).json({ message: "No recipes found." });
      }

      res.status(200).json(recipes); // ✅ Return an array instead of { recipes: [...] }
    } catch (error) {
      console.error("❌ Error fetching recipes:", error);
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
      console.error("❌ Error fetching recipe by ID:", error);
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

      console.log("📌 Recipe Updated:", updatedRecipe);
      res
        .status(200)
        .json({ message: "Recipe updated", recipe: updatedRecipe });
    } catch (error) {
      console.error("❌ Error updating recipe:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
  getMyRecipes: async (req, res) => {
    try {
      const userId = req.user.id; // ✅ Ensure authentication middleware is used
      const myRecipes = await Recipe.find({ user: userId });

      if (!myRecipes.length) {
        return res.status(404).json({ message: "No recipes found for this user." });
      }

      console.log("📌 User Recipes:", myRecipes);
      res.status(200).json(myRecipes);
    } catch (error) {
      console.error("❌ Error fetching user's recipes:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ✅ Delete Recipe
  deleteRecipe: async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
      if (!deletedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      console.log("📌 Recipe Deleted:", deletedRecipe);
      res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting recipe:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};

module.exports = recipeController;
