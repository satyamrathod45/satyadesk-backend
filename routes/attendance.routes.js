import { Router } from "express";
import { markAttendanceStudent } from "../controllers/attendance.controller";

const attendanceRouter = Router();

attendanceRouter.post('/lecture/:lectureId' , markAttendanceStudent)




export default attendanceRouter;