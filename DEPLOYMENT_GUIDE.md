# Z-Electronics: Production Deployment & Database Setup Guide

Complete step-by-step instructions to deploy **Z-Electronics** and your **Admin Portal** to production with a real PostgreSQL database on Supabase and hosting on Vercel.

---

## 🗄️ Step 1: Database Setup on Supabase (Free & Instant)

1. Go to **[https://supabase.com](https://supabase.com)** and sign in or create a free account.
2. Click **"New Project"** and give it a name (e.g., `z-electronics`).
3. Set a secure database password and choose your nearest region (e.g., *Mumbai / Singapore / US*).
4. Once your project is ready, click **SQL Editor** from the left navigation bar.
5. Click **"New query"** and copy-paste the entire contents of **[`DATABASE_SCHEMA.sql`](./DATABASE_SCHEMA.sql)** into the editor.
6. Click the green **"Run"** button.
   - ✅ This creates all tables: `components`, `orders`, `order_items`.
   - ✅ Sets up Row Level Security (RLS) policies for secure public customer access and admin operations.
   - ✅ Configures automatic stock decrement triggers when orders are placed.
   - ✅ Pre-seeds electronic components catalog with pricing (in ₹) and live stock counts.
   - ✅ Pre-seeds completed legacy projects and achievements.
7. Go to **Project Settings** (gear icon at bottom-left) -> **API**.
8. Copy your two keys:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API anon public key** (starts with `eyJhbGci...`)

---

## 🚀 Step 2: Deploy to Vercel (Recommended 1-Click Hosting)

1. Push this project to your GitHub repository (already pushed to: `https://github.com/psujith9087-web/Z-Electronics`).
2. Go to **[https://vercel.com](https://vercel.com)** and log in with GitHub.
3. Click **"Add New..."** -> **"Project"**.
4. Select your repository: **`psujith9087-web/Z-Electronics`** and click **Import**.
5. Under **"Environment Variables"**, add the following 5 variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Your Supabase public anon key |
| `ADMIN_EMAIL` | `psujith9087@gmail.com` | Your Admin Email |
| `ADMIN_PASSWORD` | `Xxxsuji@123` | Your Admin Password |
| `AUTH_SECRET` | `z-electronics-super-secure-production-secret-key-2026` | Cryptographic session salt |

6. Click **"Deploy"**.
7. In ~60 seconds, your site will be live with a free custom SSL domain:  
   👉 `https://z-electronics-yourname.vercel.app` (or your custom domain like `z-electronics.com`).

---

## 🔐 Step 3: Log In to the Admin Portal

1. Navigate to: **`https://your-domain.com/admin`**
2. Enter your admin credentials:
   - **Email**: `psujith9087@gmail.com`
   - **Password**: `Xxxsuji@123`
3. Click **"Log In to Dashboard"**.
4. You now have full control over:
   - 📦 **Inventory Management**: Add components with custom photos, edit pricing, update stock counts, delete items.
   - 🛍️ **Customer Orders**: View real-time incoming orders, update status (Pending -> Completed), print/generate customer invoices, or reset past orders.
   - 🏆 **Legacy & Projects**: Upload completed project photographs directly from files with descriptions and client tags to showcase Z-Electronics achievements.
   - 📱 **Payment QR**: Upload your personal UPI QR code and set your VPA ID (`8072726924@upi`) so customers see it automatically at checkout.

---

## 💻 Alternative: Self-Hosting or VPS (Ubuntu / Docker / Node.js)

If deploying to your own Ubuntu VPS or DigitalOcean / AWS EC2:

```bash
# 1. Clone repository
git clone https://github.com/psujith9087-web/Z-Electronics.git
cd Z-Electronics

# 2. Install production dependencies
npm install

# 3. Create production environment file
cp .env.example .env.local
# Edit .env.local with your Supabase keys and credentials

# 4. Build optimized Next.js app
npm run build

# 5. Start production server (with PM2 or systemd)
npm install -g pm2
pm2 start npm --name "z-electronics" -- run start -- -p 3000
```

---

## 📁 Summary of Key Admin Files

- `app/admin/page.tsx` — Main Admin Dashboard server component with security verification and metric cards.
- `app/admin/layout.tsx` — Admin layout with authentication protection and top navigation bar.
- `app/admin/login/page.tsx` — Secure Admin login page.
- `app/admin/components-client.tsx` — Inventory management client (Add/Edit/Delete components & upload photos).
- `app/admin/orders-client.tsx` — Customer order tracking & fulfillment workflow.
- `app/admin/projects-manager.tsx` — Legacy showcase & completed projects photo uploader.
- `app/admin/payment-qr-manager.tsx` — UPI QR Code upload and configuration manager.
- `lib/actions/admin-auth.ts` — HMAC-SHA256 session token issuing and timing-safe admin authentication.
- `DATABASE_SCHEMA.sql` — PostgreSQL database schema and seed data.
