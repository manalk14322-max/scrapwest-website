import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import nodemailer from "nodemailer";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "uploads");

const app = express();
const port = Number(process.env.PORT || 8080);
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

await fs.mkdir(dataDir, { recursive: true });
await fs.mkdir(uploadDir, { recursive: true });

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed"));
  }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false
}));

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename(_req, file, callback) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeName = file.originalname.replace(/[^\w.-]/g, "_").slice(-80);
      callback(null, `${stamp}-${safeName}`);
    }
  }),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }
    callback(null, true);
  }
});

function cleanText(value, max = 300) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function makeWhatsAppLink(lead) {
  const number = process.env.WHATSAPP_NUMBER || "971501988684";
  const message = [
    "Hi, I want to sell scrap. Please share your best price.",
    `Name: ${lead.name || "-"}`,
    `Phone: ${lead.phone}`,
    `Location: ${lead.location}`,
    `Scrap type: ${lead.scrapType}`,
    lead.message ? `Message: ${lead.message}` : "",
    lead.image ? `Image uploaded on website: ${lead.image.originalName}` : "No image uploaded"
  ].filter(Boolean).join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function buildLeadEmail(lead) {
  const rows = [
    ["Name", lead.name || "-"],
    ["Phone", lead.phone],
    ["Location", lead.location],
    ["Scrap type", lead.scrapType],
    ["Message", lead.message || "-"],
    ["Page", lead.pageUrl || "-"],
    ["Submitted", lead.createdAt],
    ["Image", lead.image ? lead.image.originalName : "No image uploaded"]
  ];

  const htmlRows = rows.map(([label, value]) => (
    `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700">${label}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${value}</td></tr>`
  )).join("");

  return {
    subject: `New ScrapWest quote lead - ${lead.scrapType} in ${lead.location}`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: `<h2>New ScrapWest Quote Lead</h2><table style="border-collapse:collapse">${htmlRows}</table>`
  };
}

async function sendLeadEmail(lead) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_EMAIL_TO) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const email = buildLeadEmail(lead);
  const attachments = lead.image ? [{
    filename: lead.image.originalName,
    path: lead.image.path
  }] : [];

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "ScrapWest Website <noreply@scrapwest.ae>",
    to: process.env.LEAD_EMAIL_TO,
    subject: email.subject,
    text: email.text,
    html: email.html,
    attachments
  });

  return { sent: true };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "scrapwest-backend",
    site: process.env.PUBLIC_SITE_URL || "https://scrapwest.ae"
  });
});

app.post("/api/quote", upload.single("image"), async (req, res) => {
  try {
    const lead = {
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: cleanText(req.body.name, 120),
      phone: cleanText(req.body.phone, 60),
      location: cleanText(req.body.location, 160),
      scrapType: cleanText(req.body["scrap-type"] || req.body.scrapType, 160),
      message: cleanText(req.body.message, 600),
      pageUrl: cleanText(req.body.pageUrl, 500),
      userAgent: cleanText(req.get("user-agent"), 500),
      ip: req.ip,
      image: req.file ? {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    };

    if (!lead.phone || !lead.location || !lead.scrapType) {
      res.status(400).json({
        ok: false,
        message: "Phone, location and scrap type are required."
      });
      return;
    }

    const leadFile = path.join(dataDir, `${lead.id}.json`);
    await fs.writeFile(leadFile, JSON.stringify(lead, null, 2), "utf8");
    const emailStatus = await sendLeadEmail(lead);

    res.status(201).json({
      ok: true,
      message: "Quote request received.",
      leadId: lead.id,
      email: emailStatus,
      whatsappUrl: makeWhatsAppLink(lead)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Unable to submit quote request right now."
    });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(400).json({
    ok: false,
    message: error.message || "Bad request"
  });
});

app.listen(port, () => {
  console.log(`ScrapWest backend running on port ${port}`);
});
