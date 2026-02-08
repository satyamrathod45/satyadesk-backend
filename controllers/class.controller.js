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
      classes = await Class.find({ students: userId })
        .populate("teacher", "name email");
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
      error: error.message
    });
  }
};
