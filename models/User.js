const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Additional Profile Details
    bio: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    phoneNumber: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },

    // Profile Picture
    profilePicture: { type: String, default: "", trim: true },

    // Followers & Following (User Reference)
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],

    // Recipes Uploaded by User
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

    // Liked Recipes
    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

    // Password Reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
