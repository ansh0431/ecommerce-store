const User = require("../models/User")
const Order = require("../models/Order")
const Product = require("../models/Product")

const getAdminStats = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" })

        const totalUsers = await User.countDocuments()
        const totalOrders = await Order.countDocuments()
        
        const orders = await Order.find()
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0)
        
        // Basic top selling products by checking product frequency in orders
        // For simplicity and speed without complex aggregation
        const productCounts = {}
        orders.forEach(order => {
            order.products.forEach(p => {
                productCounts[p.productId] = (productCounts[p.productId] || 0) + p.quantity
            })
        })
        
        const topProductIds = Object.keys(productCounts).sort((a, b) => productCounts[b] - productCounts[a]).slice(0, 5)
        const topProducts = await Product.find({ _id: { $in: topProductIds } })
        
        const topSellingProducts = topProducts.map(p => ({
            _id: p._id,
            name: p.name,
            sold: productCounts[p._id.toString()] || 0
        })).sort((a, b) => b.sold - a.sold)

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            topSellingProducts
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { getAdminStats }
