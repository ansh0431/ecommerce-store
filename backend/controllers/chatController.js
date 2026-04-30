// In-memory chat history mapping session to messages
const chatHistory = new Map()

const handleChat = async (req, res, next) => {
    try {
        const { message, sessionId } = req.body
        if (!message) return res.status(400).json({ reply: "Please send a message." })

        const id = sessionId || Date.now().toString()
        const history = chatHistory.get(id) || []
        history.push({ role: "user", content: message })

        let reply = "I am an AI assistant for ShopVibe. How can I help you today?"
        const lowerMsg = message.toLowerCase()

        if (lowerMsg.includes("shipping") || lowerMsg.includes("delivery")) {
            reply = "We offer free delivery on all orders! Shipping usually takes 3-5 business days."
        } else if (lowerMsg.includes("return") || lowerMsg.includes("refund")) {
            reply = "You can return products within 30 days of delivery. Just visit your account page."
        } else if (lowerMsg.includes("recommend") || lowerMsg.includes("suggest")) {
            reply = "I recommend checking out our latest electronics and fashion items on the home page!"
        } else if (lowerMsg.includes("track") || lowerMsg.includes("order")) {
            reply = "You can track your order status by going to the 'Orders' page from the navigation bar."
        } else if (lowerMsg.includes("contact") || lowerMsg.includes("support")) {
            reply = "You can contact support at support@shopvibe.com or call 1800-123-456."
        } else if (lowerMsg.includes("skincare")) {
            reply = "We have an amazing range of skincare products! Check out our new serums, moisturizers, and face washes."
        } else if (lowerMsg.includes("sunscreen")) {
            reply = "Our best-selling sunscreen is the 'Glow & Protect SPF 50'. It's lightweight and leaves no white cast!"
        } else if (lowerMsg.includes("dry skin")) {
            reply = "For dry skin, I recommend products with Hyaluronic Acid and Ceramides. Look for our 'Deep Moisture Cream'."
        } else {
            reply = "I'm still learning! Could you please clarify your question about products, orders, or shipping?"
        }

        history.push({ role: "assistant", content: reply })
        chatHistory.set(id, history)

        res.json({ reply, sessionId: id })
    } catch (error) {
        next(error)
    }
}

module.exports = { handleChat }
