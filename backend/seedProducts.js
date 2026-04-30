require("dotenv").config()

const mongoose = require("mongoose")
const connectDB = require("./config/db")
const Product = require("./models/Product")

const products = [

    {
        name: "Nike Air Zoom Running Shoes",
        description: "Lightweight running shoes with breathable mesh.",
        price: 3499,
        category: "Footwear",
        image: "https://source.unsplash.com/300x300/?nike-shoes",
        stock: 50
    },
    {
        name: "Adidas Ultraboost Shoes",
        description: "Comfortable sports shoes designed for daily running.",
        price: 3999,
        category: "Footwear",
        image: "https://source.unsplash.com/300x300/?adidas-shoes",
        stock: 40
    },
    {
        name: "Apple AirPods Pro",
        description: "Wireless earbuds with noise cancellation.",
        price: 19999,
        category: "Electronics",
        image: "https://source.unsplash.com/300x300/?airpods",
        stock: 25
    },
    {
        name: "Sony Wireless Headphones",
        description: "High quality over-ear noise cancelling headphones.",
        price: 7999,
        category: "Electronics",
        image: "https://source.unsplash.com/300x300/?headphones",
        stock: 30
    },
    {
        name: "Samsung Galaxy Smart Watch",
        description: "Smartwatch with fitness tracking and notifications.",
        price: 9999,
        category: "Electronics",
        image: "https://source.unsplash.com/300x300/?smartwatch",
        stock: 35
    },
    {
        name: "Men's Casual T-Shirt",
        description: "Cotton casual t-shirt for everyday comfort.",
        price: 599,
        category: "Clothing",
        image: "https://source.unsplash.com/300x300/?tshirt",
        stock: 100
    },
    {
        name: "Men's Denim Jacket",
        description: "Classic blue denim jacket.",
        price: 1999,
        category: "Clothing",
        image: "https://source.unsplash.com/300x300/?denim-jacket",
        stock: 45
    },
    {
        name: "Women's Summer Dress",
        description: "Comfortable lightweight summer dress.",
        price: 1499,
        category: "Clothing",
        image: "https://source.unsplash.com/300x300/?summer-dress",
        stock: 60
    },
    {
        name: "Leather Wallet",
        description: "Premium leather wallet with multiple compartments.",
        price: 899,
        category: "Accessories",
        image: "https://source.unsplash.com/300x300/?wallet",
        stock: 70
    },
    {
        name: "Men's Sunglasses",
        description: "UV protection stylish sunglasses.",
        price: 999,
        category: "Accessories",
        image: "https://source.unsplash.com/300x300/?sunglasses",
        stock: 80
    }

]

// Generate 40 more automatically
for (let i = 11; i <= 50; i++) {
    products.push({
        name: `Sample Product ${i}`,
        description: `High quality product number ${i}`,
        price: Math.floor(Math.random() * 3000) + 300,
        category: ["Electronics", "Clothing", "Accessories", "Footwear"][i % 4],
        image: `https://source.unsplash.com/300x300/?product`,
        stock: Math.floor(Math.random() * 80) + 20
    })
}

const seedProducts = async () => {

    try {

        await connectDB()

        await Product.insertMany(products)

        console.log("✅ 50 Products Added")

        process.exit()

    } catch (err) {

        console.error(err)
        process.exit(1)

    }

}

seedProducts()