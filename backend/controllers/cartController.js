const Cart = require("../models/Cart");

const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [],
      subtotal: 0,
    });
  }

  return cart;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

     res.json({
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching cart" });
  }
};


exports.addToCart = async (req, res) => {
  try {
    const { foodName, image, price, quantity = 1 } = req.body;

    const cart = await getOrCreateCart(req.user.id);

    const existingItem = cart.items.find(
      (item) => item.foodName === foodName && item.price === price
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      cart.items.push({
        foodName,
        image,
        price,
        quantity,
        totalPrice: price * quantity,
      });
    }

    cart.subtotal = calculateSubtotal(cart.items);

    await cart.save();

    res.json({
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
   const { id } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await getOrCreateCart(req.user.id);

    const item = cart.items.id(id);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = qty;
    item.totalPrice = item.price * qty;

    cart.subtotal = calculateSubtotal(cart.items);

    await cart.save();

    res.json({
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating cart item" });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(id);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Mongoose subdoc removal: works across versions
    if (typeof item.deleteOne === "function") {
      item.deleteOne();
    } else if (typeof cart.items.pull === "function") {
      cart.items.pull({ _id: id });
    }

    cart.subtotal = calculateSubtotal(cart.items);

    await cart.save();

    res.json({
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing cart item" });
  }
};


exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    cart.items = [];
    cart.subtotal = 0;
    await cart.save();

      res.json({
      items: cart.items,
      subtotal: cart.subtotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error clearing cart" });
  }
};

