require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ==== CORS (Frontend Allowed) ====
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://afnuz-academy.vercel.app",
    "https://www.afnuz-academy.vercel.app"
  ],
  methods: ["GET", "POST"],
}));

// ==== Body Parser (Timeout Fix) ====
app.use(express.json({ limit: "1mb" }));

// ==== Health Route (Frontend Test) ====
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running" });
});

// ==== Root Route ====
app.get("/", (req, res) => {
  res.send("Afnuz Academy Backend Running ✔");
});

// ==== Nodemailer SMTP Config ====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==== Contact API ====
app.post("/api/contact", async (req, res) => {
  const { name, email, whatsapp, message } = req.body;

  if (!name || !email || !whatsapp) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  try {
    // Email to Admin
    await transporter.sendMail({
      from: `"Afnuz Academy" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 New Inquiry from ${name}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp}</p>
        <p><b>Message:</b> ${message || "No message added"}</p>
      `,
    });

    // Auto reply to User
    await transporter.sendMail({
      from: `"Afnuz Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting Afnuz Academy 🎓",
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for contacting Afnuz Academy.</p>
        <p>Our team will connect with you soon on WhatsApp 📱</p>
        <p>Regards,<br><b>Afnuz Academy Team</b></p>
      `,
    });

    return res.json({ msg: "Sent!" });

  } catch (error) {
    console.log("Email sending error ❌:", error);
    return res.status(500).json({ msg: "Server error! Mail not sent." });
  }
});

// ==== Server Listener (Render Compatible) ====
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Afnuz Academy Backend running on port ${PORT}`);
});
