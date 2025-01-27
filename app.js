const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");
const recipeRouter = require("./routes/recipeRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
),
  app.use(morgan("dev"));
app.use(express.json());

app.use("/", recipeRouter);
app.use("/", authRouter);
app.use("/", userRouter);




module.exports = app;
