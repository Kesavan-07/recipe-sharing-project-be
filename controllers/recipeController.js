const Recipe = require("../models/Recipe");
const cloudinary = require("../utils/cloudinary");
const MealPlan = require("../models/MealPlan");

const recipeController = {
  getAllRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({});
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recipes", error });
    }
  },

  searchRecipes: async (req, res) => {
    try {
      const { query } = req.query;
      const recipes = await Recipe.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { ingredients: { $regex: query, $options: "i" } },
        ],
      });

      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error searching recipes", error });
    }
  },

  createRecipe: async (req, res) => {
    try {
      const uploadedImage = req.file
        ? await cloudinary.uploader.upload(req.file.path)
        : null;

      const newRecipe = new Recipe({
        title: req.body.title,
        ingredients: req.body.ingredients.split(","),
        instructions: req.body.instructions,
        cookingTime: req.body.cookingTime,
        servings: req.body.servings,
        image: uploadedImage ? uploadedImage.secure_url : null,
        user: req.userId,
      });

      await newRecipe.save();
      res.status(201).json(newRecipe);
    } catch (error) {
      res.status(500).json({ message: "Error creating recipe", error });
    }
  },

  getRecipeById: async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  updateRecipe: async (req, res) => {
    try {
      let updatedData = req.body;

      if (req.file) {
        const uploadedImage = await cloudinary.uploader.upload(req.file.path);
        updatedData.image = uploadedImage.secure_url;
      }

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
        }
      );

      if (!updatedRecipe)
        return res.status(404).json({ message: "Recipe not found" });

      res.status(200).json(updatedRecipe);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      if (recipe.user.toString() !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await Recipe.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Recipe deleted" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  getMyRecipes: async (req, res) => {
    try {
      const recipes = await Recipe.find({ user: req.userId });
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user recipes", error });
    }
  },

  rateRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, rating } = req.body;
      const recipe = await Recipe.findById(id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      recipe.ratings.push({ user: userId, rating });
      await recipe.save();
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Error rating recipe", error });
    }
  },

  addComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, text } = req.body;
      const recipe = await Recipe.findById(id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      recipe.comments.push({ user: userId, text });
      await recipe.save();
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Error adding comment", error });
    }
  },

  likeRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const recipe = await Recipe.findById(id);
      if (!recipe) return res.status(404).json({ message: "Recipe not found" });

      recipe.likes.push(userId);
      await recipe.save();
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Error liking recipe", error });
    }
  },

  getMealPlans: async (req, res) => {
    try {
      const mealPlans = await MealPlan.find({ user: req.userId }).populate(
        "recipes"
      );
      res.status(200).json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal plans", error });
    }
  },

  saveMealPlan: async (req, res) => {
    try {
      const { mealPlan } = req.body;
      const newMealPlan = new MealPlan({ user: req.userId, recipes: mealPlan });
      await newMealPlan.save();
      res.status(201).json({ message: "Meal Plan saved successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error saving meal plan", error });
    }
  },
};

module.exports = recipeController;
