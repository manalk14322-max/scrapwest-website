module.exports = function handler(_req, res) {
  res.status(200).json({
    ok: true,
    service: "scrapwest-vercel-api",
    site: process.env.PUBLIC_SITE_URL || "https://scrapwest.ae"
  });
};
