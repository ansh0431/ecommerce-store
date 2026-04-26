const Product = require("../models/Product")

// POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
}

// GET /api/products
const getProducts = async (req, res, next) => {
    try {
        const { category, search, sort, page = 1, limit = 20 } = req.query
        const filter = {}

        if (category) filter.category = category
        if (search)   filter.$text = { $search: search }

        const skip = (Number(page) - 1) * Number(limit)
        const sortObj = sort === "price_asc"  ? { price: 1 }
                      : sort === "price_desc" ? { price: -1 }
                      : { createdAt: -1 }

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter)
        ])

        res.json({
            products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/products/:id
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.json(product)
    } catch (error) {
        next(error)
    }
}

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
    try {
        // Prevent overwriting _id
        delete req.body._id

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        )
        if (!updated) return res.status(404).json({ message: "Product not found" })
        res.json(updated)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id)
        if (!deleted) return res.status(404).json({ message: "Product not found" })
        res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        next(error)
    }
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct }
