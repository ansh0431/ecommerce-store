// Auto-detect environment to fix ERR_CONNECTION_REFUSED
const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API = isLocalhost ? "http://localhost:5000" : "https://ecommerce-store-ju5z.onrender.com";

// ── Auth ──
const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
const isLoggedIn = () => !!getToken();

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) { window.location.href = "login.html"; return {}; }
    return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
};

// ── Cart ──
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const saveCart = (cart) => { localStorage.setItem("cart", JSON.stringify(cart)); updateCartCount(); };

function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(i => i._id === product._id);
    if (idx > -1) { cart[idx].qty = (cart[idx].qty || 1) + 1; }
    else { cart.push({ _id: product._id, name: product.name, price: product.price, image: product.image, qty: 1 }); }
    saveCart(cart);
    showToast(`"${product.name}" added to cart ✓`, "success");
}

function removeFromCart(id) { saveCart(getCart().filter(i => i._id !== id)); }

function updateCartQty(id, delta) {
    const cart = getCart();
    const idx = cart.findIndex(i => i._id === id);
    if (idx === -1) return;
    cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
    saveCart(cart);
}

function getCartTotal() { return getCart().reduce((sum, i) => sum + i.price * (i.qty || 1), 0); }
function getCartCount() { return getCart().reduce((sum, i) => sum + (i.qty || 1), 0); }

// ── Validation ──
const validatePhone = (p) => /^[6-9]\d{9}$/.test(p);
const validatePincode = (p) => /^[1-9][0-9]{5}$/.test(p);

// ── UI Helpers ──
function updateCartCount() {
    const el = document.getElementById("cart-count");
    const n = getCartCount();
    if (el) { el.textContent = n; el.style.display = n ? "flex" : "none"; }
}

function showToast(msg, type = "success") {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = `show ${type}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 3000);
}

function showAlert(id, msg, type = "error") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `alert alert-${type} show`;
    el.style.display = "block";
    setTimeout(() => { el.classList.remove("show"); el.style.display = "none"; }, 4000);
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.orig = btn.dataset.orig || btn.innerHTML;
    btn.innerHTML = loading ? `<div class="spinner-sm"></div>` : btn.dataset.orig;
}

function formatPrice(n) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function productImg(p) {
    if (p.image && p.image.startsWith("http")) return p.image;
    return `https://picsum.photos/seed/${p._id || p.name || "product"}/400/300`;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Logged out successfully", "success");
    setTimeout(() => window.location.href = "index.html", 800);
}

// ── Navbar (Flipkart style) ──
function navbar(active = "") {
    const user = getUser();
    const isAdmin = user && user.role === "admin";
    return `
    <nav class="navbar">
        <div class="navbar-inner">
            <a href="index.html" class="navbar-brand">⚡ ShopVibe</a>
            <div class="navbar-search">
                <span class="nav-search-icon">🔍</span>
                <input type="text" id="nav-search" placeholder="Search for products, brands and more" onkeydown="if(event.key==='Enter'){window.location.href='index.html?q='+encodeURIComponent(this.value)}" />
            </div>
            <ul class="navbar-links">
                ${user ? `
                    <li><a href="account.html" class="${active === "account" ? "active" : ""}">👤 Account</a></li>
                    <li><a href="orders.html" class="${active === "orders" ? "active" : ""}">📦 Orders</a></li>
                    ${isAdmin ? `<li><a href="admin.html" class="${active === "admin" ? "active" : ""}">⚙ Admin</a></li>` : ""}
                    <li><a href="#" onclick="logout()">Logout</a></li>
                ` : `
                    <li><a href="login.html" class="${active === "login" ? "active" : ""}">Login</a></li>
                    <li><a href="register.html" class="nav-signup">Sign Up</a></li>
                `}
                <li class="cart-li">
                    <a href="cart.html" class="cart-link ${active === "cart" ? "active" : ""}">
                        🛒 Cart
                        <span id="cart-count" class="cart-count" style="display:none">0</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>`;
}

