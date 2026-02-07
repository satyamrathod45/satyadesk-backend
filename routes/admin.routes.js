import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import { createUser } from "../controllers/admin.controller.js";

const adminRouter = Router();
//Only Admin can create the user
adminRouter.post("/create-user" ,  auth , checkRole("admin") , createUser)

export default adminRouter;
