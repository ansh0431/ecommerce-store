const mongoose = require("mongoose")
require("dotenv").config()

const Product = require("./models/Product")

const products = [
    {
        name: "Gold Facial Kit",
        price: 799,
        description: "Salon style gold facial kit for glowing skin",
        image: "https://picsum.photos/seed/goldfacial/400/300",
        category: "Skincare",
        stock: 50
    },
    {
        name: "Diamond Facial Kit",
        price: 899,
        description: "Diamond facial kit for radiant skin",
        image: "https://picsum.photos/seed/diamondfacial/400/300",
        category: "Skincare",
        stock: 40
    },
    {
        name: "Papaya Face Wash",
        price: 199,
        description: "Deep cleansing papaya face wash",
        image: "https://picsum.photos/seed/papayawash/400/300",
        category: "Face Wash",
        stock: 60
    },
    {
        name: "Charcoal Face Wash",
        price: 249,
        description: "Activated charcoal face wash",
        image: "https://picsum.photos/seed/charcoalwash/400/300",
        category: "Face Wash",
        stock: 70
    },
    {
        name: "Neem Face Wash",
        price: 189,
        description: "Neem and aloe antibacterial face wash",
        image: "https://picsum.photos/seed/neemwash/400/300",
        category: "Face Wash",
        stock: 55
    },
    {
        name: "Vitamin C Serum",
        price: 599,
        description: "Brightening vitamin C serum",
        image: "https://picsum.photos/seed/vitc/400/300",
        category: "Serum",
        stock: 30
    },
    {
        name: "Anti Pollution Face Pack",
        price: 299,
        description: "Charcoal anti pollution face pack",
        image: "https://picsum.photos/seed/facepack/400/300",
        category: "Face Pack",
        stock: 40
    },
    {
        name: "Papaya Face Pack",
        price: 279,
        description: "Papaya brightening face pack",
        image: "https://picsum.photos/seed/papayapack/400/300",
        category: "Face Pack",
        stock: 35
    },
    {
        name: "SunBan SPF 30 Sunscreen",
        price: 249,
        description: "Daily protection sunscreen SPF 30",
        image: "https://picsum.photos/seed/sunban30/400/300",
        category: "Sunscreen",
        stock: 60
    },
    {
        name: "SunBan SPF 50 Sunscreen",
        price: 349,
        description: "High protection sunscreen SPF 50",
        image: "https://picsum.photos/seed/sunban50/400/300",
        category: "Sunscreen",
        stock: 45
    },
    {
        name: "Aloe Vera Gel",
        price: 199,
        description: "Soothing aloe vera skin gel",
        image: "https://picsum.photos/seed/aloegel/400/300",
        category: "Skincare",
        stock: 70
    },
    {
        name: "Almond Body Lotion",
        price: 299,
        description: "Moisturizing almond body lotion",
        image: "https://picsum.photos/seed/bodylotion/400/300",
        category: "Body Care",
        stock: 50
    },
    {
        name: "Herbal Scrub",
        price: 259,
        description: "Herbal exfoliating face scrub",
        image: "https://picsum.photos/seed/scrub/400/300",
        category: "Scrub",
        stock: 45
    },
    {
        name: "Charcoal Peel Off Mask",
        price: 229,
        description: "Deep cleansing charcoal peel mask",
        image: "https://picsum.photos/seed/peelmask/400/300",
        category: "Mask",
        stock: 50
    },
    {
        name: "Hair Removal Cream",
        price: 199,
        description: "Smooth hair removal cream",
        image: "https://picsum.photos/seed/hairremoval/400/300",
        category: "Body Care",
        stock: 60
    },
    {
        name: "Matte Lipstick",
        price: 299,
        description: "Long lasting matte lipstick",
        image: "https://picsum.photos/seed/lipstick/400/300",
        category: "Cosmetics",
        stock: 70
    },
    {
        name: "Liquid Eyeliner",
        price: 199,
        description: "Waterproof liquid eyeliner",
        image: "https://picsum.photos/seed/eyeliner/400/300",
        category: "Cosmetics",
        stock: 65
    },
    {
        name: "Compact Powder",
        price: 249,
        description: "Smooth compact face powder",
        image: "https://picsum.photos/seed/compact/400/300",
        category: "Cosmetics",
        stock: 55
    },
    {
        name: "BB Cream",
        price: 349,
        description: "All in one beauty balm cream",
        image: "https://picsum.photos/seed/bbcream/400/300",
        category: "Cosmetics",
        stock: 40
    },
    {
        name: "Makeup Remover",
        price: 249,
        description: "Gentle makeup remover lotion",
        image: "https://picsum.photos/seed/remover/400/300",
        category: "Skincare",
        stock: 50
    }
]

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        await Product.deleteMany()
        await Product.insertMany(products)

        console.log("Products added successfully")
        process.exit()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

seedProducts()