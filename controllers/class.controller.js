
import Class from "../models/class.model.js";

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
