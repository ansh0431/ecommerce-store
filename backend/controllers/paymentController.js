const Razorpay = require("razorpay")
const crypto = require("crypto")

// Initialize Razorpay instance with credentials from .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// POST /api/payment/create-order
// Creates a Razorpay order and returns the order id + key to the frontend
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount } = req.body // amount in INR (whole rupees)

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount provided" })
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        }

        const order = await razorpay.orders.create(options)

        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        next(error)
    }
}

// POST /api/payment/verify
// Verifies the Razorpay payment signature to confirm payment authenticity
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment verification fields" })
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" })
        }

        res.json({ success: true, message: "Payment verified successfully", paymentId: razorpay_payment_id })
    } catch (error) {
        next(error)
    }
}

module.exports = { createRazorpayOrder, verifyPayment }
