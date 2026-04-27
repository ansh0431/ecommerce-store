const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"]
        },
        products: {
            type: [
                {
                    productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: [true, "Product ID is required"]
                    },
                    quantity: {
                        type: Number,
                        required: [true, "Quantity is required"],
                        min: [1, "Quantity must be at least 1"],
                        default: 1
                    }
                }
            ],
            validate: {
                validator: (arr) => arr.length > 0,
                message: "Order must contain at least one product"
            }
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: [0, "Total price cannot be negative"]
        },
        shippingAddress: {
            type: String,
            required: [true, "Shipping address is required"]
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "processing", "shipped", "delivered", "cancelled"],
                message: "Invalid status value"
            },
            default: "pending"
        }
    },
    { timestamps: true }   // replaces manual createdAt, adds updatedAt too
)

// Indexes for fast lookups
orderSchema.index({ userId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Order", orderSchema)
