const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const uploadVoucherImage = require("../middleware/uploadVoucherMiddleware");
const { applyVoucher } = require("../controllers/voucherController");

const router = express.Router();

router.post("/apply", authMiddleware, uploadVoucherImage.single("voucherImage"), applyVoucher);

module.exports = router;
