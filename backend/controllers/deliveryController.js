// controllers/deliveryController.js

const Delivery = require("../models/Delivery");
const User = require("../models/User");
const Order = require("../models/Order");

// require("dotenv").config();
const baseUrl = process.env.BASE_URL;


// ✅ 1. Create Delivery (Assign Driver)
exports.createDelivery = async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();

    const user = new User(req.body);
    await user.save();

    const order = new Order(req.body);
    await order.save();

    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ 2. Get Delivery by Order ID (Tracking)
exports.getDeliveryByOrderId = async (req, res) => {
  try {

    console.log("Fetching delivery for orderId:", req.params); // 🔥 important
    const delivery = await Delivery.findOne({
      orderId: req.params.orderId
    });

    // const delivery = await Delivery.findById(req.params.orderId);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body.status;

    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    if (typeof status !== "string") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    delivery.status = status;

    const baseUrl = process.env.BASE_URL;
    if (req.file) {
      delivery.proofImage = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (status === "Delivered") {
      delivery.deliveredAt = new Date();
    }

    await delivery.save();

    res.json({
      message: "Status updated successfully",
      delivery,
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ _id: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { deliveryLocation } = req.body;
    
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { deliveryLocation },
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
