const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const deliveryController = require("../controllers/deliveryController");

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// routes
router.post("/", deliveryController.createDelivery);
router.get("/:orderId", deliveryController.getDeliveryByOrderId);
router.get("/", deliveryController.getAllDeliveries);

// 🚚 STATUS + IMAGE UPLOAD (IMPORTANT)
router.put(
  "/status/:id",
  upload.single("proofImage"),
  deliveryController.updateDeliveryStatus
);

router.put("/:id/location", deliveryController.updateDeliveryLocation);


module.exports = router;