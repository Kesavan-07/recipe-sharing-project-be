const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRouter = require("./routes/authRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const userRouter = require("./routes/userRoutes");
const auth = require("./middleware/auth");
const userController = require("./controllers/userController"); // ✅ Import User Controller

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://recipe-k7.netlify.app", // Deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

// ✅ Use Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/recipes", recipeRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Follow and Unfollow Routes
app.post(
  "/api/v1/users/:id/follow",
  auth.verifyLogin,
  userController.followUser
);
app.post(
  "/api/v1/users/:id/unfollow",
  auth.verifyLogin,
  userController.unfollowUser
);

app.get("/", (req, res) => {
  res.send("Welcome to the Recipe Sharing API!");
});

module.exports = app;
