import classModel from "../models/class.model.js";
import lectureModel from "../models/lecture.model.js";
import attendanceModel from "../models/attendace.model.js";

export const buildAttendanceSheetData = async (classId, teacherId) => {

  const classDoc = await classModel
    .findOne({ _id: classId, teacherId })
    .populate("students", "name rollNo studentBranch");

  if (!classDoc) {
    throw new Error("Class not found or unauthorized");
  }

  const lectures = await lectureModel
    .find({ classId })
    .sort({ startTime: 1 });

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

  const headers = ["Roll No", "Name"];

  lectures.forEach(lecture => {
    const dateLabel = lecture.startTime.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    });
    headers.push(dateLabel);
  });

  const rows = [];

  classDoc.students.forEach(student => {
    const studentId = student._id.toString();
    const row = [];

    const formattedRoll =
      student.studentBranch && student.rollNo
        ? `${student.studentBranch}-${student.rollNo}`
        : student.rollNo || "-";

    row.push(formattedRoll);
    row.push(student.name);

    lectures.forEach(lecture => {
      const lectureId = lecture._id.toString();
      const status =
        attendanceMap[studentId]?.[lectureId] || "absent";

      row.push(status === "present" ? "P" : "A");
    });

    rows.push(row);
  });

  return { headers, rows, className: classDoc.className };
};
