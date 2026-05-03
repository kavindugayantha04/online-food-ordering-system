const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getAllReviews,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "reviews");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/reviews");
  },
  filename(req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.fieldname + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp/;
  const extName = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = /^image\/(jpeg|png|webp)$/i.test(file.mimetype);
  if (extName && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

router.get("/", getAllReviews);
router.get("/:id", getReviewById);

router.post("/", authMiddleware, upload.single("photo"), addReview);
router.put("/:id", authMiddleware, upload.single("photo"), updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
