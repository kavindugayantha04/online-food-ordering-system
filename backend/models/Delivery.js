const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "On the way", "Delivered", "Cancelled"],
      default: "Assigned",
    },
    estimatedTime: {
      type: String,
      default: "",
    },
    proofImage: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
