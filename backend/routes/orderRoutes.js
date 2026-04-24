const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  addItemsToOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// Create order
router.post("/", authMiddleware, createOrder);

// Get logged-in user's orders
router.get("/my", authMiddleware, getMyOrders);

// Get single order
router.get("/:id", authMiddleware, getOrderById);

// Cancel order
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Add more items while pending
router.put("/:id/add-items", authMiddleware, addItemsToOrder);

// Update status
router.put("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;