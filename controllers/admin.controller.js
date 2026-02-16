import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      applicationNumber,
      role,
      branch,
      rollNo,
      teacherDepartment
    } = req.body;

    if (!name || !phone || !applicationNumber || !role) {
      return res.status(400).json({
        message: "All fields are mandatory",
      });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    if (!process.env.TEMP_PASS) {
      return res.status(500).json({
        message: "Temporary password not configured",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone }, { applicationNumber }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(process.env.TEMP_PASS, 10);

    let userData = {
      name,
      phone,
      applicationNumber,
      passwordHash,
      role,
      mustChangePassword: true,
    };

    if (role === "student") {

      if (!branch || !rollNo) {
        return res.status(400).json({
          message: "Branch and roll number are required for students",
        });
      }

      userData.studentBranch = branch;
      userData.rollNo = `${branch}-${rollNo}`; // if you insist on combined format

    } else if (role === "teacher") {

      if (!teacherDepartment) {
        return res.status(400).json({
          message: "Teacher department is required",
        });
      }

      userData.teacherDepartment = teacherDepartment;
    }

    const newUser = await User.create(userData);

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      role: newUser.role,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate roll number or unique field conflict",
      });
    }

    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};


export { createUser };
