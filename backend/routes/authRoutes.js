const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  createDriver,
  getDrivers,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.post("/create-driver", authMiddleware, adminOnly, createDriver);
router.get("/drivers", authMiddleware, adminOnly, getDrivers);

module.exports = router;