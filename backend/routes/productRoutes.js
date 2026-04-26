const express = require("express")
const router  = express.Router()
const { body, param } = require("express-validator")
const validate = require("../middleware/validate")
const {
    createProduct, getProducts, getProductById,
    updateProduct, deleteProduct
} = require("../controllers/productController")

const productValidation = [
    body("name").trim().notEmpty().withMessage("Name is required")
        .isLength({ max: 100 }).withMessage("Name too long"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    validate
]

const idParam = [
    param("id").isMongoId().withMessage("Invalid product ID"),
    validate
]

router.post(   "/",    productValidation,        createProduct)
router.get(    "/",                              getProducts)
router.get(    "/:id", idParam,                  getProductById)
router.put(    "/:id", idParam,                  updateProduct)
router.delete( "/:id", idParam,                  deleteProduct)

module.exports = router