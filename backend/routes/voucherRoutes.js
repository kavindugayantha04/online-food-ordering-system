const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const uploadVoucherImage = require("../middleware/uploadVoucherMiddleware");
const { applyVoucher } = require("../controllers/voucherController");

const router = express.Router();

router.post("/apply", authMiddleware, uploadVoucherImage.single("voucherImage"), applyVoucher);

module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");
const { applyVoucher } = require("../controllers/voucherController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/vouchers");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /png|jpg|jpeg/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, and JPEG files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

router.post("/apply", upload.single("voucherImage"), applyVoucher);

module.exports = router;