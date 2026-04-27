console.log("TEST SCRIPT STARTED")
const fetch = require("node-fetch")

const API = "https://ecommerce-store-ju5z.onrender.com"

let token = null
let productId = null
let productPrice = 0

// -----------------------------
// Test server
// -----------------------------
async function testServer() {
  console.log("\n🔍 Testing server...")

  const res = await fetch(API)
  const text = await res.text()

  console.log("Server response:", text)
}

// -----------------------------
// Test frontend pages
// -----------------------------
async function testFrontend() {

  console.log("\n🌐 Testing frontend pages...")

  const pages = [
    "/",
    "/index.html",
    "/login.html",
    "/register.html",
    "/cart.html",
    "/checkout.html",
    "/orders.html"
  ]

  for (const page of pages) {
    try {

      const res = await fetch(`https://endearing-lebkuchen-7ce2ef.netlify.app${page}`)

      console.log(`${page} → ${res.status}`)

    } catch (err) {

      console.log(`${page} → FAILED`)
    }
  }
}

// -----------------------------
// Test products API
// -----------------------------
async function testProducts() {

  console.log("\n📦 Testing products API...")

  const res = await fetch(`${API}/api/products`)
  const data = await res.json()

  console.log("Products count:", data.products.length)

  if (data.products.length > 0) {
    productId = data.products[0]._id
    productPrice = data.products[0].price
  }
}

// -----------------------------
// Test user registration
// -----------------------------
async function testRegister() {

  console.log("\n👤 Testing user registration...")

  const res = await fetch(`${API}/api/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "apitest@example.com",
      password: "123456",
      phone: "9876543210",
      pincode: "110001"
    })
  })

  const data = await res.json()

  console.log("Register response:", data)
}

// -----------------------------
// Test login
// -----------------------------
async function testLogin() {

  console.log("\n🔑 Testing login...")

  const res = await fetch(`${API}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "apitest@example.com",
      password: "123456"
    })
  })

  const data = await res.json()

  token = data.token

  console.log("Login success:", !!token)
}

// -----------------------------
// Test order creation
// -----------------------------
async function testCreateOrder() {

  console.log("\n🛒 Testing checkout...")

  if (!productId) {
    console.log("No products available")
    return
  }

  const res = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      products: [
        {
          productId: productId,
          quantity: 1
        }
      ],
      totalPrice: productPrice,
      shippingAddress: "Test User, Test Address, Pincode: 110001, Phone: 9876543210"
    })
  })

  const data = await res.json()

  console.log("Order status:", res.status)
  console.log("Order response:", data)
}

// -----------------------------
// Test orders route
// -----------------------------
async function testOrders() {

  console.log("\n📋 Testing orders route...")

  const res = await fetch(`${API}/api/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await res.json()

  if (Array.isArray(data)) {
    console.log("Orders:", data.length)
  } else if (data.orders) {
    console.log("Orders:", data.orders.length)
  } else {
    console.log("Orders response:", data)
  }
}
// -----------------------------
// Run all tests
// -----------------------------
async function runTests() {

  try {

    await testServer()

    await testFrontend()

    await testProducts()

    await testRegister()

    await testLogin()

    await testCreateOrder()

    await testOrders()

    console.log("\n✅ ALL TESTS COMPLETED")

  } catch (err) {

    console.error("❌ Test failed:", err.message)
  }
}

runTests()