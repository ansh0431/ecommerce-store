// Centralized error handler — must be registered LAST in server.js
const errorHandler = (err, req, res, next) => {
    // Log full error internally
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err)

    // Mongoose duplicate key (e.g. duplicate email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field"
        return res.status(409).json({ message: `${field} already exists` })
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }))
        return res.status(422).json({ message: "Validation failed", errors: messages })
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` })
    }

    // JWT errors
    if (err.name === "JsonWebTokenError")  return res.status(401).json({ message: "Invalid token" })
    if (err.name === "TokenExpiredError")  return res.status(401).json({ message: "Token expired" })

    // Generic fallback — never leak stack in production
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    })
}

module.exports = errorHandler
