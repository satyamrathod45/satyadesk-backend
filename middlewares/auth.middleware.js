import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Not Authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    // token expired or invalid
    return res.status(401).json({
      message: "Not Authorized",
    });
  }
};

export default auth;
