// controllers/deliveryController.js

const Delivery = require("../models/Delivery");


// ✅ 1. Create Delivery (Assign Driver)
exports.createDelivery = async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ 2. Get Delivery by Order ID (Tracking)
exports.getDeliveryByOrderId = async (req, res) => {
  try {
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


// ✅ 3. Update Delivery Status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = { status };

    if (status === "Delivered") {
      updateData.deliveredAt = new Date();
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ 4. Get All Deliveries (Admin)
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};