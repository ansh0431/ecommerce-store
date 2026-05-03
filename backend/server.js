require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const hpp = require("hpp")
const sanitize = require("mongo-sanitize")
app.set('trust proxy', 1);
const rateLimit = require("express-rate-limit")

const connectDB = require("./config/db")
const productRoutes = require("./routes/productRoutes")
const userRoutes = require("./routes/userRoutes")
const orderRoutes = require("./routes/orderRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const chatRoutes = require("./routes/chatRoutes")
const adminRoutes = require("./routes/adminRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const errorHandler = require("./middleware/errorHandler")

const app = express()

// Connect to MongoDB
connectDB()

// Security Headers (CSP disabled to allow inline scripts in this project's structure)
app.use(helmet({
    contentSecurityPolicy: false
}))

// CORS setup (Update origin for production)
const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://endearing-lebkuchen-7ce2ef.netlify.app"
]
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

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

// Prevent parameter pollution
app.use(hpp())

// Sanitize data against NoSQL query injection
app.use((req, res, next) => {
    req.body = sanitize(req.body)
    req.params = sanitize(req.params)
    // Do not overwrite req.query anywhere as per requirement
    next()
})

// Serve Static Files
const path = require("path")
app.use(express.static(path.join(__dirname, "../frontend")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/products", productRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

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