const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash_on_delivery", "online_transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "COD Pending",
        "Waiting for Verification",
        "Paid",
        "Rejected",
        "Refund Pending",
      ],
      required: true,
    },
    transactionId: {
      type: String,
      default: "",
    },
    receiptImage: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
