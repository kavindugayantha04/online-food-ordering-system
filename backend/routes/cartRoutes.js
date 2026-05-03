const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/:id", protect, updateCartQuantity);
router.delete("/:id", protect, removeCartItem);
router.delete("/", protect, clearCart);

module.exports = router;

