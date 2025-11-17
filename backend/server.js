require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check (optional)
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

// Contact route
app.post("/api/contact", async (req, res) => {
    const { name, email, whatsapp, message } = req.body;

    if (!name || !email || !whatsapp) {
        return res.status(400).json({ msg: "Please fill all required fields!" });
    }

    try {
        // transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 📌 Mail to ADMIN
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "📩 New AFNUZ Inquiry",
            html: `
                <h2>New Inquiry Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Whatsapp:</strong> ${whatsapp}</p>
                <p><strong>Message:</strong> ${message || "No message"}</p>
            `
        });

        // 📌 Auto-Thank-You mail to USER
        await transporter.sendMail({
            from: '"Afnuz Academy" <no-reply@afnuzacademy.com>',
            to: email,
            subject: "🎉 Thank you for contacting Afnuz Academy",
            html: `
                <h2>Thank you ${name}! 👋</h2>
                <p>We received your inquiry. Our team will contact you soon on WhatsApp.</p>
                <p>Regards,<br>Afnuz Academy Team</p>
            `
        });

        res.json({ msg: "Sent!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Email sending failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
