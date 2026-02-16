import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/checkRoles.middleware.js";
import { downloadAttendanceCSV } from "../controllers/attendance.controller.js";
import {
  markAttendanceStudent,
  markAttendanceManually,
  closeLecture,
  generateAttendanceSheet,
} from "../controllers/attendance.controller.js";

const attendanceRouter = Router();

attendanceRouter.post(
  "/:lectureId",
  auth,
  checkRole("student"),
  markAttendanceStudent,
);

attendanceRouter.post(
  "/:lectureId/manual",
  auth,
  checkRole("teacher"),
  markAttendanceManually,
);

attendanceRouter.patch(
  "/:lectureId/close",
  auth,
  checkRole("teacher"),
  closeLecture,
);

attendanceRouter.get(
  "/sheet/:classId",
  auth,
  checkRole("teacher"),
  generateAttendanceSheet,
);
attendanceRouter.get(
  "/sheet/:classId/export",
  auth,
  checkRole("teacher"),
  downloadAttendanceCSV,
);

export default attendanceRouter;
