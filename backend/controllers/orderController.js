const Order = require("../models/Order")
const Product = require("../models/Product")

// POST /api/orders — protected
const createOrder = async (req, res, next) => {
    try {
        const { products, totalPrice, shippingAddress } = req.body

        // Server-side totalPrice verification — never trust client
        const productIds = products.map(p => p.productId)
        const dbProducts = await Product.find({ _id: { $in: productIds } })

        if (dbProducts.length !== products.length) {
            return res.status(400).json({ message: "One or more products not found" })
        }

        // Verify stock availability
        for (const item of products) {
            const dbProd = dbProducts.find(p => p._id.toString() === item.productId)
            if (dbProd.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${dbProd.name}" (available: ${dbProd.stock})`
                })
            }
        }

        // Recalculate price server-side
        const calculatedTotal = products.reduce((sum, item) => {
            const dbProd = dbProducts.find(p => p._id.toString() === item.productId)
            return sum + dbProd.price * item.quantity
        }, 0)

        // Allow a ₹1 rounding tolerance; reject if client total is way off
        if (Math.abs(calculatedTotal - totalPrice) > 1) {
            return res.status(400).json({
                message: "Total price mismatch. Please refresh and try again."
            })
        }

        const order = await Order.create({
            userId: req.user.id,
            products,
            totalPrice: calculatedTotal,
            shippingAddress,
            status: "pending"
        })

        res.status(201).json(order)
    } catch (error) {
        next(error)
    }
}

// GET /api/orders — all orders (admin)
const getAllOrders = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" })
        }
        const orders = await Order.find()
            .populate("products.productId", "name price image")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        next(error)
    }
}

// GET /api/orders/:userId — user's own orders (protected)
const getOrdersByUser = async (req, res, next) => {
    try {
        console.log("DEBUG: getOrdersByUser route hit")
        console.log("userId param:", req.params.userId)

        // Users can only see their own orders
        if (req.user.id !== req.params.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: access denied" })
        }

        const orders = await Order.find({ userId: req.params.userId })
            .populate("products.productId", "name price image")
            .sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        next(error)
    }
}

const getMyOrders = async (req, res, next) => {
    try {

        console.log("DEBUG: getMyOrders route hit")
        console.log("User from token:", req.user)

        const orders = await Order.find({ userId: req.user.id })
            .populate("products.productId", "name price image")
            .sort({ createdAt: -1 })
            .lean()
        res.json(orders)
    } catch (error) {
        next(error)
    }
}

// PUT /api/orders/:id — admin update order status
const updateOrderStatus = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" })
        }

        const { status } = req.body
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: "Order not found" })

        order.status = status
        await order.save()
        res.json(order)
    } catch (error) {
        next(error)
    }
}

module.exports = { createOrder, getAllOrders, getOrdersByUser, getMyOrders, updateOrderStatus }
