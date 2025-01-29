const Recipe = require("../models/Recipe");

const recipeController = {
  // ✅ Create Recipe (With Image Upload)
  createRecipe: async (req, res) => {
    try {
      const { title, ingredients, instructions, cookingTime, servings, video } =
        req.body;

      // ✅ Ensure that the user is logged in before creating a recipe
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // ✅ If an image is uploaded, save the file path
      const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

      const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image: imagePath, // Store the uploaded image path
        video: video || "",
        user: req.user.id,
      });

      await newRecipe.save();
      res
        .status(201)
        .json({ message: "Recipe created successfully", recipe: newRecipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },

  // ✅ Get All Recipes (Include Image URL)
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({}).lean();
      if (!recipes.length) {
        return res.status(404).json({ message: "No recipes found." });
      }
      res.status(200).json(recipes);
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

  // ✅ Get User's Own Recipes
  getMyRecipes: async (req, res) => {
    try {
      const userId = req.user.id;
      const myRecipes = await Recipe.find({ user: userId });

      if (!myRecipes.length) {
        return res
          .status(404)
          .json({ message: "No recipes found for this user." });
      }

      res.status(200).json(myRecipes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
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
};

module.exports = recipeController;
