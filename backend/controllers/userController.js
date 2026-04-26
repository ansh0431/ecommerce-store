const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// POST /api/users/register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        const exists = await User.findOne({ email })
        if (exists) {
            return res.status(409).json({ message: "Email already registered" })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({ name, email, password: hashedPassword })

        res.status(201).json({ message: "Account created successfully", user })
    } catch (error) {
        next(error)
    }
}

// POST /api/users/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Strip password before sending
        const userObj = user.toJSON()

        res.json({ token, user: userObj })
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login }
