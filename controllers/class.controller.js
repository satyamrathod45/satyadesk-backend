import Class from "../models/class.model.js";
import Lecture from "../models/lecture.model.js";
import generateJoinCode from "../utils/generateJoinCode.js";

export const getMyClasses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let classes;

    if (role === "teacher") {
      classes = await Class.find({ teacherId: userId })
        .populate("students", "name email")
        .populate("teacherId", "name email");
      console.log("REQ.USER:", req.user);
    }

    if (role === "student") {
      classes = await Class.find({ students: userId }).populate(
        "teacher",
        "name email",
      );
    }

    return res.status(200).json({
      success: true,
      count: classes.length,
      classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
      error: error.message,
    });
  }
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export const createLecture = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startTime, endTime } = req.body;
    const teacherId = req.user.userId;

    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "startTime and endTime are required",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        message: "Invalid date format",
      });
    }

    const isClass = await Class.findOne({
      _id: classId,
      teacherId,
      isActive: true,
    });

    if (!isClass) {
      return res.status(404).json({
        message: "Class not found or does not belong to teacher",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "startTime must be before endTime",
      });
    }

    const durationMs = end - start;

    if (durationMs < ONE_HOUR_MS) {
      return res.status(400).json({
        message: "Minimum lecture duration is 1 hour",
      });
    }

    if (durationMs % ONE_HOUR_MS !== 0) {
      return res.status(400).json({
        message: "Lecture duration must be in whole hours",
      });
    }

    const overlappingLecture = await Lecture.findOne({
      classId,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
      ],
    });

    if (overlappingLecture) {
      return res.status(400).json({
        message: "Lecture already exists for this time slot",
      });
    }

    const numberOfLectures = durationMs / ONE_HOUR_MS;
    const lecturesToCreate = [];

    for (let i = 0; i < numberOfLectures; i++) {
      const lectureStart = new Date(start.getTime() + i * ONE_HOUR_MS);
      const lectureEnd = new Date(lectureStart.getTime() + ONE_HOUR_MS);

      lecturesToCreate.push({
        classId,
        teacherId,
        attendanceCode: generateJoinCode(6),
        startTime: lectureStart,
        endTime: lectureEnd,
        isActive: true,
      });
    }

    const createdLectures = await Lecture.insertMany(lecturesToCreate);

    return res.status(201).json({
      message: "Lectures created successfully",
      totalLectures: createdLectures.length,
      lectures: createdLectures.map((l) => ({
        lectureId: l._id,
        startTime: l.startTime,
        endTime: l.endTime,
        attendanceCode: l.attendanceCode,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getAllLectures = async (req, res) => {
  try {
    const { classId } = req.params;
    const { userId, role } = req.user;

    const classDoc = await Class.findById(classId);

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found",
      });
    }

    if (role === "teacher") {
      if (classDoc.teacherId.toString() !== userId) {
        return res.status(403).json({
          message: "Class does not belong to you",
        });
      }
    }

    if (role === "student") {
      const isStudentEnrolled = classDoc.students.some(
        (id) => id.toString() === userId,
      );

      if (!isStudentEnrolled) {
        return res.status(403).json({
          message: "You are not enrolled in this class",
        });
      }
    }

    const lectures = await Lecture.find({ classId }).sort({ startTime: 1 });

    return res.status(200).json({
      lectures,
      count: lectures.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { classId, lectureId } = req.params;
    const teacherId = req.user.userId;

    const classDoc = await Class.findOne({
      _id: classId,
      teacherId
    });

    if (!classDoc) {
      return res.status(404).json({
        message: "Class not found or unauthorized",
      });
    }

    const deletedLecture = await Lecture.findOneAndDelete({
      _id: lectureId,
      classId,
      teacherId,
    });

    if (!deletedLecture) {
      return res.status(404).json({
        message: "Lecture not found or unauthorized",
      });
    }
    
    return res.status(200).json({
      message: "Lecture deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

