import { Router } from "express";
import { deleteLecture, getAllLectures, getMyClasses } from "../controllers/class.controller.js";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import { createLecture } from "../controllers/class.controller.js";

const classRouter = Router();

classRouter.get("/my-classes", auth, getMyClasses);

/**
 * - POST /class/:classId/create-lecture
 * create the lecture inside the class
 */
classRouter.post("/:classId/create-lecture" , auth , checkRole("teacher") , createLecture)
classRouter.delete("/:classId/delete-lecture/:lectureId" , auth , checkRole("teacher") , deleteLecture)

classRouter.get("/:classId/lectures" ,auth, getAllLectures)

export default classRouter;
