import Class from "../models/class.model.js";
import generateJoinCode from "../utils/generateJoinCode.js";

const createClass = async (req, res) => {
  try {
    const { className, department, semester, section } = req.body;

    if (!className || !department || !semester || !section) {
      return res.status(400).json({
        message: "All fields are mandatory",
      });
    }

    const existingClass = await Class.findOne({
      teacherId: req.user.userId,
      className,
      department,
      semester,
      section,
      isActive: true,
    });

    if (existingClass) {
      return res.status(409).json({
        message: "Class already exists",
      });
    }
    const joinCode = generateJoinCode(6);

    const newClass = await Class.create({
      className,
      department,
      semester,
      section,
      joinCode,
      teacherId: req.user.userId,
      students: [],
      isActive: true,
    });

    return res.status(201).json({
      message: "Class created successfully",
      classId: newClass._id,
      joinCode,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};  

const removeClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const existingClass = await Class.findOneAndDelete({
      _id: classId,
      teacherId: req.user.userId,
    });

    if (!existingClass) {
      return res.status(404).json({
        message: "Class not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Class deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { className, department, semester, section } = req.body;

    // Optional: prevent empty update request
    if (!className && !department && !semester && !section) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }

    const updatedClass = await Class.findOneAndUpdate(
      {
        _id: classId,
        teacherId: req.user.userId, // ownership check
        isActive: true,
      },
      {
        ...(className && { className: className.trim() }),
        ...(department && { department: department.trim() }),
        ...(semester && { semester }),
        ...(section && { section: section.trim().toUpperCase() }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedClass) {
      return res.status(404).json({
        message: "Class not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};


const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { userId } = req.user; // teacher id

    const updatedClass = await Class.findOneAndUpdate(
      {
        _id: classId,
        teacherId: userId,
        isActive: true,
      },
      {
        $pull: { students: studentId },
      },
      {
        new: true,
      }
    );

    if (!updatedClass) {
      return res.status(404).json({
        message: "Class not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Student removed from class successfully",
      classId: updatedClass._id,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};



export { createClass , removeClass , updateClass , removeStudentFromClass};
