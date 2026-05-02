const express = require("express")
const router = express.Router()
const { body, param } = require("express-validator")
const validate = require("../middleware/validate")
const auth = require("../middleware/auth")
const {
    createOrder, getAllOrders, getOrdersByUser, getMyOrders, updateOrderStatus
} = require("../controllers/orderController")

const orderValidation = [
    body("products").isArray({ min: 1 }).withMessage("Products array is required and cannot be empty"),
    body("products.*.productId").isMongoId().withMessage("Invalid product ID in products array"),
    body("products.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("totalPrice").isFloat({ min: 0 }).withMessage("Total price must be non-negative"),
    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    body("paymentMethod").optional().isIn(["online", "cod"]).withMessage("Invalid payment method"),
    validate
]

const userIdParam = [
    param("userId").isMongoId().withMessage("Invalid user ID"),
    validate
]

const statusValidation = [
    body("status").isIn(["pending", "processing", "shipped", "delivered", "cancelled"]).withMessage("Invalid status"),
    validate
]

const idParam = [
    param("id").isMongoId().withMessage("Invalid order ID"),
    validate
]

router.post("/", auth, orderValidation, createOrder)

router.get("/my-orders", auth, getMyOrders)

router.get("/admin", auth, getAllOrders)

router.get("/by-user/:userId", auth, userIdParam, getOrdersByUser)

router.put("/:id/status", auth, idParam, statusValidation, updateOrderStatus)
module.exports = router
