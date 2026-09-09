# ⚡ Z-Electronics — Electronics Component Supply Web App

A full-stack e-commerce web application and inventory management portal built specifically for **Z-Electronics**, supplied and managed by **Sujith** (+91 8072726924).

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Live Component Catalog:** Real-time search, categorization (Microcontrollers, Sensors, Modules, Passives, Motors), and price sorting.
- **Interactive Cart:** Quantity controls, persistent cart badge, and dynamic price totals in Indian Rupees (₹).
- **Direct Checkout & Visual Bill / Invoice:**
  - Instant order placement without requiring customer account creation.
  - Automatic inventory stock decrement trigger in Supabase PostgreSQL.
  - On-screen itemized official Bill / Invoice with **Print PDF** and **WhatsApp Sujith** sharing buttons.
- **5-Star Customer Reviews System:** Customers can leave ratings which are stored in the database. Verified reviews are publicly displayed.
- **Mr. Z AI Assistant:** Integrated Gemini-powered AI agent to answer technical hardware queries, provide code snippets, and guide users directly on the storefront.
- **Direct Contact & Community Integration:**
  - Floating WhatsApp button and banner linking directly to the official **WhatsApp Community**:
    `https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM`
  - Direct telephone links to call owner **Sujith** at `8072726924`.

### 🛡️ Secure Admin Portal (`/admin`)
- **Protected Access:**
  - Quick Autofill button or login with **`admin@z-electronics.com`** and password **`admin123`**.
  - Direct support for Supabase Auth accounts.
- **Inventory Management:** Add new electronic components, edit stock levels/prices/descriptions, or remove components.
- **Live Order Management:** Real-time customer order tracking with status toggles (`Pending` ↔ `Completed`), itemized component breakdown dialog, and quick **Call** or **WhatsApp** customer action buttons.
- **Reviews & AI Management:** Moderation dashboard to Verify/Delete customer reviews and configure the Mr. Z AI agent.

---

## 🧑‍💻 Repository Architecture (Neat & Clean Fullstack)

This repository is structured as a modern **Next.js App Router** application, natively unifying Frontend, Backend, and Database clients into a single secure codebase:

- **🌐 Frontend (Client UI & Routes):** 
  - `app/` - Contains all page routes, layouts, and global styles (`app/globals.css`).
  - `components/` - Reusable React UI blocks (e.g., `components/ui/button.tsx`, `components/home/`, `components/ai/`).
- **⚙️ Backend (Server-Side Logic):** 
  - `lib/actions/` - Secure Next.js Server Actions (e.g., `ai-agent.ts`, `reviews.ts`, `orders.ts`) running exclusively on the backend.
  - `lib/security.ts` - Core security layer with JWT tokens, rate limiting, and XSS sanitization.
- **💾 Database (Supabase PostgreSQL):**
  - `DATABASE_SCHEMA.sql` - The complete database schema with tables, Row-Level Security (RLS) policies, and trigger functions.
  - `lib/supabase/` - The backend database client handlers to read/write from Supabase.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router, Server Actions)
- **Frontend & Styling:** Tailwind CSS, Shadcn UI, Lucide React, Sonner
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Triggers)
- **Deployment Ready:** Configured for Netlify (`netlify.toml`, `.node-version`)

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
The `.env.local` file is pre-configured with your live Supabase project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cuidsmnsmouudbgodtcj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aWRzbW5zbW91dWRiZ29kdGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjIxNDQsImV4cCI6MjEwNDE5ODE0NH0.kgecwVQPQdy3i5kHFp75reC4RJsmJZheJYxrzdBLTsA
ADMIN_PASSWORD=admin123
```

### 3. Database Schema (Supabase)
If deploying to a fresh Supabase project, execute `supabase/schema.sql` in the **Supabase SQL Editor**. It creates:
- `components` table (with RLS policies and seed inventory)
- `orders` table (with RLS policies and customer info)
- `order_items` table (with automatic stock decrement trigger)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the Storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Dashboard.

---

## 🌐 Deploying to Netlify

### Option 1: Git & GitHub (Recommended)
1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit for Z-Electronics"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/z-electronics.git
   git push -u origin main
   ```
2. Log in to [Netlify](https://app.netlify.com) and click **"Add new site"** ➜ **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will detect Next.js with `npm run build` and publish directory `.next`.
5. Under **Environment variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
6. Click **Deploy**!

### Option 2: Netlify CLI
```bash
npx netlify login
npx netlify init
npx netlify env:import .env.local
npx netlify deploy --build --prod
```

---

## 📞 Contact Information
- **Proprietor:** Sujith
- **Phone:** +91 8072726924
- **WhatsApp Group:** [Join Z-Electronics Community](https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM)

