import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendanceCode: {
      type: String,
      required: true,
      uppercase: true,
    },

    mode: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

//fetch lectures by class + date fast
lectureSchema.index({ classId: 1, startTime: 1 });

export default mongoose.model("Lecture", lectureSchema);
