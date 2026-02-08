import { Router } from "express";
import {
  createClass,
  removeClass,
  updateClass,
  removeStudentFromClass
} from "../controllers/teacher.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";

const teacherRouter = Router();

teacherRouter.post("/create-class", auth, checkRole("teacher"), createClass);
teacherRouter.delete(
  "/remove-class/:classId",
  auth,
  checkRole("teacher"),
  removeClass,
);
teacherRouter.put(
  "/update-class/:classId",
  auth,
  checkRole("teacher"),
  updateClass,
);
teacherRouter.delete(
  "/remove-student/:classId/:studentId",
  auth,
  checkRole("teacher"),
  removeStudentFromClass,
);
export default teacherRouter;
