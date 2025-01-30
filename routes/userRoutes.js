const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

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
userRouter.post("/comments", auth.verifyLogin, userController.addComment);
userRouter.delete("/comments", auth.verifyLogin, userController.removeComment);
userRouter.post(
  "/profile/upload",
  auth.verifyLogin, // Ensure user is logged in
  upload.single("profilePicture"), // Handle image uploads
  userController.uploadProfilePicture
);
module.exports = userRouter;
