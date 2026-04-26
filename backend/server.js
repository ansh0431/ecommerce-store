require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const rateLimit = require("express-rate-limit")

const connectDB = require("./config/db")
const productRoutes = require("./routes/productRoutes")
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes")
const errorHandler = require("./middleware/errorHandler")

const app = express()

// Connect to MongoDB
connectDB()

// Security Headers
app.use(helmet())

// CORS setup (Update origin for production)
app.use(cors())

// Rate Limiting (prevent brute force & DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
})
app.use("/api", limiter)

// Body parser
app.use(express.json({ limit: "10kb" })) // Limit body size to 10kb to prevent payload too large attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }))



// Routes
app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)

// Root endpoint
app.get("/", (req, res) => {
    res.send("Ecommerce API Running (Production Ready)")
})

// Handle unhandled routes (404)
app.use((req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server`)
    err.status = 404
    next(err)
})

// Centralized error handling middleware (Must be last)
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})