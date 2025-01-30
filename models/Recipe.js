const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    cookingTime: { type: String, required: true },
    servings: { type: Number, required: true },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    ratings: [{ user: mongoose.Schema.Types.ObjectId, rating: Number }], // ✅ Store ratings
    comments: [CommentSchema], // ✅ Store comments
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
