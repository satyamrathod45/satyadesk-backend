import { Router } from "express";
import { handleLogin, handleProfile } from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { changePassword } from "../controllers/changePassword.controller.js";
import forcePasswordChange from "../middlewares/forcePasswordChange.middleware.js";

const authRouter = Router();

authRouter.post("/login", handleLogin);
authRouter.get("/profile", auth ,   forcePasswordChange, handleProfile);
authRouter.post('/change-password', auth , changePassword)

export default authRouter;
