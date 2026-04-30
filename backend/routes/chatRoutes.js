const Product = require("../models/Product");
const Order = require("../models/Order");

const express = require("express");
const router = express.Router();
const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Define the tools (What the AI is allowed to ask the backend to do)
const ecommerceTools = [{
    functionDeclarations: [
        {
            name: "searchProducts",
            description: "Search the database for products by name or category.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    query: {
                        type: Type.STRING,
                        description: "The search term (e.g., 'laptop', 'shoes', 'red shirt')"
                    }
                },
                required: ["query"]
            }
        },
        {
            name: "checkOrderStatus",
            description: "Check the status of a user's order.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    orderId: {
                        type: Type.STRING,
                        description: "The order ID provided by the user"
                    }
                },
                required: ["orderId"]
            }
        }
    ]
}];

// 2. The Chat Route
router.post("/", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Initialize a chat session with system instructions and our tools
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: `You are the ShopVibe AI Assistant. 
                
                1. PRODUCT RECOMMENDATIONS: 
                If the user wants to buy something, use 'searchProducts'. 
                When you reply with products, ALWAYS format EACH product using this exact HTML template so it renders beautifully in the chat:
                <div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.1); border: 1px solid var(--border); border-radius:8px;">
                    <img src="[PRODUCT_IMAGE]" alt="[PRODUCT_NAME]" style="width:100%; border-radius:8px; margin-bottom:8px;">
                    <strong style="display:block; font-size:1.1em; color:var(--text-primary);">[PRODUCT_NAME]</strong>
                    <span style="color:var(--primary); font-weight:bold; font-size:1.2em;">₹[PRICE]</span>
                    <p style="margin:5px 0; font-size:0.9em; line-height:1.4;">[DESCRIPTION]</p>
                    <a href="product.html?id=[PRODUCT_ID]" style="display:inline-block; margin-top:5px; padding:6px 12px; background:var(--primary); color:#fff; text-decoration:none; border-radius:4px; font-size:0.9em; font-weight:bold;">View Item</a>
                </div>

                2. ORDER TRACKING:
                If the user asks about an order, ask for their order ID and use 'checkOrderStatus'. Tell them their status and total amount clearly.

                3. POLICIES:
                - Returns: Items can be returned within 30 days of delivery.
                - Checkout: Tell users to click the Cart icon and hit 'Proceed to Checkout'.`,
                tools: ecommerceTools,
            }
        });

        // Send the user's message to Gemini
        let response = await chat.sendMessage({ message: userMessage });

        // 3. Check if Gemini wants to use a Tool
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            let dbResults = {};

            // Execute the correct backend logic based on what the AI asked for
            if (call.name === "searchProducts") {
                const searchTerm = call.args.query;
                try {
                    // Fetch exactly what the AI needs to build the HTML cards
                    const products = await Product.find({
                        name: { $regex: searchTerm, $options: "i" }
                    })
                        .select('_id name price description image')
                        .limit(2); // Limit to 2 so the chat window doesn't get too crowded

                    dbResults = { results: products };
                } catch (err) {
                    console.error("Database search error:", err);
                    dbResults = { error: "Could not fetch products at this time." };
                }
            }
            else if (call.name === "checkOrderStatus") {
                const id = call.args.orderId;

                try {
                    // Search MongoDB for the specific order by its exact ID
                    const order = await Order.findById(id);

                    if (order) {
                        dbResults = {
                            status: order.status, // Assuming your schema has a 'status' field (e.g., 'Processing', 'Shipped')
                            totalAmount: order.totalPrice
                        };
                    } else {
                        dbResults = { error: "No order found with that ID." };
                    }
                } catch (err) {
                    console.error("Database order error:", err);
                    dbResults = { error: "Invalid Order ID format or database error." };
                }
            }

            // 4. Send the MongoDB results back to Gemini so it can generate a final answer
            response = await chat.sendMessage({
                message: [{
                    functionResponse: {
                        name: call.name,
                        response: dbResults
                    }
                }]
            });
        }

        // 5. Send the final natural language text back to your frontend UI
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({ error: "Failed to process chat message" });
    }
});

module.exports = router;