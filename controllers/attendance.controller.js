import attendaceModel from "../models/attendace.model";
import classModel from "../models/class.model";
import lectureModel from "../models/lecture.model";

export const markAttendanceStudent = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { attendanceCode } = req.body;
    const studentId = req.user.userId;

    if (!attendanceCode) {
      return res.status(400).json({
        message: "Attendance code is required",
      });
    }

    const lecture = await lectureModel.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    const classOfLecture = await classModel.findById(lecture.classId);

    const isStudentEnrolled = classOfLecture.students.some(
      id => id.toString() === studentId
    );

    if (!isStudentEnrolled) {
      return res.status(403).json({
        message: "You are not enrolled in this class",
      });
    }

    const now = Date.now();
    const GRACE_PERIOD_MS = 2 * 60 * 1000;

    if (!lecture.isActive) {
      return res.status(400).json({
        message: "Attendance is closed",
      });
    }

    if (now < lecture.startTime) {
      return res.status(400).json({
        message: "Lecture has not started yet",
      });
    }

    if (now > lecture.endTime.getTime() + GRACE_PERIOD_MS) {
      return res.status(400).json({
        message: "Attendance window has expired",
      });
    }

    if (attendanceCode !== lecture.attendanceCode) {
      return res.status(400).json({
        message: "Invalid attendance code",
      });
    }
    const attendance = await attendaceModel.findOneAndUpdate(
      { lectureId, studentId },
      {
        status: "present",
        markedBy: "student",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Attendance marked successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
