const express = require("express");
const recipeController = require("../controllers/recipeController"); 
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/all", recipeController.getAllRecipes); 
router.get("/search", recipeController.searchRecipes); 

router.post(
  "/create",
  auth.verifyLogin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]), 
  recipeController.createRecipe
);


router.get("/my-recipes", auth.verifyLogin, recipeController.getMyRecipes);
router.get("/:id", recipeController.getRecipeById);
router.put(
  "/:id",
  auth.verifyLogin,
  upload.single("image"),
  recipeController.updateRecipe
);
router.delete("/:id", auth.verifyLogin, recipeController.deleteRecipe);

router.post("/:id/rate", auth.verifyLogin, recipeController.rateRecipe);
router.post("/:id/comments", auth.verifyLogin, recipeController.addComment);
router.post("/:id/like", auth.verifyLogin, recipeController.likeRecipe);

// ✅ New: Meal Planning Routes
router.post(
  "/meal-plans/save",
  auth.verifyLogin,
  recipeController.saveMealPlan
);
router.get("/meal-plans", auth.verifyLogin, recipeController.getMealPlans);

module.exports = router;
