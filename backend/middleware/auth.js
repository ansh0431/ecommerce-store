const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    const authHeader = req.header("Authorization")
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.replace("Bearer ", "")
        : authHeader

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey")
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." })
    }
}

module.exports = auth
