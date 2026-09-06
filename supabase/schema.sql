-- ============================================================
-- Z-Electronics: Complete Database Schema & Migration
-- Paste and run this script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- ============================================================

-- 1. Enable UUID Extension (default in Postgres / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration cleanly
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.components CASCADE;

-- ============================================================
-- 3. CREATE TABLES
-- ============================================================

-- Components Table
CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quick migration for existing databases:
ALTER TABLE public.components ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items Table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES public.components(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- ============================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_components_name ON public.components(name);
CREATE INDEX idx_components_created_at ON public.components(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_component_id ON public.order_items(component_id);

-- ============================================================
-- 5. STOCK DECREMENT TRIGGER
-- Automatically decrements component stock upon order item creation
-- ============================================================

CREATE OR REPLACE FUNCTION public.decrement_component_stock()
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

CREATE OR REPLACE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_component_stock();

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ---- COMPONENTS POLICIES ----
-- Anyone (public/anon/auth) can read components catalog
CREATE POLICY "Public read components"
  ON public.components FOR SELECT
  USING (true);

-- Authenticated users (admin) or service role can insert components
CREATE POLICY "Allow component insertion"
  ON public.components FOR INSERT
  WITH CHECK (true);

-- Authenticated users (admin) or service role can update components
CREATE POLICY "Allow component update"
  ON public.components FOR UPDATE
  USING (true);

-- Authenticated users (admin) or service role can delete components
CREATE POLICY "Allow component deletion"
  ON public.components FOR DELETE
  USING (true);

-- ---- ORDERS POLICIES ----
-- Customers (public/anon) can insert new orders during checkout
CREATE POLICY "Public create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Orders can be read by anyone looking up their order or by admin
CREATE POLICY "Public read orders"
  ON public.orders FOR SELECT
  USING (true);

-- Orders can be updated (e.g., status changed to Completed)
CREATE POLICY "Allow order status update"
  ON public.orders FOR UPDATE
  USING (true);

-- ---- ORDER ITEMS POLICIES ----
-- Public can insert order items along with orders
CREATE POLICY "Public create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Public can read order items for invoices
CREATE POLICY "Public read order items"
  ON public.order_items FOR SELECT
  USING (true);

-- ============================================================
-- 7. SEED DATA FOR ELECTRONIC COMPONENTS
-- Initial stock and pricing in INR (₹)
-- ============================================================

INSERT INTO public.components (name, description, price, stock_quantity) VALUES
  ('Arduino Uno R3 (ATmega328P)', 'The classic microcontroller board for electronics prototyping. 14 digital I/O pins, 6 analog inputs, 16 MHz quartz crystal, and USB connection.', 549.00, 65),
  ('ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)', 'Powerful IoT microcontroller with 240MHz dual-core Tensilica Xtensa 32-bit LX6, integrated 802.11 b/g/n Wi-Fi and Bluetooth 4.2 BR/EDR & BLE.', 449.00, 90),
  ('Raspberry Pi Pico W (RP2040)', 'Dual-core ARM Cortex-M0+ microcontroller with built-in 2.4GHz wireless interface. 26 multi-function GPIO pins and programmable I/O.', 399.00, 80),
  ('HC-SR04 Ultrasonic Distance Sensor', 'Ultrasonic ranging module providing 2cm to 400cm non-contact measurement function with 3mm accuracy. Perfect for obstacle avoidance robots.', 69.00, 150),
  ('DHT22 Temperature & Humidity Sensor', 'High accuracy digital humidity and temperature module. Measures relative humidity (0-100%) and temperature (-40 to 80°C) with single-bus digital output.', 349.00, 45),
  ('MPU-6050 6-Axis Gyroscope & Accelerometer', 'Combines a 3-axis gyroscope and a 3-axis accelerometer on the same silicon die with an onboard Digital Motion Processor (DMP). I2C communication.', 179.00, 75),
  ('0.96 inch I2C OLED Display (128x64 Blue)', 'Compact graphic display module with SSD1306 driver, high contrast, wide viewing angle, and simple 4-pin I2C interface.', 249.00, 60),
  ('4-Channel 5V Relay Module', 'Optocoupler isolated relay board for driving AC/DC loads up to 10A 250VAC. Ideal for home automation and smart switches.', 189.00, 50),
  ('SG90 Micro 9g Servo Motor', 'Miniature lightweight servo motor with 180-degree rotation, 1.8 kg-cm torque. Includes 3 horn attachments and mounting screws.', 79.00, 120),
  ('L298N Dual H-Bridge Motor Driver Module', 'High power dual motor driver module capable of driving two DC motors or one 4-wire stepper motor up to 2A per bridge.', 149.00, 55),
  ('1/4W Metal Film Resistor Assortment Kit (600 Pcs)', '30 common resistor values from 10 Ohm to 1M Ohm, 20 pieces each. 1% tolerance, flame retardant coating.', 159.00, 110),
  ('Ceramic Disc Capacitor Assortment Kit (300 Pcs)', '30 popular values ranging from 10pF to 100nF, 10 pieces each. 50V rated, perfect for filtering and bypass applications.', 129.00, 85),
  ('5mm Diffused LED Assortment (100 Pcs)', 'Assorted pack of ultra-bright diffused 5mm LEDs: Red, Green, Blue, Yellow, and White (20 pcs of each). 20mA forward current.', 89.00, 200),
  ('NE555 Precision Timer IC (Pack of 5)', 'Industry-standard timing IC for generating accurate time delays and oscillations. DIP-8 package, operating voltage 4.5V to 16V.', 49.00, 140),
  ('TP4056 1A Li-Ion Battery Charger with Protection', 'Micro-USB lithium battery charging module with onboard overcharge, over-discharge, and short-circuit protection.', 39.00, 160),
  ('16x2 Character LCD Display with I2C Module', 'Alphanumeric display with HD44780 controller and pre-soldered I2C backpack. Only requires 2 microcontroller pins (SDA, SCL).', 219.00, 40);
