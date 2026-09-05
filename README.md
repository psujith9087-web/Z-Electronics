# Z-Electronics — E-Commerce Web App

A full-stack e-commerce platform for electronics components built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Postgres, Auth, Storage)
- Zustand (client state)
- Shadcn UI (Base UI)

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings > API

### 2. Run the Database Migration
1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql` and run it
3. This creates all tables, indexes, RLS policies, triggers, storage bucket, and seeds 20 sample products

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Install Dependencies & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Create an Admin User
1. Sign up via the app at `/login`
2. Go to your Supabase SQL Editor and run:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```
3. Log out and log back in. You'll see the Admin Dashboard link in the user menu.

### 6. Storage Bucket
The migration script auto-creates a `product-images` bucket. If you need to create it manually:
1. Go to Supabase Dashboard > Storage
2. Create a bucket named `product-images` with public access

## Project Structure
- `app/(store)/` — Customer-facing storefront pages
- `app/admin/` — Admin panel (protected)
- `components/` — Reusable UI and feature components
- `lib/actions/` — Server actions (data layer)
- `lib/supabase/` — Supabase client configuration
- `lib/store/` — Zustand stores
- `supabase/schema.sql` — Database migration

## Features
- Full product catalog with filters, sorting, pagination
- Category hierarchy with subcategories
- Cart with localStorage persistence
- Checkout with COD / Online payment
- Wishlist (requires login)
- Order tracking
- Admin panel: product/category/order management
- Dark/light theme
- Fully responsive
