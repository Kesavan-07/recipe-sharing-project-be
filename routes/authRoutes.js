const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const authRouter = express.Router();


authRouter.post("/api/v1/register", authController.register);
authRouter.post("/api/v1/login", authController.login);
authRouter.post("/api/v1/logout", authController.logout);
authRouter.get("/api/v1/myProfile", auth.verifylogin, authController.myProfile);

module.exports = authRouter;
