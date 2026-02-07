import { Router } from "express";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import { handleProfile } from "../controllers/auth.controller.js";
import forcePasswordChange from "../middlewares/forcePasswordChange.middleware.js";
import auth from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get('/teacher',auth,   forcePasswordChange , checkRole("teacher") , handleProfile);
dashboardRouter.get('/student' ,auth , forcePasswordChange ,checkRole("student") ,  handleProfile)
dashboardRouter.get('/admin' ,auth , forcePasswordChange ,checkRole("admin") ,  handleProfile)


export default dashboardRouter