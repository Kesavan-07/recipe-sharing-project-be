const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const userRouter = require("./routes/userRoutes");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const app = express();

const corsOptions = {
  origin: ["https://recipe-k7.netlify.app", "http://localhost:5173"],
  //   origin: ["http://localhost:5173", "https://recipe-k7.netlify.app/"],

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Multer Storage for File Uploads
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ API Routes
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", recipeRouter);

app.get("/", (req, res) => res.send("Welcome to the Recipe Sharing API!"));

module.exports = app;
