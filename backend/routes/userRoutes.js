const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const validate = require("../middleware/validate")
const auth = require("../middleware/auth")
const { register, login, getProfile, updateProfile } = require("../controllers/userController")

const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validate
]

const loginValidation = [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate
]

router.post("/register", ...registerValidation, register)
router.post("/login", ...loginValidation, login)

const profileValidation = [
    body("phone").optional({ checkFalsy: true }).matches(/^[6-9]\d{9}$/).withMessage("Invalid phone number format"),
    body("pincode").optional({ checkFalsy: true }).matches(/^\d{6}$/).withMessage("Invalid pincode format"),
    validate
]

router.get("/profile", auth, getProfile)
router.put("/profile", auth, profileValidation, updateProfile)

module.exports = router