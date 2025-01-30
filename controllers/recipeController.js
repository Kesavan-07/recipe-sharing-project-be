const Recipe = require("../models/Recipe");

const recipeController = {
  // ✅ Create Recipe (With Image Upload)
  createRecipe: async (req, res) => {
    try {
      const { title, ingredients, instructions, cookingTime, servings, image } =
        req.body;

      // ✅ Check if user is logged in
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
      }

      // ✅ Create new recipe with user ID
      const newRecipe = new Recipe({
        title,
        ingredients,
        instructions,
        cookingTime,
        servings,
        image: image || "https://via.placeholder.com/150",
        user: req.user._id, // ✅ Store user ID
      });

      await newRecipe.save();
      res
        .status(201)
        .json({ message: "Recipe created successfully", recipe: newRecipe });
    } catch (error) {
      console.error("❌ Error creating recipe:", error);
      res.status(500).json({ message: "Server error", error: error.message });
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
};

module.exports = recipeController;
