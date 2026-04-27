const API = "https://ecommerce-store-ju5z.onrender.com"

// ── Auth ──
const getToken = () => localStorage.getItem("token")
const getUser = () => JSON.parse(localStorage.getItem("user") || "null")
const isLoggedIn = () => !!getToken()

const getAuthHeaders = () => {
    const token = getToken()
    if (!token) {
        window.location.href = "login.html"
        return {}
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }
}

// ── Cart ──
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]")
const saveCart = (cart) => { 
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount() 
}

function addToCart(product) {
    const cart = getCart()
    const idx = cart.findIndex(i => i._id === product._id)
    if (idx > -1) { 
        cart[idx].qty = (cart[idx].qty || 1) + 1 
    } else { 
        cart.push({ 
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1 
        }) 
    }
    saveCart(cart)
    showToast(`"${product.name}" added to cart ✓`, "success")
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i._id !== id))
}

function updateCartQty(id, delta) {
    const cart = getCart()
    const idx = cart.findIndex(i => i._id === id)
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

// ── Validation ──
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone)
const validatePincode = (pincode) => /^[1-9][0-9]{5}$/.test(pincode)

// ── UI Helpers ──
function updateCartCount() {
    const el = document.getElementById("cart-count")
    const el2 = document.getElementById("cart-count2")
    const n = getCartCount()
    if (el) { 
        el.textContent = n
        el.style.display = n ? "flex" : "none" 
    }
    if (el2) {
        el2.textContent = n
        el2.parentElement.style.display = n ? "flex" : "none"
    }
}

function showToast(msg, type = "success") {
    let t = document.getElementById("toast")
    if (!t) { 
        t = document.createElement("div")
        t.id = "toast"
        document.body.appendChild(t) 
    }
    t.textContent = msg
    t.className = `show ${type}`
    clearTimeout(t._timer)
    t._timer = setTimeout(() => { t.classList.remove("show") }, 3000)
}

function showAlert(id, msg, type = "error") {
    const el = document.getElementById(id)
    if (!el) return
    el.textContent = msg
    el.className = `alert alert-${type} show`
    setTimeout(() => el.classList.remove("show"), 4000)
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId)
    if (!btn) return
    btn.disabled = loading
    btn.dataset.orig = btn.dataset.orig || btn.innerHTML
    btn.innerHTML = loading ? `<div class="spinner-sm"></div>` : btn.dataset.orig
}

function formatPrice(n) { 
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(n) 
}

function productImg(p) {
    if (p.image && p.image.startsWith("http")) return p.image
    const seed = p._id || p.name || "product"
    return `https://picsum.photos/seed/${seed}/400/300`
}

function navbar(active = "") {
    const user = getUser()
    const isAdmin = user && user.role === "admin"
    return `
    <nav class="navbar">
        <div class="container navbar-container">
            <a href="index.html" class="navbar-brand">⚡ ShopVibe</a>
            
            <ul class="navbar-links">
                <li><a href="index.html" class="${active === "home" ? "active" : ""}" >Home</a></li>
                ${user ? `
                    <li><a href="account.html" class="${active === "account" ? "active" : ""}">Account</a></li>
                    <li><a href="orders.html" class="${active === "orders" ? "active" : ""}">Orders</a></li>
                    ${isAdmin ? `<li><a href="admin.html" class="${active === "admin" ? "active" : ""}">Admin</a></li>` : ''}
                ` : ''}
                <li class="cart-li">
                    <a href="cart.html" class="${active === "cart" ? "active" : ""} cart-link">
                        🛒 <span class="hide-mobile">Cart</span>
                        <span id="cart-count" class="cart-count" style="display:none">0</span>
                    </a>
                </li>
                ${user
                    ? `<li><a href="#" onclick="logout()">Logout</a></li>`
                    : `<li><a href="login.html" class="${active === "login" ? "active" : ""}">Login</a></li>
                       <li><a href="register.html" class="btn btn-primary btn-sm">Sign Up</a></li>`
                }
            </ul>
        </div>
    </nav>`
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showToast("Logged out successfully", "success")
    setTimeout(() => window.location.href = "index.html", 800)
}

function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Run on every page
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount()
    initChatbot()
})

// ── Chatbot Widget ──
function initChatbot() {
    // Check if chatbot already exists to prevent duplicate
    if (document.getElementById("chatbot-widget")) return

    const html = `
    <div id="chatbot-widget" style="position:fixed;bottom:20px;right:20px;z-index:9999;">
        <button id="chatbot-toggle" style="width:60px;height:60px;border-radius:50%;background:var(--primary);color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transition:0.3s;">
            💬
        </button>
        <div id="chatbot-window" style="display:none;position:absolute;bottom:80px;right:0;width:320px;height:450px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:0 10px 25px rgba(0,0,0,0.5);flex-direction:column;overflow:hidden;">
            <div style="background:var(--primary);color:#fff;padding:1rem;font-weight:600;display:flex;justify-content:space-between;">
                <span>ShopVibe Assistant</span>
                <button id="chatbot-close" style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;">✕</button>
            </div>
            <div id="chatbot-messages" style="flex:1;padding:1rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;font-size:0.9rem;">
                <div style="align-self:flex-start;background:rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:1rem;max-width:80%;">
                    Hi there! 👋 I'm the ShopVibe AI. How can I help you today?
                </div>
            </div>
            <form id="chatbot-form" style="display:flex;border-top:1px solid var(--border);padding:0.5rem;">
                <input id="chatbot-input" type="text" placeholder="Type a message..." style="flex:1;background:transparent;border:none;padding:0.5rem;color:var(--text-primary);outline:none;" required />
                <button type="submit" style="background:var(--primary);color:#fff;border:none;padding:0.5rem 1rem;border-radius:var(--radius-sm);cursor:pointer;">Send</button>
            </form>
        </div>
    </div>`
    document.body.insertAdjacentHTML('beforeend', html)

    let sessionId = localStorage.getItem('chatSession')
    if (!sessionId) {
        sessionId = Date.now().toString()
        localStorage.setItem('chatSession', sessionId)
    }

    const toggle = document.getElementById('chatbot-toggle')
    const win = document.getElementById('chatbot-window')
    const close = document.getElementById('chatbot-close')
    const form = document.getElementById('chatbot-form')
    const input = document.getElementById('chatbot-input')
    const msgs = document.getElementById('chatbot-messages')

    if (toggle && win && close && form && input && msgs) {
        toggle.addEventListener('click', () => win.style.display = win.style.display === 'none' || win.style.display === '' ? 'flex' : 'none')
        close.addEventListener('click', () => win.style.display = 'none')

        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            const text = input.value.trim()
            if (!text) return
            
            // Add user msg
            msgs.innerHTML += `<div style="align-self:flex-end;background:var(--primary);color:#fff;padding:0.75rem 1rem;border-radius:1rem;max-width:80%;">${text}</div>`
            input.value = ''
            msgs.scrollTop = msgs.scrollHeight

            try {
                const res = await fetch(`${API}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text, sessionId })
                })
                const data = await res.json()
                
                // Add bot msg
                msgs.innerHTML += `<div style="align-self:flex-start;background:rgba(255,255,255,0.05);padding:0.75rem 1rem;border-radius:1rem;max-width:80%;">${data.reply}</div>`
                msgs.scrollTop = msgs.scrollHeight
            } catch (err) {
                msgs.innerHTML += `<div style="align-self:flex-start;background:var(--error);color:#fff;padding:0.75rem 1rem;border-radius:1rem;max-width:80%;">Network error connecting to AI.</div>`
            }
        })
    }
}
