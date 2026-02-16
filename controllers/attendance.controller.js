import attendanceModel from '../models/attendace.model.js'
import classModel from "../models/class.model.js";
import lectureModel from "../models/lecture.model.js";
import { buildAttendanceSheetData } from '../utils/getAttendanceData.js';

const GRACE_PERIOD_MS = 2 * 60 * 1000;
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

export const generateAttendanceSheet = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;

    const classDoc = await classModel
      .findOne({ _id: classId, teacherId })
      .populate("students", "name rollNo studentBranch");

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found or unauthorized",
      });
    }
    const lectures = await lectureModel
      .find({ classId })
      .sort({ startTime: 1 });

    if (lectures.length === 0) {
      return res.status(400).json({
        message: "No lectures found for this class",
      });
    }
    const attendanceRecords = await attendanceModel.find({
      lectureId: { $in: lectures.map(l => l._id) }
    });

    const attendanceMap = {};

    attendanceRecords.forEach(record => {
      const studentId = record.studentId.toString();
      const lectureId = record.lectureId.toString();

      if (!attendanceMap[studentId]) {
        attendanceMap[studentId] = {};
      }

      attendanceMap[studentId][lectureId] = record.status;
    });

    /* ===============================
       5️⃣ Build headers
       =============================== */
    const headers = ["Roll No", "Name"];

    lectures.forEach(lecture => {
      const dateLabel = lecture.startTime.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
      });

      headers.push(dateLabel);
    });

    /* ===============================
       6️⃣ Build rows (Students × Lectures)
       =============================== */
    const rows = [];

    classDoc.students.forEach(student => {
      const studentId = student._id.toString();
      const row = [];

      // Format Roll Number
      const formattedRoll =
        student.studentBranch && student.rollNo
          ? `${student.studentBranch}-${student.rollNo}`
          : student.rollNo || "-";

      row.push(formattedRoll);
      row.push(student.name);

      // For each lecture, determine P or A
      lectures.forEach(lecture => {
        const lectureId = lecture._id.toString();

        const status =
          attendanceMap[studentId]?.[lectureId] || "absent";

        row.push(status === "present" ? "P" : "A");
      });

      rows.push(row);
    });

    /* ===============================
       7️⃣ Return sheet object
       =============================== */
    return res.status(200).json({
      className: classDoc.className,
      totalStudents: classDoc.students.length,
      totalLectures: lectures.length,
      headers,
      rows,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};


export const downloadAttendanceCSV = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;

    const { headers, rows, className } =
      await buildAttendanceSheetData(classId, teacherId);

    // Convert to CSV
    let csv = headers.join(",") + "\n";

    rows.forEach(row => {
      csv += row.join(",") + "\n";
    });

    // Set headers for download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${className}-attendance.csv`
    );

    return res.status(200).send(csv);

  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

