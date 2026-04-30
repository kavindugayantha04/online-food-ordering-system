const Voucher = require("../models/Voucher");

const PREDEFINED_VOUCHERS = {
  SAVE10: { discount: 10, type: "percentage" },
  FOOD20: { discount: 20, type: "percentage" },
  WELCOME50: { discount: 50, type: "fixed" },
};

const DEFAULT_EXPIRY_DAYS = 30;

const getDefaultExpiryDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + DEFAULT_EXPIRY_DAYS);
  return now;
};

const ensureVoucherFromPredefined = async (code) => {
  const voucherConfig = PREDEFINED_VOUCHERS[code];
  if (!voucherConfig) {
    return null;
  }

  let voucher = await Voucher.findOne({ code });
  if (!voucher) {
    voucher = await Voucher.create({
      code,
      discount: voucherConfig.discount,
      type: voucherConfig.type,
      expiryDate: getDefaultExpiryDate(),
    });
  }

  return voucher;
};

exports.applyVoucher = async (req, res) => {
  try {
    const rawCode = req.body.code || req.body.voucherCode;
    const code = String(rawCode || "").trim().toUpperCase();
    const cartTotal = Number(req.body.cartTotal || 0);

    if (!code) {
      return res.status(400).json({ success: false, message: "Voucher code is required." });
    }

    let voucher = await Voucher.findOne({ code });

    if (!voucher) {
      voucher = await ensureVoucherFromPredefined(code);
    }

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid voucher code.",
      });
    }

    const now = new Date();
    if (new Date(voucher.expiryDate) < now) {
      return res.status(400).json({
        success: false,
        message: "This voucher has expired.",
      });
    }

    const discountValue = Number(voucher.discount);
    const discountType = voucher.type || "percentage";
    const discountAmount =
      cartTotal > 0
        ? discountType === "fixed"
          ? Math.min(discountValue, cartTotal)
          : (cartTotal * discountValue) / 100
        : 0;
    const finalTotal = Math.max(cartTotal - discountAmount, 0);
    const voucherImagePath = req.file ? `/uploads/vouchers/${req.file.filename}` : null;

    return res.status(200).json({
      success: true,
      message: "Voucher applied successfully.",
      voucher: {
        code: voucher.code,
        discount: discountValue,
        type: discountType,
        expiryDate: voucher.expiryDate,
      },
      discountValue,
      discountType,
      discountAmount: Number(discountAmount.toFixed(2)),
      finalTotal: Number(finalTotal.toFixed(2)),
      uploadedImagePath: voucherImagePath,
    });
  } catch (error) {
    console.error("Apply voucher error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while applying voucher.",
    });
  }
};
