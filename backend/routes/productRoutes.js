const express = require("express")
const router = express.Router()

const { body, param } = require("express-validator")
const validate = require("../middleware/validate")
const auth = require("../middleware/auth")

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    getRecommendations
} = require("../controllers/productController")


// Product validation
const productValidation = [
    body("name").trim().notEmpty().withMessage("Name is required")
        .isLength({ max: 100 }).withMessage("Name too long"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    validate
]

// ID validation
const idParam = [
    param("id").isMongoId().withMessage("Invalid product ID"),
    validate
]
console.log("DEBUG CHECK →", {
    auth,
    createProductReview,
    idParam
})

router.post("/", auth, ...productValidation, createProduct)

router.get("/", getProducts)

router.get("/recommendations/:id", ...idParam, getRecommendations)

router.get("/:id/reviews", ...idParam, getProductReviews)

router.post("/:id/review", auth, ...idParam, createProductReview)

router.get("/:id", ...idParam, getProductById)

router.put("/:id", auth, ...idParam, updateProduct)

router.delete("/:id", auth, ...idParam, deleteProduct)

module.exports = router