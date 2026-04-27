const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            trim: true,
            default: "Uncategorized"
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"]
        },
        rating: {
            type: Number,
            required: true,
            default: 0
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0
        },
        reviews: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                name: { type: String, required: true },
                rating: { type: Number, required: true },
                comment: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
)

// Indexes for commonly queried fields
productSchema.index({ category: 1 })
productSchema.index({ name: "text", description: "text" }) // full-text search ready

module.exports = mongoose.model("Product", productSchema)