import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import {
  markAttendanceStudent,
  markAttendanceManually,
  closeLecture,
} from "../controllers/attendance.controller.js";

const attendanceRouter = Router();

attendanceRouter.post(
  "/:lectureId",
  auth,
  checkRole("student"),
  markAttendanceStudent
);

attendanceRouter.post(
  "/:lectureId/manual",
  auth,
  checkRole("teacher"),
  markAttendanceManually
);

attendanceRouter.patch(
  "/:lectureId/close",
  auth,
  checkRole("teacher"),
  closeLecture
);

attendanceRouter.get('/attendance/sheet' , auth , checkRole('teacher') , getSheet);

export default attendanceRouter;
