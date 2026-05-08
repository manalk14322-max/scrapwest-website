# ScrapWest Backend

Lightweight API for ScrapWest quote leads.

## Features

- `POST /api/quote` accepts name, phone, location, scrap type, message and one image upload.
- Saves every lead as JSON in `backend/data`.
- Saves uploaded images in `backend/uploads`.
- Sends email notification when SMTP variables are configured.
- Returns a ready WhatsApp URL so the frontend can keep the fast WhatsApp flow.
- Includes CORS, Helmet and rate limiting.

## Local Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Test:

```bash
curl http://localhost:8080/api/health
```

## Connect Frontend

After deploying the backend, set this before `script.js` on pages with forms:

```html
<script>
  window.SCRAPWEST_API_URL = "https://your-backend-url.com";
</script>
```

If this value is empty, the form will still work by opening WhatsApp directly.

## Deploy Recommendation

Use Render or Railway for the backend, and keep the static website on GitHub Pages or Vercel.

Important environment variables:

- `ALLOWED_ORIGINS=https://scrapwest.ae,https://www.scrapwest.ae,https://manalk14322-max.github.io`
- `WHATSAPP_NUMBER=971523181007`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `LEAD_EMAIL_TO=info@scrapwest.ae`

