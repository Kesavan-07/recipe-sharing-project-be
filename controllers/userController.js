const User = require("../models/User");
const Recipe = require("../models/Recipe");

const userController = {
  // Fetch user profile
  getUserProfile: async (req, res) => {
     try {
       const user = req.user; 
       if (!user) {
         return res.status(404).json({ message: "User not found" });
       }

       const { password, ...userData } = user.toObject();

       res.status(200).json({ user: userData });
     } catch (error) {
       console.error("Error fetching user profile:", error);
       res.status(500).json({ message: "Server error", error });
     }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    const { username, email, bio, profilePicture } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        req.userId, // ✅ Fixed `req.user.id` to `req.userId`
        { username, email, bio, profilePicture },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Fetch saved recipes
  getSavedRecipes: async (req, res) => {
    try {
      const user = await User.findById(req.userId).populate("savedRecipes");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ savedRecipes: user.savedRecipes });
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Save a recipe
  saveRecipe: async (req, res) => {
    const { recipeId } = req.body;

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.savedRecipes.includes(recipeId)) {
        user.savedRecipes.push(recipeId);
        await user.save();
      }

      res.status(200).json({ message: "Recipe saved successfully" });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Remove a saved recipe
  removeSavedRecipe: async (req, res) => {
    const { recipeId } = req.body;

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.savedRecipes = user.savedRecipes.filter(
        (id) => id.toString() !== recipeId
      );
      await user.save();

      res.status(200).json({ message: "Recipe removed from saved recipes" });
    } catch (error) {
      console.error("Error removing recipe:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Add a comment to a recipe
  addComment: async (req, res) => {
    const { recipeId, comment } = req.body;

    try {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const newComment = { user: req.userId, comment, createdAt: new Date() };
      recipe.comments.push(newComment);
      await recipe.save();

      res
        .status(200)
        .json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Remove a comment from a recipe
  removeComment: async (req, res) => {
    const { recipeId, commentId } = req.body;

    try {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      const commentIndex = recipe.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );
      if (commentIndex === -1) {
        return res.status(404).json({ message: "Comment not found" });
      }

      recipe.comments.splice(commentIndex, 1);
      await recipe.save();

      res.status(200).json({ message: "Comment removed successfully" });
    } catch (error) {
      console.error("Error removing comment:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
    uploadProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const user = await User.findById(req.user._id); // Ensure user exists
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Save the file path to the user's profile
      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();

      res.status(200).json({ message: "Profile picture updated successfully!" });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = userController;
