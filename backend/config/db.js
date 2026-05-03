const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        // Supports both MONGODB_URI (standard) and MONGO_URI (legacy) env var names
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
        console.log("MongoDB Atlas Connected")
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

module.exports = connectDB