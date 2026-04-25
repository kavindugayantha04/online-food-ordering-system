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

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.put("/:itemId", authMiddleware, updateCartItemQuantity);
router.delete("/:itemId", authMiddleware, removeCartItem);
router.delete("/", authMiddleware, clearCart);

module.exports = router;
