const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const User = require("../models/User");

const ALLOWED_STATUSES = ["Assigned", "On the way", "Delivered", "Cancelled"];

const driverOwnsDelivery = (req, delivery) => {
  return (
    delivery.driverId &&
    delivery.driverId.toString() === req.user.id.toString()
  );
};

const assertCanModifyDelivery = (req, delivery) => {
  if (req.user.role === "admin") return true;
  if (req.user.role === "driver" && driverOwnsDelivery(req, delivery)) {
    return true;
  }
  return false;
};

exports.createDelivery = async (req, res) => {
  try {
    const { orderId, driverId, driverName, deliveryLocation, estimatedTime } =
      req.body;

    if (!orderId || !deliveryLocation) {
      return res.status(400).json({
        message: "orderId and deliveryLocation are required",
      });
    }

    if (!driverId && !driverName) {
      return res.status(400).json({
        message: "driverId or driverName is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Out for Delivery") {
      return res.status(400).json({
        message: "Order must be Out for Delivery before creating a delivery",
      });
    }

    const existing = await Delivery.findOne({
      orderId,
      isDeleted: false,
    });
    if (existing) {
      return res.status(400).json({
        message: "A delivery already exists for this order",
      });
    }

    let resolvedDriverId = driverId || null;
    let resolvedDriverName = (driverName || "").trim();

    if (resolvedDriverId) {
      const driverUser = await User.findById(resolvedDriverId);
      if (!driverUser) {
        return res.status(400).json({ message: "Driver user not found" });
      }
      if (driverUser.role !== "driver") {
        return res.status(400).json({ message: "Selected user is not a driver" });
      }
      resolvedDriverName = driverUser.name;
    } else if (!resolvedDriverName) {
      return res.status(400).json({
        message: "driverName is required when driverId is not provided",
      });
    }

    const delivery = await Delivery.create({
      orderId,
      driverId: resolvedDriverId,
      driverName: resolvedDriverName,
      deliveryLocation: deliveryLocation.trim(),
      estimatedTime: estimatedTime != null ? String(estimatedTime) : "",
      status: "Assigned",
    });

    const populated = await Delivery.findById(delivery._id)
      .populate("orderId")
      .populate("driverId", "-password");

    res.status(201).json({
      message: "Delivery created successfully",
      delivery: populated,
    });
  } catch (error) {
    console.error("createDelivery error:", error.message);
    res.status(500).json({ message: "Server error while creating delivery" });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("orderId")
      .populate("driverId", "-password");

    res.status(200).json({ deliveries });
  } catch (error) {
    console.error("getAllDeliveries error:", error.message);
    res.status(500).json({ message: "Server error while fetching deliveries" });
  }
};

exports.getDriverDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      driverId: req.user.id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("orderId");

    res.status(200).json({ deliveries });
  } catch (error) {
    console.error("getDriverDeliveries error:", error.message);
    res.status(500).json({
      message: "Server error while fetching driver deliveries",
    });
  }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      orderId: req.params.orderId,
      isDeleted: false,
    })
      .populate("orderId")
      .populate("driverId", "-password");

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (req.user.role === "admin") {
      return res.status(200).json(delivery);
    }

    if (req.user.role === "driver" && driverOwnsDelivery(req, delivery)) {
      return res.status(200).json(delivery);
    }

    return res.status(403).json({ message: "Not authorized" });
  } catch (error) {
    console.error("getDeliveryByOrderId error:", error.message);
    res.status(500).json({ message: "Server error while fetching delivery" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const delivery = await Delivery.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (!assertCanModifyDelivery(req, delivery)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "Delivered") {
      if (!req.file) {
        return res.status(400).json({
          message: "Proof image is required when marking as Delivered",
        });
      }
      delivery.proofImage = `/uploads/deliveries/${req.file.filename}`;
      delivery.deliveredAt = new Date();

      const order = await Order.findById(delivery.orderId);
      if (order) {
        order.status = "Delivered";
        await order.save();
      }
    }

    if (status === "Cancelled") {
      const order = await Order.findById(delivery.orderId);
      if (order) {
        order.status = "Cancelled";
        await order.save();
      }
    }

    delivery.status = status;
    await delivery.save();

    const populated = await Delivery.findById(delivery._id)
      .populate("orderId")
      .populate("driverId", "-password");

    res.status(200).json({
      message: "Delivery status updated",
      delivery: populated,
    });
  } catch (error) {
    console.error("updateDeliveryStatus error:", error.message);
    res.status(500).json({
      message: "Server error while updating delivery status",
    });
  }
};

exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { deliveryLocation } = req.body;

    if (!deliveryLocation || !String(deliveryLocation).trim()) {
      return res.status(400).json({ message: "deliveryLocation is required" });
    }

    const delivery = await Delivery.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (!assertCanModifyDelivery(req, delivery)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    delivery.deliveryLocation = String(deliveryLocation).trim();
    await delivery.save();

    const populated = await Delivery.findById(delivery._id)
      .populate("orderId")
      .populate("driverId", "-password");

    res.status(200).json({
      message: "Delivery location updated",
      delivery: populated,
    });
  } catch (error) {
    console.error("updateDeliveryLocation error:", error.message);
    res.status(500).json({
      message: "Server error while updating delivery location",
    });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    if (delivery.status !== "Cancelled") {
      return res.status(400).json({
        message: "Only cancelled deliveries can be deleted",
      });
    }

    delivery.isDeleted = true;
    await delivery.save();

    res.status(200).json({ message: "Delivery removed successfully" });
  } catch (error) {
    console.error("deleteDelivery error:", error.message);
    res.status(500).json({ message: "Server error while deleting delivery" });
  }
};
