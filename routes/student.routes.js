import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import { joinClass } from "../controllers/student.controller.js";

const studentRouter = Router();
studentRouter.post(
  "/join-class/:joinCode",
  auth,
  checkRole("student"),
  joinClass
);

export default studentRouter;
