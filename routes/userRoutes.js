const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const userRouter = express.Router();

userRouter.get("/api/v1/profile", auth.verifylogin, userController.getUserProfile);

userRouter.put("/api/v1/profile", auth.verifylogin, userController.updateUserProfile);

userRouter.get("/api/v1/saved-recipes", auth.verifylogin, userController.getSavedRecipes);

userRouter.post("/api/v1/saved-recipes", auth.verifylogin, userController.saveRecipe);

userRouter.delete("/api/v1/saved-recipes", auth.verifylogin, userController.removeSavedRecipe);

userRouter.post("/api/v1/comments", auth.verifylogin, userController.addComment);

userRouter.delete("/api/v1/comments", auth.verifylogin, userController.removeComment);



module.exports = userRouter;
