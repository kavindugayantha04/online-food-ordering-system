const Cart = require("../models/Cart");

const mapCartItem = (item) => ({
  id: item._id,
  foodName: item.foodName,
  image: item.image,
  price: item.price,
  quantity: item.quantity,
  totalPrice: item.totalPrice,
});

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

    return res.status(200).json({
      userId: cart.userId,
      items: cart.items.map(mapCartItem),
      subtotal: cart.subtotal,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error("Get cart error:", error.message);
    return res.status(500).json({ message: "Server error fetching cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { foodName, image, price, quantity = 1 } = req.body;

    if (!foodName || Number(price) <= 0 || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "foodName, price (>0), and quantity (>0) are required",
      });
    }

    const cart = await getOrCreateCart(req.user.id);
    const normalizedFoodName = String(foodName).trim();
    const numericPrice = Number(price);
    const numericQty = Number(quantity);

    const existingItem = cart.items.find(
      (item) =>
        item.foodName.toLowerCase() === normalizedFoodName.toLowerCase() &&
        item.price === numericPrice
    );

    if (existingItem) {
      existingItem.quantity += numericQty;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
      existingItem.image = image || existingItem.image;
      cart.markModified('items');
      
    } else {
      cart.items.push({
        foodName: normalizedFoodName,
        image: image || "",
        price: numericPrice,
        quantity: numericQty,
        totalPrice: numericPrice * numericQty,
      });
    }

    cart.subtotal = calculateSubtotal(cart.items);
    await cart.save();

    return res.status(201).json({
      message: "Item added to cart",
      items: cart.items.map(mapCartItem),
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    return res.status(500).json({ message: "Server error adding item to cart" });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res
        .status(400)
        .json({ message: "quantity must be an integer greater than 0" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = Number(quantity);
    item.totalPrice = item.quantity * item.price;

    cart.subtotal = calculateSubtotal(cart.items);
    await cart.save();

    return res.status(200).json({
      message: "Cart item quantity updated",
      items: cart.items.map(mapCartItem),
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Update cart item error:", error.message);
    return res.status(500).json({ message: "Server error updating cart item" });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.deleteOne();
    cart.subtotal = calculateSubtotal(cart.items);
    await cart.save();

    return res.status(200).json({
      message: "Cart item removed",
      items: cart.items.map(mapCartItem),
      subtotal: cart.subtotal,
    });
  } catch (error) {
    console.error("Remove cart item error:", error.message);
    return res.status(500).json({ message: "Server error removing cart item" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    cart.items = [];
    cart.subtotal = 0;
    await cart.save();

    return res.status(200).json({
      message: "Cart cleared",
      items: [],
      subtotal: 0,
    });
  } catch (error) {
    console.error("Clear cart error:", error.message);
    return res.status(500).json({ message: "Server error clearing cart" });
  }
};

exports.__testables = {
  calculateSubtotal,
  mapCartItem,
};