// ── Chatbot Widget ──
function initChatbot() {
    if (document.getElementById("chatbot-widget")) return;
    document.body.insertAdjacentHTML("beforeend", `
    <div id="chatbot-widget" style="position:fixed;bottom:24px;right:24px;z-index:9999;">
        <button id="chatbot-toggle" title="ShopVibe AI Assistant"
            style="width:56px;height:56px;border-radius:50%;background:#2874f0;color:#fff;border:none;font-size:22px;cursor:pointer;box-shadow:0 4px 16px rgba(40,116,240,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;">
            💬
        </button>
        <div id="chatbot-window" style="display:none;position:absolute;bottom:72px;right:0;width:320px;height:440px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);flex-direction:column;overflow:hidden;border:1px solid #e0e0e0;">
            <div style="background:#2874f0;color:#fff;padding:1rem;font-weight:600;display:flex;justify-content:space-between;align-items:center;">
                <span>🛍 ShopVibe Assistant</span>
                <button id="chatbot-close" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;line-height:1;">✕</button>
            </div>
            <div id="chatbot-messages" style="flex:1;padding:1rem;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;font-size:0.875rem;color:#333;background:#f8f9fa;">
                <div style="align-self:flex-start;background:#fff;padding:0.6rem 0.9rem;border-radius:12px;max-width:85%;box-shadow:0 1px 3px rgba(0,0,0,.08);">
                    Hi! 👋 I'm the ShopVibe AI. How can I help you today?
                </div>
            </div>
            <form id="chatbot-form" style="display:flex;border-top:1px solid #eee;padding:0.5rem;background:#fff;gap:0.5rem;">
                <input id="chatbot-input" type="text" placeholder="Ask me anything…"
                    style="flex:1;border:1px solid #ddd;border-radius:8px;padding:0.5rem 0.75rem;outline:none;font-size:0.875rem;color:#333;" required />
                <button type="submit"
                    style="background:#fb641b;color:#fff;border:none;padding:0.5rem 0.9rem;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.875rem;">Send</button>
            </form>
        </div>
    </div>`);

    const toggle = document.getElementById("chatbot-toggle");
    const win = document.getElementById("chatbot-window");
    const close = document.getElementById("chatbot-close");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const msgs = document.getElementById("chatbot-messages");

    toggle.onclick = () => { const open = win.style.display === "flex"; win.style.display = open ? "none" : "flex"; };
    close.onclick = () => win.style.display = "none";
    toggle.onmouseenter = () => toggle.style.transform = "scale(1.1)";
    toggle.onmouseleave = () => toggle.style.transform = "scale(1)";

    form.onsubmit = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        msgs.innerHTML += `<div style="align-self:flex-end;background:#2874f0;color:#fff;padding:0.6rem 0.9rem;border-radius:12px;max-width:85%;">${text}</div>`;
        input.value = "";
        msgs.scrollTop = msgs.scrollHeight;
        try {
            const res = await fetch(`${API}/api/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, sessionId: localStorage.getItem("chatSession") || "default" })
            });
            const data = await res.json();
            msgs.innerHTML += `<div style="align-self:flex-start;background:#fff;padding:0.6rem 0.9rem;border-radius:12px;max-width:85%;box-shadow:0 1px 3px rgba(0,0,0,.08);">${data.reply || data.error || "Sorry, I could not respond."}</div>`;
        } catch {
            msgs.innerHTML += `<div style="align-self:flex-start;background:#fff0f0;color:#c00;padding:0.6rem 0.9rem;border-radius:12px;max-width:85%;">Network error. Please try again.</div>`;
        }
        msgs.scrollTop = msgs.scrollHeight;
    };
}

// ── Initialization ──
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initChatbot();
    if (!localStorage.getItem("chatSession")) {
        localStorage.setItem("chatSession", Date.now().toString());
    }
});