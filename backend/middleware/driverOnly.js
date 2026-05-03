const driverOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "driver") {
    return res.status(403).json({ message: "Driver access only" });
  }
  next();
};

module.exports = driverOnly;
