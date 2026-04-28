const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  addFoodItem,
  getAllFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
} = require("../controllers/foodController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/foods");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

// Public routes
router.get("/", getAllFoodItems);
router.get("/:id", getFoodItemById);

// Protected routes
router.post("/", protect, upload.single("image"), addFoodItem);
router.put("/:id", protect, upload.single("image"), updateFoodItem);
router.delete("/:id", protect, deleteFoodItem);

module.exports = router;