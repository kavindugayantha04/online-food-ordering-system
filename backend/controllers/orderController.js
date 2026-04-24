const Order = require("../models/Order");

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice, orderType, customMessage, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!totalPrice || !orderType) {
      return res.status(400).json({ message: "Total price and order type are required" });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalPrice,
      orderType,
      customMessage: customMessage || "",
      notes: notes || "",
      status: "Pending",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

// Get logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// Get one order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order error:", error.message);
    res.status(500).json({ message: "Server error while fetching order" });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
};

// Add more items only while Pending
exports.addItemsToOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Items can only be added while order is pending",
      });
    }

    items.forEach((newItem) => {
      const existingItem = order.items.find(
        (item) => item.name === newItem.name
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        order.items.push(newItem);
      }
    });

    order.totalPrice = order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await order.save();

    res.status(200).json({
      message: "Items added to order successfully",
      order,
    });
  } catch (error) {
    console.error("Add items error:", error.message);
    res.status(500).json({ message: "Server error while adding items" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Ready for Pickup",
      "Out for Delivery",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({ message: "Server error while updating status" });
  }
};