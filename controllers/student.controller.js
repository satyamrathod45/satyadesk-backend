import classModel from "../models/class.model.js";

const joinClass = async (req, res) => {
  try {
    const { userId } = req.user;
    const { joinCode } = req.params;

    const updatedClass = await classModel.findOneAndUpdate(
      { joinCode: joinCode.toUpperCase(), isActive: true },
      { $addToSet: { students: userId } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        message: "Invalid or expired join code",
      });
    }

    return res.status(200).json({
      message: "Class joined successfully",
      classId: updatedClass._id,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};


export {joinClass}
