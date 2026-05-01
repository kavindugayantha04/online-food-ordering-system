const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  // orderId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Order",
  //   required: true
  // },
    orderId: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },

  deliveryLocation: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Assigned", "On the way", "Delivered", "Cancelled"],
    default: "Assigned"
  },
  estimatedTime: {
    type: String
  },
   // 📸 NEW FIELD (IMPORTANT)
    proofImage: {
      type: String,
      default: "",
    },

    // ⏰ NEW FIELD
    deliveredAt: {
      type: Date,
      default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model("Delivery", deliverySchema);