const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { verifyLogin } = require("../middleware/auth");

const router = express.Router();

// Multer Storage Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const details = ["username", "profilePicture"];

// Create Recipe
router.post("/createRecipe", verifyLogin, async (req, res) => {
  try {
    console.log(req.body);
    const {
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      videoURL,
      imgUrl,
      videoFileUrl,
    } = req.body;
    console.log(
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      videoURL,
      imgUrl,
      videoFileUrl
    );

    const ingredientList =
      typeof ingredients === "string" ? ingredients.split(",") : [];

    // Create new recipe
    const newRecipe = new Recipe({
      title,
      ingredients: ingredientList,
      instructions,
      cookingTime,
      servings,
      videoURL,
      image: imgUrl,
      videoFileUrl,
      createdBy: req.user._id,
    });

    await newRecipe.save();

    res
      .status(201)
      .json({ message: "Recipe created successfully!", recipe: newRecipe });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create recipe", error: error.message });
  }
});

router.get("/myRecipes", verifyLogin, async (req, res) => {
  try {
    console.log(req);
    const myRecipes = await Recipe.find({ createdBy: req.user._id }); // Removed 'new' before Recipe.find
    res.json(myRecipes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch recipes", error: error.message });
  }
});
router.delete("/myRecipes/:id", verifyLogin, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id, // Ensure the user can only delete their own recipes
    });

    if (!deletedRecipe) {
      return res
        .status(404)
        .json({ message: "Recipe not found or not authorized to delete" });
    }

    res.json({ message: "Recipe deleted successfully", deletedRecipe });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete recipe", error: error.message });
  }
});

router.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    console.log(recipe);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find(); // Fetches all recipes from the database
    res.json(recipes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch recipes", error: error.message });
  }
});
router.get("/likes/:id", verifyLogin, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if the user has already liked the recipe
    const userLiked = recipe.likes.includes(req.userId);

    res.json({ userLiked });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipe likes",
      error: error.message,
    });
  }
});
router.patch("/recipe/like/:id", verifyLogin, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // Assuming `verifyLogin` middleware adds `user` to `req`

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if the user has already liked the recipe
    const index = recipe.likes.indexOf(userId);
    if (index === -1) {
      // Like the recipe
      recipe.likes.push(userId);
    } else {
      // Unlike the recipe
      recipe.likes.splice(index, 1);
    }

    await recipe.save();
    res
      .status(200)
      .json({ message: "Like status updated", likes: recipe.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.patch("/recipe/command/:id", verifyLogin, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // Assuming `verifyLogin` middleware adds `user` to `req`
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.comments.push({ user: userId, text });
    await recipe.save();
    res.status(200).json({
      message: "Comment added successfully",
      comments: recipe.comments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/comments/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "comments.user",
      "username profilePicture"
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ comments: recipe.comments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipe comments",
      error: error.message,
    });
  }
});

router.patch("/recipe/rating/:id", verifyLogin, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // Assuming `verifyLogin` middleware adds `user` to `req`
    const { rating } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "rating is required" });
    }
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.ratings.push({ user: userId, rating });
    await recipe.save();
    res.status(200).json({
      message: "rating added successfully",
      ratings: recipe.rating,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/comments/:id", verifyLogin, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "comments.user",
      "username profilePicture"
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ comments: recipe.comments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipe comments",
      error: error.message,
    });
  }
});
router.get("/rating/:id", verifyLogin, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "ratings.user",
      "username profilePicture"
    );
    const userId = req.user.id;
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ ratings: recipe.ratings, userId });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipe ratings",
      error: error.message,
    });
  }
});
router.patch("/recipe/follow/:id", verifyLogin, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id; // Assuming `verifyLogin` middleware adds `user` to `req`

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if the user has already liked the recipe
    const index = recipe.likes.indexOf(userId);
    if (index === -1) {
      // Like the recipe
      recipe.likes.push(userId);
    } else {
      // Unlike the recipe
      recipe.likes.splice(index, 1);
    }

    await recipe.save();
    res
      .status(200)
      .json({ message: "Like status updated", likes: recipe.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
