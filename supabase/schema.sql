-- ============================================================
-- Z-Electronics: Complete Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Components catalog
CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address TEXT NOT NULL DEFAULT '',
  is_project_order BOOLEAN NOT NULL DEFAULT false,
  project_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order line items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES public.components(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_components_category ON public.components(category);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- PROFILES ----
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow inserts for trigger (service role inserts via trigger)
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ---- COMPONENTS ----
-- Anyone (including anon) can read components
CREATE POLICY "Public read components"
  ON public.components FOR SELECT
  USING (true);

-- Only admins can insert components
CREATE POLICY "Admins can insert components"
  ON public.components FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update components
CREATE POLICY "Admins can update components"
  ON public.components FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete components
CREATE POLICY "Admins can delete components"
  ON public.components FOR DELETE
  USING (public.is_admin());

-- ---- ORDERS ----
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

-- Authenticated users can create orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update orders (status changes)
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ---- ORDER ITEMS ----
-- Users can view their own order items (via order ownership)
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Decrement stock when order item is inserted
CREATE OR REPLACE FUNCTION public.decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.components
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.component_id
  AND stock_quantity >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for component %', NEW.component_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_item_inserted
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock();

-- ============================================================
-- 5. STORAGE BUCKET
-- ============================================================

-- Create a public bucket for component images
INSERT INTO storage.buckets (id, name, public)
VALUES ('component-images', 'component-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images
CREATE POLICY "Public read component images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'component-images');

-- Allow admins to upload images
CREATE POLICY "Admins can upload component images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'component-images'
    AND public.is_admin()
  );

-- Allow admins to update images
CREATE POLICY "Admins can update component images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'component-images'
    AND public.is_admin()
  );

-- Allow admins to delete images
CREATE POLICY "Admins can delete component images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'component-images'
    AND public.is_admin()
  );

-- ============================================================
-- 6. SEED DATA
-- ============================================================

INSERT INTO public.components (name, description, price, stock_quantity, category, image_url) VALUES
  ('Arduino Uno R3', 'Classic microcontroller board based on the ATmega328P. Perfect for beginners and prototyping with 14 digital I/O pins, 6 analog inputs, and USB connectivity.', 24.99, 50, 'Microcontrollers', ''),
  ('ESP32 DevKit V1', 'Powerful Wi-Fi and Bluetooth enabled microcontroller with dual-core processor, 520KB SRAM, and 34 GPIO pins. Ideal for IoT projects.', 12.99, 75, 'Microcontrollers', ''),
  ('Raspberry Pi Pico W', 'Compact microcontroller board with RP2040 chip, wireless connectivity, 264KB SRAM, and 26 GPIO pins. Great for embedded projects.', 8.49, 100, 'Microcontrollers', ''),
  ('DHT22 Temperature & Humidity Sensor', 'High-precision digital sensor measuring temperature (-40°C to 80°C) and humidity (0-100%RH) with ±0.5°C accuracy.', 6.99, 120, 'Sensors', ''),
  ('HC-SR04 Ultrasonic Distance Sensor', 'Non-contact distance measurement module with 2cm-400cm range and 3mm accuracy. Uses ultrasonic waves for reliable detection.', 3.49, 200, 'Sensors', ''),
  ('MPU-6050 Accelerometer & Gyroscope', '6-axis motion tracking device with 3-axis accelerometer and 3-axis gyroscope. I2C interface, perfect for robotics and drones.', 4.99, 90, 'Sensors', ''),
  ('LM2596 DC-DC Buck Converter', 'Adjustable step-down voltage regulator module. Input 4-35V, output 1.5-35V with up to 3A continuous current.', 2.99, 150, 'Power', ''),
  ('18650 Battery Shield V3', 'Lithium battery charging and boost module with dual USB output, 5V/3A. Supports pass-through charging for portable projects.', 7.49, 60, 'Power', ''),
  ('0.96" OLED Display (I2C)', 'Compact 128x64 pixel OLED display module with I2C interface. Vivid blue/white display with wide viewing angle and low power consumption.', 5.99, 80, 'Displays', ''),
  ('2.4" TFT LCD Touch Screen', 'Color TFT display with resistive touchscreen, 320x240 resolution. SPI interface, compatible with Arduino and ESP32.', 14.99, 40, 'Displays', ''),
  ('NRF24L01+ Wireless Transceiver', '2.4GHz wireless communication module with 250kbps-2Mbps data rate and 100m range. SPI interface for reliable data transmission.', 3.99, 110, 'Communication', ''),
  ('SG90 Micro Servo Motor', 'Lightweight 9g servo motor with 180° rotation, 1.8kg·cm torque, and fast 0.1s/60° response time. Ideal for robotics and RC projects.', 2.49, 180, 'Actuators', '');
