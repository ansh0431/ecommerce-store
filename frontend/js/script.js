const API = "http://localhost:5000"

// ── Auth ──
const getToken = () => localStorage.getItem("token")
const getUser  = () => JSON.parse(localStorage.getItem("user") || "null")
const isLoggedIn = () => !!getToken()

// ── Cart ──
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]")
const saveCart = (cart) => { localStorage.setItem("cart", JSON.stringify(cart)); updateCartCount() }

function addToCart(product) {
    const cart = getCart()
    const idx  = cart.findIndex(i => i._id === product._id)
    if (idx > -1) { cart[idx].qty = (cart[idx].qty || 1) + 1 }
    else           { cart.push({ ...product, qty: 1 }) }
    saveCart(cart)
    showToast(`"${product.name}" added to cart ✓`, "success")
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i._id !== id))
}

function updateCartQty(id, delta) {
    const cart = getCart()
    const idx  = cart.findIndex(i => i._id === id)
    if (idx === -1) return
    cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta)
    saveCart(cart)
}

function getCartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * (i.qty || 1), 0)
}

function getCartCount() {
    return getCart().reduce((sum, i) => sum + (i.qty || 1), 0)
}

// ── UI Helpers ──
function updateCartCount() {
    const el = document.getElementById("cart-count")
    if (el) { const n = getCartCount(); el.textContent = n; el.style.display = n ? "flex" : "none" }
}

function showToast(msg, type = "success") {
    let t = document.getElementById("toast")
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t) }
    t.textContent = msg; t.className = `show ${type}`
    clearTimeout(t._timer)
    t._timer = setTimeout(() => { t.classList.remove("show") }, 3000)
}

function showAlert(id, msg, type = "error") {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = msg; el.className = `alert alert-${type} show`
    setTimeout(() => el.classList.remove("show"), 4000)
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId)
    if (!btn) return
    btn.disabled = loading
    btn.dataset.orig = btn.dataset.orig || btn.textContent
    btn.textContent  = loading ? "Please wait…" : btn.dataset.orig
}

function formatPrice(n) { return "₹" + Number(n).toLocaleString("en-IN") }

function productImg(p) {
    if (p.image && p.image.startsWith("http")) return p.image
    const seed = p._id || p.name || "product"
    return `https://picsum.photos/seed/${seed}/400/300`
}

function navbar(active = "") {
    const user = getUser()
    return `
    <nav class="navbar">
        <a href="index.html" class="navbar-brand">⚡ ShopVibe</a>
        <ul class="navbar-links">
            <li><a href="index.html" class="${active==="home"?"active":""}" >Home</a></li>
            <li class="hide-mobile"><a href="cart.html" class="${active==="cart"?"active":""} cart-link">
                🛒 Cart <span id="cart-count" class="cart-count" style="display:none">0</span>
            </a></li>
            ${user
                ? `<li><a href="#" onclick="logout()">Logout</a></li>`
                : `<li><a href="login.html" class="${active==="login"?"active":""}">Login</a></li>
                   <li><a href="register.html" class="btn btn-primary btn-sm">Sign Up</a></li>`
            }
            <li class="hide-desktop" style="display:none"><a href="cart.html">🛒 <span id="cart-count2">0</span></a></li>
        </ul>
    </nav>`
}

function logout() {
    localStorage.removeItem("token"); localStorage.removeItem("user")
    showToast("Logged out successfully", "success")
    setTimeout(() => window.location.href = "index.html", 800)
}

// Run on every page
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount()
})
