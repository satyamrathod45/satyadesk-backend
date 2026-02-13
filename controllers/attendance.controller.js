import attendanceModel from '../models/attendace.model.js'
import classModel from "../models/class.model.js";
import lectureModel from "../models/lecture.model.js";

const GRACE_PERIOD_MS = 2 * 60 * 1000; // 2 minutes

/* =======================================================
   🧑‍🎓 STUDENT MARK ATTENDANCE
   ======================================================= */
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

    const classDoc = await classModel.findById(lecture.classId);

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    const isStudentEnrolled = classDoc.students.some(
      id => id.toString() === studentId
    );

    if (!isStudentEnrolled) {
      return res.status(403).json({
        message: "You are not enrolled in this class",
      });
    }

    const now = Date.now();

    if (!lecture.isActive) {
      return res.status(400).json({
        message: "Attendance is closed",
      });
    }

    if (now < lecture.startTime.getTime()) {
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

    await attendanceModel.findOneAndUpdate(
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


/* =======================================================
   👨‍🏫 TEACHER MANUAL ATTENDANCE
   ======================================================= */
export const markAttendanceManually = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { lectureId } = req.params;
    const { absentStudentIdArray = [] } = req.body;

    const lecture = await lectureModel.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    const classDoc = await classModel.findOne({
      _id: lecture.classId,
      teacherId,
    });

    if (!classDoc) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Validate students
    for (let studentId of absentStudentIdArray) {
      const isEnrolled = classDoc.students.some(
        id => id.toString() === studentId
      );

      if (!isEnrolled) {
        return res.status(400).json({
          message: "Invalid student in absent list",
        });
      }
    }

    // Bulk mark absentees
    if (absentStudentIdArray.length > 0) {
      const operations = absentStudentIdArray.map(studentId => ({
        updateOne: {
          filter: { lectureId, studentId },
          update: {
            status: "absent",
            markedBy: "teacher",
          },
          upsert: true,
        },
      }));

      await attendanceModel.bulkWrite(operations);
    }

    return res.status(200).json({
      message: "Manual attendance marked successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};


/* =======================================================
   🔒 OPTIONAL: CLOSE LECTURE EARLY
   ======================================================= */
export const closeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const teacherId = req.user.userId;

    const lecture = await lectureModel.findOne({
      _id: lectureId,
      teacherId,
    });

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found or unauthorized",
      });
    }

    lecture.isActive = false;
    await lecture.save();

    return res.status(200).json({
      message: "Lecture closed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
