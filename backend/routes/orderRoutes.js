const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cancelOrderByAdmin,
  deleteOrder,
  addItemsToOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// Ensure uploads/cakes folder exists
const cakeUploadDir = path.join(__dirname, "..", "uploads", "cakes");
if (!fs.existsSync(cakeUploadDir)) {
  fs.mkdirSync(cakeUploadDir, { recursive: true });
}

const cakeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/cakes");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname + path.extname(file.originalname));
  },
});

const cakeFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ storage: cakeStorage, fileFilter: cakeFileFilter });

router.post("/", authMiddleware, upload.single("customImage"), createOrder);
router.get("/", authMiddleware, getAllOrders);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.put("/:id/admin-cancel", authMiddleware, adminOnly, cancelOrderByAdmin);
router.delete("/:id", authMiddleware, deleteOrder);
router.put("/:id/add-items", authMiddleware, addItemsToOrder);
router.put("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;