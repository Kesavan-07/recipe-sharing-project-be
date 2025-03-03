const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const User = require("../models/User");

const userRouter = express.Router();

userRouter.get("/profile", auth.verifyLogin, userController.getUserProfile);
userRouter.put("/profile", auth.verifyLogin, userController.updateUserProfile);
userRouter.get(
  "/saved-recipes",
  auth.verifyLogin,
  userController.getSavedRecipes
);
userRouter.post("/saved-recipes", auth.verifyLogin, userController.saveRecipe);
userRouter.delete(
  "/saved-recipes",
  auth.verifyLogin,
  userController.removeSavedRecipe
);
userRouter.get("/alluser", auth.verifyLogin, userController.allUser);
userRouter.post("/follow/:id", auth.verifyLogin, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const targetUser = await User.findById(req.params.id);
    console.log(user, targetUser);

    if (!targetUser || user.following.includes(targetUser._id)) {
      return res.status(400).json({ message: "Cannot follow this user" });
    }

    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

userRouter.get("/following", auth.verifyLogin, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate("following");

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
userRouter.get("/followers", auth.verifyLogin, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all users who have the logged-in user in their "following" array
    const followers = await User.find({ following: userId });

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

userRouter.post("/unfollow/:id", auth.verifyLogin, async (req, res) => {
  try {
    const userId = req.userId;
    const unfollowId = req.params.id;

    // Remove unfollowed user from the following list of the logged-in user
    await User.findByIdAndUpdate(userId, {
      $pull: { following: unfollowId },
    });

    // Remove the logged-in user from the unfollowed user's followers list
    await User.findByIdAndUpdate(unfollowId, {
      $pull: { followers: userId },
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = userRouter;
