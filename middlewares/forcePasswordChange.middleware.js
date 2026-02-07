const forcePasswordChange = (req, res, next) => {
  const allowedRoutes = ["/auth/change-password", "/auth/logout"];

  if (
    req.user.mustChangePassword &&
    !allowedRoutes.includess(req.originalUrl)
  ) {
    return res.status(403).json({
      message: "Password change required",
    });
  }

  next();
};

export default forcePasswordChange;
