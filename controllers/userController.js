const User = require("../models/User");
const Recipe = require("../models/Recipe");

const userController = {
  // Fetch user profile
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password"); // Exclude password

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const {
        username,
        email,
        bio,
        location,
        phoneNumber,
        website,
        profilePicture,
      } = req.body;
      console.log(
        username,
        email,
        bio,
        location,
        phoneNumber,
        website,
        profilePicture
      );

      // Find and update the user
      const updatedUser = await User.findByIdAndUpdate(
        req.userId, // Extracted from authMiddleware
        {
          username,
          email,
          bio,
          location,
          phoneNumber,
          website,
          profilePicture,
        },
        { new: true, runValidators: true } // Return updated document and validate input
      ).select("-password"); // Exclude password field
      console.log(updatedUser);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res
        .status(200)
        .json({ message: "Profile updated successfully", user: updatedUser });
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

      res
        .status(200)
        .json({ message: "Profile picture updated successfully!" });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  allUser: async (req, res) => {
    try {
      const myId = req.userId;

      // Get the logged-in user's data to retrieve their following & followers
      const currentUser = await User.findById(myId).select(
        "following followers"
      );

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Exclude users who are in the following or followers list
      const excludedUserIds = [
        ...currentUser.following,
        ...currentUser.followers,
        myId,
      ];

      const users = await User.find({ _id: { $nin: excludedUserIds } });

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server Error" });
    }
  },

  unfollowUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      const targetUser = await User.findById(req.params.id);

      if (!targetUser || !user.following.includes(targetUser._id)) {
        return res.status(400).json({ message: "Cannot unfollow this user" });
      }

      user.following = user.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== user._id.toString()
      );

      await user.save();
      await targetUser.save();

      res.json({ message: "User unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  },
};

module.exports = userController;
