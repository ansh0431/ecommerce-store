const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// POST /api/users/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, pincode } = req.body

        const exists = await User.findOne({ email })
        if (exists) {
            return res.status(409).json({ message: "Email already registered" })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            pincode: pincode || ""
        })

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

// GET /api/users/profile
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Ensure phone, address, and pincode have fallback values
        const userObj = user.toJSON()
        if (userObj.phone === undefined) userObj.phone = ""
        if (userObj.address === undefined) userObj.address = ""
        if (userObj.pincode === undefined) userObj.pincode = ""

        res.json(userObj)
    } catch (error) {
        next(error)
    }
}

// PUT /api/users/profile
const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, address, pincode } = req.body
        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (name) user.name = name
        if (phone) user.phone = phone
        if (pincode) user.pincode = pincode
        if (address) user.address = address

        await user.save()
        res.json(user)
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(val => val.message)
            return res.status(400).json({ message: messages.join(", ") })
        }
        next(error)
    }
}

// Single, clean export at the bottom
module.exports = { register, login, getUserProfile, updateUserProfile }