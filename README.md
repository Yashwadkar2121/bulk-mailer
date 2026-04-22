# ✦ BulkMailer — Vite + React + Tailwind + Framer Motion

## Tech Stack
- **Frontend**: Vite + React 18 + Tailwind CSS v3 + Framer Motion v10
- **Backend**: Express.js + MongoDB + Nodemailer
- **Auth**: JWT
- **Email**: Nodemailer (any SMTP)

## Quick Start

```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Open: http://localhost:3000

## Project Structure
```
bulk-mailer/
├── server/               ← Express + MongoDB (unchanged)
│   ├── models/           ← User.js, Campaign.js
│   ├── routes/           ← auth.js, email.js, campaign.js
│   └── index.js
│
└── client/               ← Vite + React
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx      ← Sidebar with Framer Motion nav
    │   │   └── PageLoader.jsx  ← Animated loader
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx        ← Campaign list
    │   │   ├── NewCampaign.jsx      ← 3-step animated wizard
    │   │   ├── CampaignDetail.jsx   ← Live send tracking
    │   │   └── Settings.jsx         ← SMTP config
    │   ├── context/AuthContext.jsx
    │   └── utils/api.js
    └── index.html
```
