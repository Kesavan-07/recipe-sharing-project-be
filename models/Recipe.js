const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    cookingTime: { type: String },
    servings: { type: Number },
    image: { type: String, default: "https://via.placeholder.com/150" },
    video: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Add this line
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
