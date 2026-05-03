const validVouchers = {
  SAVE10: { type: "percentage", value: 10 },
  FOOD20: { type: "percentage", value: 20 },
  WELCOME50: { type: "fixed", value: 50 },
};

exports.applyVoucher = async (req, res) => {
  try {
    const { voucherCode, cartTotal } = req.body;

    if (!voucherCode || voucherCode.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Voucher code is required",
      });
    }

    if (!cartTotal || Number(cartTotal) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart total",
      });
    }

    const code = voucherCode.trim().toUpperCase();
    const voucher = validVouchers[code];

    if (!voucher) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher code. Please enter a valid code.",
      });
    }

    let discount = 0;

    if (voucher.type === "percentage") {
      discount = (Number(cartTotal) * voucher.value) / 100;
    } else {
      discount = voucher.value;
    }

    const finalTotal = Math.max(Number(cartTotal) - discount, 0);

    const voucherImagePath = req.file
      ? `/uploads/vouchers/${req.file.filename}`
      : null;

    return res.status(200).json({
      success: true,
      message: "Voucher applied successfully",
      voucherCode: code,
      discount,
      finalTotal,
      voucherImage: voucherImagePath,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while applying voucher",
      error: error.message,
    });
  }
};