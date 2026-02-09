import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },

    markedBy: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

//one attendance per lecture per student
attendanceSchema.index(
  { lectureId: 1, studentId: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);
