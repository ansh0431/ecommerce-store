const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v) => validator.isEmail(v),
                message: "Invalid email address"
            }
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    { timestamps: true }
)



// Never return password in JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    return obj
}

module.exports = mongoose.model("User", userSchema)