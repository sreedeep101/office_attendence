module.exports = (req, res, next) => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 19) {
    return res.status(403).json({
      message: "Work hours ended. Please login tomorrow."
    });
  }

  next();
};