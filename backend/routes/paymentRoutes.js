const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create an Order
router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        // Validation for Amazon-level stability
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const options = {
            // Math.round ensures no decimals; * 100 converts INR to Paise
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error("RAZORPAY ERROR:", error);
        res.status(500).json({ message: error.message });
    }
});
// 2. Verify Payment (Crucial for security)
router.post("/verify", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        return res.json({ success: true, message: "Payment Verified Successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid Signature" });
    }
});

module.exports = router;