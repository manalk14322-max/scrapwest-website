const fs = require("node:fs");
const { formidable } = require("formidable");
const nodemailer = require("nodemailer");

exports.config = {
  api: {
    bodyParser: false
  }
};

function cleanText(value, max = 300) {
  const first = Array.isArray(value) ? value[0] : value;
  return String(first || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function setCors(req, res) {
  const allowed = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = req.headers.origin;

  if (!origin || allowed.length === 0 || allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseForm(req) {
  const form = formidable({
    multiples: false,
    maxFiles: 1,
    maxFileSize: 6 * 1024 * 1024,
    filter(part) {
      return !part.mimetype || part.mimetype.startsWith("image/");
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ fields, files });
    });
  });
}

function getUploadedImage(files) {
  const image = Array.isArray(files.image) ? files.image[0] : files.image;
  if (!image || !image.filepath) return null;
  return {
    filepath: image.filepath,
    originalName: image.originalFilename || "scrap-image",
    mimetype: image.mimetype || "application/octet-stream",
    size: image.size || 0
  };
}

function makeWhatsAppLink(lead) {
  const number = process.env.WHATSAPP_NUMBER || "971523181007";
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

async function sendLeadEmail(lead) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_EMAIL_TO) {
    return { skipped: true };
  }

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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const attachments = lead.image && fs.existsSync(lead.image.filepath)
    ? [{
      filename: lead.image.originalName,
      path: lead.image.filepath,
      contentType: lead.image.mimetype
    }]
    : [];

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "ScrapWest Website <noreply@scrapwest.ae>",
    to: process.env.LEAD_EMAIL_TO,
    subject: `New ScrapWest quote lead - ${lead.scrapType} in ${lead.location}`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: `<h2>New ScrapWest Quote Lead</h2><table style="border-collapse:collapse">${htmlRows}</table>`,
    attachments
  });

  return { sent: true };
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const { fields, files } = await parseForm(req);
    const image = getUploadedImage(files);
    const lead = {
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: cleanText(fields.name, 120),
      phone: cleanText(fields.phone, 60),
      location: cleanText(fields.location, 160),
      scrapType: cleanText(fields["scrap-type"] || fields.scrapType, 160),
      message: cleanText(fields.message, 600),
      pageUrl: cleanText(fields.pageUrl, 500),
      image
    };

    if (!lead.phone || !lead.location || !lead.scrapType) {
      res.status(400).json({
        ok: false,
        message: "Phone, location and scrap type are required."
      });
      return;
    }

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
};
