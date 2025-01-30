const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

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

module.exports = userRouter;
