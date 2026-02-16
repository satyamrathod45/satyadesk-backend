import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    applicationNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
      default: "student",
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },

    rollNo: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      unique: true,
      sparse: true, 
    },

    studentBranch: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    teacherDepartment: {
      type: String,
      required: function () {
        return this.role === "teacher";
      },
      trim: true,
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


const User = mongoose.model("User", userSchema);

export default User;
