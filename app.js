const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
// CORS Configuration
const corsOptions = {
  origin: "https://recipe-k7.netlify.app", // Allow specific origin
  credentials: true, // Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());

app.use("/", recipeRouter);
app.use("/", authRouter);
app.use("/", userRouter);

module.exports = app;
