const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Delivery = require("../models/Delivery");
const Payment = require("../models/Payment");

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      orderType,
      customMessage,
      notes,
      paymentMethod,
      paymentStatus,
      deliveryAddress,
    } = req.body;

    // items and totalPrice may arrive as JSON strings when sent via FormData
    const items =
      typeof req.body.items === "string"
        ? JSON.parse(req.body.items)
        : req.body.items;

    const totalPrice = Number(req.body.totalPrice);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!totalPrice || !orderType) {
      return res.status(400).json({ message: "Total price and order type are required" });
    }

    const customImage = req.file ? `/uploads/cakes/${req.file.filename}` : "";

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalPrice,
      orderType,
      customMessage: customMessage || "",
      customImage,
      notes: notes || "",
      paymentMethod: paymentMethod || "cash_on_delivery",
      paymentStatus: paymentStatus || "COD Pending",
      deliveryAddress: deliveryAddress || null,
      status:
        paymentMethod === "online_transfer"
          ? "Pending Payment"
          : "Pending",
    });

    try {
      const cart = await Cart.findOne({ userId: req.user.id });

      if (cart) {
        cart.items = [];
        cart.subtotal = 0;
        await cart.save();
      }
    } catch (cartError) {
      console.error("Clear cart after order error:", cartError.message);
    }

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

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    res.status(500).json({ message: "Server error while fetching all orders" });
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

   if (order.status !== "Pending" && order.status !== "Pending Payment") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "Cancelled";
    order.cancelledBy = "user";
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

exports.cancelOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["Delivered", "Completed", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel finalized order" });
    }

    order.status = "Cancelled";
    order.cancelledBy = "admin";

    if (order.paymentMethod === "online_transfer") {
      order.paymentStatus = "Refund Pending";
    }

    await order.save();

    const delivery = await Delivery.findOne({
      orderId: order._id,
      isDeleted: false,
    });
    if (delivery) {
      delivery.status = "Cancelled";
      await delivery.save();
    }

    const payment = await Payment.findOne({
      orderId: order._id,
      isDeleted: { $ne: true },
    });
    if (payment && order.paymentMethod === "online_transfer") {
      payment.status = "Refund Pending";
      await payment.save();
    }

    res.status(200).json({
      message: "Order cancelled by admin",
      order,
    });
  } catch (error) {
    console.error("Admin cancel order error:", error.message);
    res.status(500).json({ message: "Server error while cancelling order" });
  }
};

// Delete order (only if Cancelled)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Cancelled") {
      return res.status(400).json({
        message: "Only cancelled orders can be deleted",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error.message);
    res.status(500).json({ message: "Server error while deleting order" });
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
      "Pending Payment",
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

    if (["Cancelled", "Delivered", "Completed"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot update status for this order",
      });
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