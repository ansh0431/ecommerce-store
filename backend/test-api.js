const BASE = "http://localhost:5000"

let token = null
let productId = null
let productPrice = 0

console.log("TEST SCRIPT STARTED")

// ----------------------------
// SERVER TEST
// ----------------------------
async function testServer() {
  console.log("\n🔍 Testing server...")

  const res = await fetch(BASE)
  const text = await res.text()

  console.log("Server response:", text)
}

// ----------------------------
// FRONTEND TEST
// ----------------------------
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
      const res = await fetch(`${BASE}${page}`)
      console.log(`${page} → ${res.status}`)
    } catch (err) {
      console.log(`${page} → FAILED`)
    }
  }
}

// ----------------------------
// PRODUCTS TEST
// ----------------------------
async function testProducts() {
  console.log("\n📦 Testing products API...")

  const res = await fetch(`${BASE}/api/products`)
  const data = await res.json()

  console.log("Products count:", data.products.length)

  if (data.products.length > 0) {
    productId = data.products[0]._id
    productPrice = data.products[0].price
  }
}

// ----------------------------
// USER REGISTER
// ----------------------------
async function testRegister() {
  console.log("\n👤 Testing user registration...")

  const res = await fetch(`${BASE}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "API Test User",
      email: "apitest@example.com",
      password: "123456",
      phone: "9876543210",
      pincode: "110001"
    })
  })

  const data = await res.json()
  console.log("Register response:", data)
}

// ----------------------------
// LOGIN TEST
// ----------------------------
async function testLogin() {
  console.log("\n🔑 Testing login...")

  const res = await fetch(`${BASE}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "apitest@example.com",
      password: "123456"
    })
  })

  const data = await res.json()

  token = data.token

  console.log("Login success:", !!token)
}

// ----------------------------
// PROFILE TEST (STEP 1)
// ----------------------------
async function testProfile() {
  console.log("\n👤 Testing user profile...")

  const res = await fetch(`${BASE}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await res.json()

  console.log("Profile data:", {
    name: data.name,
    email: data.email,
    phone: data.phone
  })
}

// ----------------------------
// CREATE ORDER
// ----------------------------
async function testCheckout() {
  console.log("\n🛒 Testing checkout...")

  const res = await fetch(`${BASE}/api/orders`, {
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
      shippingAddress: "Test Address, Pincode: 110001, Phone: 9876543210",
      totalPrice: productPrice
    })
  })

  const data = await res.json()

  console.log("Order status:", res.status)
  console.log("Order response:", data._id)
}

// ----------------------------
// ORDER HISTORY (STEP 2)
// ----------------------------
async function testOrders() {
  console.log("\n📋 Testing orders route...")

  const res = await fetch(`${BASE}/api/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await res.json()

  console.log("Orders count:", data.length)
}

// ----------------------------
// RUN ALL TESTS
// ----------------------------
async function runTests() {
  try {

    await testServer()

    await testFrontend()

    await testProducts()

    await testRegister()

    await testLogin()

    await testProfile()

    await testCheckout()

    await testOrders()

    console.log("\n✅ ALL SYSTEM TESTS COMPLETED")

  } catch (err) {
    console.error("Test failed:", err.message)
  }
}

runTests()