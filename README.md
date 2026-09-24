# nanoapps.in

A SaaS platform where anyone can register, purchase software or subscriptions, and access or download products from a single dashboard.

## Overview

nanoapps.in is a marketplace for small, focused software tools and utilities. Users can browse web tools and desktop software, purchase them via one-time payment or subscription, and manage everything — purchases, downloads, and billing — from a single dashboard.

## User Roles

- **Guest** — Browse products and pricing.
- **Customer** — Register, use tools, purchase products, and manage downloads.
- **Admin** — Manage users, products, subscriptions, and payments.

## Core Features

- User registration, login, and email verification
- Product catalog (web tools and desktop software)
- Secure payments and subscriptions via Razorpay
- User dashboard with purchase and billing history
- Admin panel for managing users, products, and orders

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, React Router
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT + email verification
- **Payments:** Razorpay
- **Deployment:** Vercel (frontend), Render (backend), Cloudflare (DNS/CDN)

## Project Structure

nanoapps/
├── frontend/ # React + TypeScript + Tailwind app
├── backend/ # Express + TypeScript API
└── README.md


## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Both `frontend` and `backend` require their own `.env` files (not committed to git). See `.env.example` in each folder for required variables.

## License

Private project — all rights reserved.