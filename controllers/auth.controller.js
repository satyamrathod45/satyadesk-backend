import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const handleLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ phone: identifier }, { applicationNumber: identifier }],
    });
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credential",
      });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        message: "Invalid Credential",
      });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
    const token = generateToken(payload);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // true in production
    });

    res.status(200).json({ messgae: "login Successful" });
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};

const handleProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
export { handleLogin, handleProfile };
