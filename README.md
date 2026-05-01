# 🪐 Orbit Learning Platform

Production-ready learning platform built with React + Vite + Tailwind CSS.

## ✅ Features
- **6 public pages**: Home, Courses catalog, Course detail, Dashboard, Login, Signup
- **Admin panel**: Dashboard (revenue charts), Courses CRUD, Orders, Students, Analytics
- **Video player**: YouTube & Vimeo embedded via react-player
- **Payments**: Amazon Pay + Apple Pay + Card form
- **Certificates**: Orbit-branded PDF (jsPDF) — download or email to student
- **Email**: Certificate delivery via EmailJS
- **Mobile responsive**: Full mobile support with hamburger nav
- **Data persistence**: localStorage (swap to Supabase for production DB)

---

## 🚀 Deploy to Vercel (3 steps)

### Step 1 — Upload to GitHub
1. Create a new GitHub repo
2. Upload this entire folder (or `git push`)

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`

### Step 3 — Set Environment Variables
In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | From EmailJS dashboard |
| `VITE_EMAILJS_TEMPLATE_ID` | From EmailJS dashboard |
| `VITE_EMAILJS_PUBLIC_KEY` | From EmailJS dashboard |
| `VITE_AMAZON_PAY_MERCHANT_ID` | From Amazon Pay Seller Central |
| `VITE_AMAZON_PAY_STORE_ID` | From Amazon Pay Seller Central |
| `VITE_AMAZON_PAY_SANDBOX` | `false` (production) |
| `VITE_ADMIN_EMAIL` | Your admin email |
| `VITE_ADMIN_PASSWORD` | Strong password |
| `VITE_APP_URL` | Your Vercel domain |

Then **Redeploy**.

---

## 🧑‍💻 Local Development

```bash
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev
```

---

## 🔐 Admin Access
Default: `admin@orbit.com` / `OrbitAdmin2026!`  
Change via env vars before going live.

---

## 💳 Payment Setup

### Amazon Pay
1. Register at [pay.amazon.com](https://pay.amazon.com)
2. Create a store in Seller Central
3. Get Merchant ID and Store ID
4. For production: install `@amazonpay/amazon-pay-api-sdk-nodejs` in `/api/amazon-pay-session.js`

### Apple Pay
1. Register your domain at [developer.apple.com](https://developer.apple.com)
2. Download the domain verification file
3. Place it at `/public/.well-known/apple-developer-merchantid-domain-association`
4. Apple Pay will auto-show on Safari + iOS devices

### Card Payments
Currently simulated. To add real card processing:
- Integrate [Stripe](https://stripe.com) — replace card form with `@stripe/react-stripe-js`
- Or use [Tap Payments](https://www.tap.company) for Saudi Arabia

---

## 📧 EmailJS Setup
1. Sign up at [emailjs.com](https://emailjs.com) (free tier: 200 emails/month)
2. Create a service (Gmail/Outlook/SMTP)
3. Create a template with variables:
   - `{{to_name}}` `{{to_email}}` `{{course_name}}`
   - `{{completion_date}}` `{{certificate_id}}` `{{download_link}}`
4. Copy your Service ID, Template ID, and Public Key to env vars

---

## 🗄️ Data Persistence
Currently uses **localStorage** — perfect for demo and MVP.

To upgrade to a real database, swap the `AuthContext.jsx` and `CourseContext.jsx` fetch calls with:
- **Supabase** (recommended — free tier, easy setup)
- **Firebase Firestore**
- **PlanetScale** + Prisma

---

## 📁 Project Structure
```
orbit-learning/
├── api/                    # Vercel serverless functions
│   ├── send-certificate.js # Email API
│   └── amazon-pay-session.js
├── public/
│   └── .well-known/        # Apple Pay domain verification
├── src/
│   ├── components/         # Shared UI components
│   ├── context/            # Auth + Course state
│   ├── data/               # Seed data
│   ├── pages/
│   │   ├── admin/          # Admin panel pages
│   │   └── *.jsx           # Student-facing pages
│   ├── styles/globals.css
│   └── utils/              # Certificate PDF + email helpers
├── .env.example            # Environment variables template
├── vercel.json             # Vercel routing config
└── README.md
```
