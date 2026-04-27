const nodemailer = require("nodemailer")

const sendEmail = async (options) => {
    // Basic config (for testing, you would normally use environment variables)
    // Here we use a fake Ethereal account if no actual host is provided,
    // or you can configure Gmail / SendGrid / etc. in .env
    
    // Fallback simple mock transporter if variables aren't set
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_EMAIL || "example@ethereal.email",
            pass: process.env.SMTP_PASSWORD || "password123",
        },
    })

    const message = {
        from: `${process.env.FROM_NAME || "ShopVibe"} <${process.env.FROM_EMAIL || "noreply@shopvibe.com"}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    }

    try {
        await transporter.sendMail(message)
        console.log(`Email sent to ${options.email}`)
    } catch (error) {
        console.error("Error sending email:", error)
        // We don't throw error to prevent order creation from failing
    }
}

module.exports = sendEmail
