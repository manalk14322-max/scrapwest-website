# ScrapWest UAE Website

Static corporate website for ScrapWest, focused on UAE scrap buying leads through phone calls, WhatsApp quotes, service pages and location SEO pages.

## Open Locally

Open `index.html` in a browser, or serve the folder with any static server.

## Backend

The lead backend is in `backend/`.

- `POST /api/quote` receives quote form leads and optional scrap images.
- Leads are saved in `backend/data/`.
- Uploaded images are saved in `backend/uploads/`.
- SMTP can email leads to `info@scrapwest.ae`.
- If the backend URL is not configured, the frontend form still opens WhatsApp as fallback.

Local backend setup:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

After deploying the backend, add this before `script.js` on pages with forms:

```html
<script>
  window.SCRAPWEST_API_URL = "https://your-backend-url.com";
</script>
```

## Main Pages

- Home: `index.html`
- Services: `services/index.html`
- About: `about-us/index.html`
- Contact: `contact/index.html`
- Complete Scrap Desk: `complete-scrap-desk/index.html`

## Notes

- Replace placeholder/dummy images in `assets/hero/` when final client media is ready.
- Update phone, email and WhatsApp number if the final business contact changes.
- `sitemap.xml` and `robots.txt` are included for SEO deployment.
- GitHub Pages can host the frontend, but backend needs Render, Railway, Vercel serverless or another Node hosting service.

## Recommended Professional Deployment

For a UAE/Dubai business website, use Vercel for the website and the included `/api/quote` serverless backend.

1. Import this GitHub repository into Vercel.
2. Add GoDaddy domain `scrapwest.ae` in Vercel project settings.
3. Add these environment variables in Vercel:

```txt
ALLOWED_ORIGINS=https://scrapwest.ae,https://www.scrapwest.ae,https://manalk14322-max.github.io
PUBLIC_SITE_URL=https://scrapwest.ae
WHATSAPP_NUMBER=971501988684
LEAD_EMAIL_TO=info@scrapwest.ae
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=ScrapWest Website <noreply@scrapwest.ae>
```

If SMTP is not configured, the form still opens WhatsApp. With SMTP configured, every quote request is emailed to ScrapWest.
