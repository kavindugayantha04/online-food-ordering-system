const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Create payment + linked order (multipart/form-data)
exports.createPayment = async (req, res) => {
  try {
    const { transactionId, paymentMethod, paymentStatus } = req.body;

    let orderData;
    try {
      orderData =
        typeof req.body.orderData === "string"
          ? JSON.parse(req.body.orderData)
          : req.body.orderData;
    } catch (err) {
      return res.status(400).json({ message: "Invalid orderData payload" });
    }

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!orderData.totalPrice || !orderData.orderType) {
      return res.status(400).json({
        message: "Total price and order type are required",
      });
    }

    const method = paymentMethod || "cash_on_delivery";

    if (method === "online_transfer") {
      if (!transactionId || !transactionId.trim()) {
        return res.status(400).json({
          message: "Transaction ID is required for online transfer",
        });
      }

      if (!req.files?.receiptImage?.[0]) {
        return res.status(400).json({
          message: "Receipt image is required for online transfer",
        });
      }
    }

    const orderStatus =
      method === "online_transfer" ? "Pending Payment" : "Pending";

    const finalPaymentStatus =
      paymentStatus ||
      (method === "online_transfer" ? "Waiting for Verification" : "COD Pending");

    // Resolve cake image: prefer an uploaded file, fall back to a path already in orderData
    const cakeFile = req.files?.customImage?.[0];
    const customImage = cakeFile
      ? `/uploads/cakes/${cakeFile.filename}`
      : orderData.customImage || "";

    // Create the order first
    const order = await Order.create({
      userId: req.user.id,
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      orderType: orderData.orderType,
      customMessage: orderData.customMessage || "",
      customImage,
      notes: orderData.notes || "",
      paymentMethod: method,
      paymentStatus: finalPaymentStatus,
      deliveryAddress: orderData.deliveryAddress || null,
      status: orderStatus,
    });

    // Clear user cart after successful order
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

    const receiptFile = req.files?.receiptImage?.[0];
    const receiptImagePath = receiptFile
      ? `/uploads/payments/${receiptFile.filename}`
      : "";

    // Create the payment record linked to the order
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.user.id,
      amount: orderData.totalPrice,
      method,
      status: finalPaymentStatus,
      transactionId: transactionId || "",
      receiptImage: receiptImagePath,
    });

    return res.status(201).json({
      message: "Payment recorded successfully",
      order,
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while creating payment" });
  }
};

// Get all payments (admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ isDeleted: { $ne: true } })
      .populate("orderId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Payments fetched successfully",
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while fetching payments" });
  }
};

// Approve payment
exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "Paid";
    await payment.save();

    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);

      if (order) {
        order.paymentStatus = "Paid";
        order.status = "Pending";
        await order.save();
      }
    }

    return res.status(200).json({
      message: "Payment approved successfully",
      payment,
    });
  } catch (error) {
    console.error("Approve payment error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while approving payment" });
  }
};

// Reject payment
exports.rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "Rejected";
    await payment.save();

    if (payment.orderId) {
      const order = await Order.findById(payment.orderId);

      if (order) {
        order.paymentStatus = "Rejected";
        order.status = "Pending Payment";
        await order.save();
      }
    }

    return res.status(200).json({
      message: "Payment rejected successfully",
      payment,
    });
  } catch (error) {
    console.error("Reject payment error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while rejecting payment" });
  }
};

// Soft delete (only if Rejected)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "Rejected") {
      return res.status(400).json({
        message: "Only rejected payments can be deleted",
      });
    }

    payment.isDeleted = true;
    await payment.save();

    return res.status(200).json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error while deleting payment" });
  }
};
