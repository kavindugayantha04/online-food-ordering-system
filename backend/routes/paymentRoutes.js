const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createPayment,
  getPayments,
  approvePayment,
  rejectPayment,
  deletePayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure upload folders exist
["uploads/payments", "uploads/cakes"].forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Cake images go to uploads/cakes, everything else to uploads/payments
    if (file.fieldname === "customImage") {
      cb(null, "uploads/cakes");
    } else {
      cb(null, "uploads/payments");
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.fieldname + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "receiptImage", maxCount: 1 },
    { name: "customImage", maxCount: 1 },
  ]),
  createPayment
);
router.get("/", authMiddleware, getPayments);
router.put("/:id/approve", authMiddleware, approvePayment);
router.put("/:id/reject", authMiddleware, rejectPayment);
router.delete("/:id", authMiddleware, deletePayment);

module.exports = router;
