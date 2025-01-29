const Recipe = require("../models/Recipe");

const recipeController = {
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

      const recipeExists = await Recipe.findOne({ title });
      if (recipeExists) {
        return res
          .status(400)
          .json({ message: "A recipe with this title already exists." });
      }

      const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image,
        video,
      });

      await newRecipe.save();
      res
        .status(201)
        .json({ message: "Recipe created successfully", recipe: newRecipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.status(200).json({ recipes });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  getRecipeById: async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(200).json({ recipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  updateRecipe: async (req, res) => {
    try {
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res
        .status(200)
        .json({ message: "Recipe updated", recipe: updatedRecipe });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
      if (!deletedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = recipeController;
