const Product = require("../models/Product")
const NodeCache = require("node-cache")
const cache = new NodeCache({ stdTTL: 300 }) // 5 min cache

// POST /api/products
const createProduct = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" })
        const product = await Product.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
}

// GET /api/products
const getProducts = async (req, res, next) => {
    try {
        const { category, search, sort, minPrice, maxPrice, page = 1, limit = 20 } = req.query

        // Cache key based on query params
        const cacheKey = `products_${category || 'all'}_${search || 'none'}_${sort || 'default'}_${minPrice || '0'}_${maxPrice || 'inf'}_${page}_${limit}`
        const cachedRes = cache.get(cacheKey)
        if (cachedRes) {
            return res.json(cachedRes)
        }

        const filter = {}
        if (category) filter.category = category
        
        // Regex search for name (Task 1)
        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        // Price range filter (Task 1)
        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }

        const skip = (Number(page) - 1) * Number(limit)
        
        // Sorting logic (Task 3)
        const sortObj = {}
        if (sort === "price_asc") sortObj.price = 1
        else if (sort === "price_desc") sortObj.price = -1
        else if (sort === "name_asc") sortObj.name = 1
        else sortObj.createdAt = -1

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter)
        ])

        const responseData = {
            products,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        }

        cache.set(cacheKey, responseData)
        res.json(responseData)
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
        if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" })
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
        if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" })
        const deleted = await Product.findByIdAndDelete(req.params.id)
        if (!deleted) return res.status(404).json({ message: "Product not found" })
        cache.flushAll() // Clear cache
        res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        next(error)
    }
}

// POST /api/products/:id/review
const createProductReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body
        const product = await Product.findById(req.params.id)

        if (!product) return res.status(404).json({ message: "Product not found" })

        const alreadyReviewed = product.reviews.find(
            r => r.userId.toString() === req.user.id.toString()
        )

        if (alreadyReviewed) {
            return res.status(400).json({ message: "Product already reviewed" })
        }

        const review = {
            name: req.user.name || "User",
            rating: Number(rating),
            comment,
            userId: req.user.id
        }

        product.reviews.push(review)
        product.numReviews = product.reviews.length
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

        await product.save()
        res.status(201).json({ message: "Review added" })
    } catch (error) {
        next(error)
    }
}

// GET /api/products/:id/reviews
const getProductReviews = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.json(product.reviews)
    } catch (error) {
        next(error)
    }
}

// GET /api/products/recommendations/:id
const getRecommendations = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })

        const recommendations = await Product.find({
            _id: { $ne: product._id },
            category: product.category
        }).sort({ rating: -1, numReviews: -1 }).limit(4)

        res.json(recommendations)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    getRecommendations
}