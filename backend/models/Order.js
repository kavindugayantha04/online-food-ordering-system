const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalPrice: {
      type: Number,
      required: true,
    },

    orderType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending Payment",
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready for Pickup",
        "Out for Delivery",
        "Delivered",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online_transfer"],
      default: "cash_on_delivery",
    },

    paymentStatus: {
      type: String,
      enum: [
        "COD Pending",
        "Waiting for Verification",
        "Paid",
        "Rejected",
        "Refund Pending",
      ],
      default: "COD Pending",
    },

    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
    },

    deliveryAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
    },

    customImage: {
      type: String,
      default: "",
    },

    customMessage: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);