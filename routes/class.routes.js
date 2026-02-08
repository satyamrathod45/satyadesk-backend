import { Router } from "express";
import { getMyClasses } from "../controllers/class.controller.js";
import auth from "../middlewares/auth.middleware.js";

const classRouter = Router();

classRouter.get("/my-classes", auth, getMyClasses);

export default classRouter;
