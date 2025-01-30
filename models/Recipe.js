const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    cookingTime: { type: Number, required: true },
    servings: { type: Number, required: true },
    image: { type: String },
    video: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ Reference to User model
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
