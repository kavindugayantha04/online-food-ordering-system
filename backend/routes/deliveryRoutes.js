const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");
const driverOnly = require("../middleware/driverOnly");

const {
  createDelivery,
  getAllDeliveries,
  getDriverDeliveries,
  getDeliveryByOrderId,
  updateDeliveryStatus,
  updateDeliveryLocation,
  deleteDelivery,
} = require("../controllers/deliveryController");

const router = express.Router();

const deliveryUploadDir = path.join(__dirname, "..", "uploads", "deliveries");
if (!fs.existsSync(deliveryUploadDir)) {
  fs.mkdirSync(deliveryUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/deliveries");
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + path.extname(file.originalname));
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

router.post("/", authMiddleware, adminOnly, createDelivery);
router.get("/", authMiddleware, adminOnly, getAllDeliveries);
router.get("/my", authMiddleware, driverOnly, getDriverDeliveries);
router.get("/order/:orderId", authMiddleware, getDeliveryByOrderId);

router.put(
  "/:id/status",
  authMiddleware,
  upload.single("proofImage"),
  updateDeliveryStatus
);

router.put("/:id/location", authMiddleware, updateDeliveryLocation);
router.delete("/:id", authMiddleware, adminOnly, deleteDelivery);

module.exports = router;
