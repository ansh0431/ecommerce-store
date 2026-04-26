const express = require("express")
const router  = express.Router()
const { body, param } = require("express-validator")
const validate = require("../middleware/validate")
const auth = require("../middleware/auth")
const {
    createOrder, getAllOrders, getOrdersByUser
} = require("../controllers/orderController")

const orderValidation = [
    body("products").isArray({ min: 1 }).withMessage("Products array is required and cannot be empty"),
    body("products.*.productId").isMongoId().withMessage("Invalid product ID in products array"),
    body("products.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("totalPrice").isFloat({ min: 0 }).withMessage("Total price must be non-negative"),
    validate
]

const userIdParam = [
    param("userId").isMongoId().withMessage("Invalid user ID"),
    validate
]

router.post( "/",       auth, orderValidation, createOrder)
router.get(  "/",       auth,                  getAllOrders) // In a real app, this should have admin auth
router.get(  "/:userId", auth, userIdParam,     getOrdersByUser)

module.exports = router
