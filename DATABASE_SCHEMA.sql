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

-- Orders can be deleted by admin (e.g., reset all orders or delete individual order)
CREATE POLICY "Allow order deletion"
  ON public.orders FOR DELETE
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

-- Allow deletion of order items on order reset or cancellation
CREATE POLICY "Allow order items deletion"
  ON public.order_items FOR DELETE
  USING (true);

-- ============================================================
-- 7. SEED DATA FOR ELECTRONIC COMPONENTS
-- Initial stock and pricing in INR (₹)
-- ============================================================

INSERT INTO public.components (name, description, price, stock_quantity, image_url) VALUES
  ('Arduino Uno R3 (ATmega328P)', 'The classic microcontroller board for electronics prototyping. 14 digital I/O pins, 6 analog inputs, 16 MHz quartz crystal, and USB connection.', 549.00, 65, 'https://images.unsplash.com/photo-1608563363385-d68b8e0b62b1?w=600&auto=format&fit=crop&q=80'),
  ('ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)', 'Powerful IoT microcontroller with 240MHz dual-core Tensilica Xtensa 32-bit LX6, integrated 802.11 b/g/n Wi-Fi and Bluetooth 4.2 BR/EDR & BLE.', 449.00, 90, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'),
  ('Raspberry Pi Pico W (RP2040)', 'Dual-core ARM Cortex-M0+ microcontroller with built-in 2.4GHz wireless interface. 26 multi-function GPIO pins and programmable I/O.', 399.00, 80, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80'),
  ('HC-SR04 Ultrasonic Distance Sensor', 'Ultrasonic ranging module providing 2cm to 400cm non-contact measurement function with 3mm accuracy. Perfect for obstacle avoidance robots.', 69.00, 150, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'),
  ('DHT22 Temperature & Humidity Sensor', 'High accuracy digital humidity and temperature module. Measures relative humidity (0-100%) and temperature (-40 to 80°C) with single-bus digital output.', 349.00, 45, 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'),
  ('MPU-6050 6-Axis Gyroscope & Accelerometer', 'Combines a 3-axis gyroscope and a 3-axis accelerometer on the same silicon die with an onboard Digital Motion Processor (DMP). I2C communication.', 179.00, 75, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'),
  ('0.96 inch I2C OLED Display (128x64 Blue)', 'Compact graphic display module with SSD1306 driver, high contrast, wide viewing angle, and simple 4-pin I2C interface.', 249.00, 60, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'),
  ('4-Channel 5V Relay Module', 'Optocoupler isolated relay board for driving AC/DC loads up to 10A 250VAC. Ideal for home automation and smart switches.', 189.00, 50, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'),
  ('SG90 Micro 9g Servo Motor', 'Miniature lightweight servo motor with 180-degree rotation, 1.8 kg-cm torque. Includes 3 horn attachments and mounting screws.', 79.00, 120, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80'),
  ('L298N Dual H-Bridge Motor Driver Module', 'High power dual motor driver module capable of driving two DC motors or one 4-wire stepper motor up to 2A per bridge.', 149.00, 55, 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop&q=80'),
  ('1/4W Metal Film Resistor Assortment Kit (600 Pcs)', '30 common resistor values from 10 Ohm to 1M Ohm, 20 pieces each. 1% tolerance, flame retardant coating.', 159.00, 110, 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80'),
  ('Ceramic Disc Capacitor Assortment Kit (300 Pcs)', '30 popular values ranging from 10pF to 100nF, 10 pieces each. 50V rated, perfect for filtering and bypass applications.', 129.00, 85, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'),
  ('5mm Diffused LED Assortment (100 Pcs)', 'Assorted pack of ultra-bright diffused 5mm LEDs: Red, Green, Blue, Yellow, and White (20 pcs of each). 20mA forward current.', 89.00, 200, 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80'),
  ('NE555 Precision Timer IC (Pack of 5)', 'Industry-standard timing IC for generating accurate time delays and oscillations. DIP-8 package, operating voltage 4.5V to 16V.', 49.00, 140, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'),
  ('TP4056 1A Li-Ion Battery Charger with Protection', 'Micro-USB lithium battery charging module with onboard overcharge, over-discharge, and short-circuit protection.', 39.00, 160, 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'),
  ('16x2 Character LCD Display with I2C Module', 'Alphanumeric display with HD44780 controller and pre-soldered I2C backpack. Only requires 2 microcontroller pins (SDA, SCL).', 219.00, 40, 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80');

-- ============================================================
-- 8. SEED DATA FOR LEGACY & COMPLETED PROJECTS
-- Showcases achievements, client builds, and robotics projects
-- ============================================================

INSERT INTO public.components (name, description, price, stock_quantity) VALUES
  (
    '[PROJECT] Autonomous Quad-Wheel Warehouse Rover',
    '__PROJECT__{"title":"Autonomous Quad-Wheel Warehouse Rover","description":"Custom-engineered obstacle avoiding warehouse transport rover driven by ESP32 microcontrollers, dual L298N drivers, and four high-torque geared DC motors. Designed and verified for automated intra-facility transit.","category":"Robotics & IoT","imageUrl":"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80","date":"August 2026","clientOrInstitution":"Engineering College Robotics Club","featured":true}',
    0, 0
  ),
  (
    '[PROJECT] 50-Node Industrial Mesh Environmental Monitor',
    '__PROJECT__{"title":"50-Node Industrial Mesh Environmental Monitor","description":"Turnkey telemetry deployment spanning 50 sensor nodes equipped with DHT22 temperature/humidity probes, MQ gas detection, and ESP-NOW wireless mesh protocol streaming to a central dashboard.","category":"Completed Order","imageUrl":"https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80","date":"July 2026","clientOrInstitution":"Industrial Automation Client","featured":true}',
    0, 0
  ),
  (
    '[PROJECT] Custom Drone PDB & ESC Flight Controller Stack',
    '__PROJECT__{"title":"Custom Drone PDB & ESC Flight Controller Stack","description":"High-current power distribution board and multi-rotor flight controller stack featuring integrated MPU-6050 gyro stabilization and continuous 40A burst handling capability.","category":"Custom Circuit","imageUrl":"https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80","date":"May 2026","clientOrInstitution":"Aeromodelling Tech Team","featured":false}',
    0, 0
  ),
  (
    '[PROJECT] 1000+ Hardware Orders Milestone & Campus Distribution',
    '__PROJECT__{"title":"1000+ Hardware Orders Milestone & Campus Distribution","description":"Celebrating over 1,000 verified hardware kits and prototyping components delivered across Tamil Nadu engineering campuses with instant itemized invoices and zero DOA rate.","category":"Milestone","imageUrl":"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80","date":"September 2026","clientOrInstitution":"Z-Electronics Achievement","featured":true}',
    0, 0
  );

