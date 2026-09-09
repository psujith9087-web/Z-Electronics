"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkAdminSession } from "@/lib/actions/admin-auth";
import { getComponents } from "@/lib/actions/components";
import { getProjects } from "@/lib/actions/projects";
import { sanitizeInputText } from "@/lib/security";

const AI_INQUIRIES_CACHE_FILE = path.join(process.cwd(), "public", "ai-inquiries-cache.json");
const SETTINGS_KEY_NAME = "[AI_SETTINGS] gemini_api_key";
const INQUIRY_PREFIX = "__AI_INQUIRY__";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIInquiry {
  id: string;
  query: string;
  topic?: string;
  timestamp: string;
  user_ip?: string;
}

// ── In-Memory & Local Cache Helpers ─────────────────────────
function readLocalInquiries(): AIInquiry[] {
  try {
    if (fs.existsSync(AI_INQUIRIES_CACHE_FILE)) {
      const raw = fs.readFileSync(AI_INQUIRIES_CACHE_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Could not read local inquiries cache:", err);
  }
  return [];
}

function writeLocalInquiries(inquiries: AIInquiry[]): void {
  try {
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(AI_INQUIRIES_CACHE_FILE, JSON.stringify(inquiries.slice(0, 100), null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write local inquiries cache:", err);
  }
}

// ── Gemini Key Resolver ──────────────────────────────────────
async function getEffectiveGeminiApiKey(): Promise<string> {
  // 1. Check process.env.GEMINI_API_KEY
  const envKey = (process.env.GEMINI_API_KEY || "").trim();
  if (envKey && envKey !== "undefined" && envKey !== "null" && envKey.length > 10) {
    return envKey;
  }

  // 2. Check Supabase database setting if configured
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("components")
        .select("description")
        .eq("name", SETTINGS_KEY_NAME)
        .maybeSingle();

      if (data && data.description?.startsWith("__GEMINI_KEY__")) {
        const key = data.description.replace("__GEMINI_KEY__", "").trim();
        if (key.length > 10) return key;
      }
    }
  } catch {
    // ignore
  }

  return "";
}

// ── Built-in Intelligent Hardware Knowledge Engine ───────────
function generateFallbackHardwareResponse(
  userQuery: string,
  catalogNames: string[]
): { reply: string; suggestedComponents: string[] } {
  const q = userQuery.toLowerCase();
  const suggested: string[] = [];

  // 1. Ultrasonic / Distance / HC-SR04
  if (q.includes("ultrasonic") || q.includes("hc-sr04") || q.includes("distance sensor")) {
    suggested.push("HC-SR04 Ultrasonic Distance Sensor", "Arduino Uno R3 (ATmega328P)");
    return {
      reply: `### 📡 HC-SR04 Ultrasonic Sensor Connection Guide

**Pinout Connections to Arduino Uno / ESP32:**
- **VCC** ➜ \`5V\`
- **GND** ➜ \`GND\`
- **TRIG** ➜ \`Pin 9\` (or GPIO 5 on ESP32)
- **ECHO** ➜ \`Pin 10\` (or GPIO 18 on ESP32 via voltage divider if using 3.3V)

#### 💻 Ready-to-Flash Arduino C++ Code:
\`\`\`cpp
const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(200);
}
\`\`\`
*All HC-SR04 sensors at Z-Electronics are bench-tested for 2cm–400cm accuracy with instant campus delivery.*`,
      suggestedComponents: suggested,
    };
  }

  // 2. Obstacle Avoiding Rover / Robotics
  if (q.includes("rover") || q.includes("obstacle") || q.includes("robot") || q.includes("motor driver") || q.includes("l298n")) {
    suggested.push("ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)", "L298N Dual H-Bridge Motor Driver Module", "HC-SR04 Ultrasonic Distance Sensor", "SG90 Micro 9g Servo Motor");
    return {
      reply: `### 🤖 Autonomous Obstacle-Avoiding Rover Architecture

**Core Hardware Architecture:**
1. **Controller**: ESP32 DevKit V1 (240MHz dual-core) or Arduino Uno R3.
2. **Motor Driver**: L298N Dual H-Bridge (drives up to 2A per channel).
3. **Obstacle Detection**: HC-SR04 mounted on an SG90 micro servo for 180° radar scanning.
4. **Power**: 7.4V–11.1V 2S/3S Li-Ion battery pack with TP4056 charging module.

#### ⚡ Wiring Scheme:
- **L298N IN1, IN2, IN3, IN4** ➜ \`Pins 4, 5, 6, 7\`
- **HC-SR04 Trig / Echo** ➜ \`Pins 8, 9\`
- **SG90 Servo PWM** ➜ \`Pin 10\`

#### 💻 Arduino Control Logic:
\`\`\`cpp
#include <Servo.h>
Servo scanServo;

void setup() {
  scanServo.attach(10);
  scanServo.write(90); // Look forward
}

void loop() {
  float frontDist = getDistance();
  if (frontDist < 20.0) { // Obstacle within 20cm
    stopMotors();
    scanServo.write(30);  delay(300); float rightDist = getDistance();
    scanServo.write(150); delay(300); float leftDist = getDistance();
    scanServo.write(90);
    
    if (rightDist > leftDist) turnRight(); else turnLeft();
  } else {
    moveForward();
  }
}
\`\`\`
*We stock tested L298N modules and SG90 servos with official GST invoice and circuit support from Sujith.*`,
      suggestedComponents: suggested,
    };
  }

  // 3. ESP32 / IoT / Wi-Fi / Bluetooth
  if (q.includes("esp32") || q.includes("iot") || q.includes("wifi") || q.includes("mqtt") || q.includes("blynk")) {
    suggested.push("ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)", "DHT22 Temperature & Humidity Sensor", "0.96 inch I2C OLED Display (128x64 Blue)");
    return {
      reply: `### 🌐 ESP32 IoT Cloud Station Architecture

**Hardware Checklist:**
- **ESP32 DevKit V1 (38-Pin / 30-Pin)**: Dual-core Xtensa LX6 @ 240MHz with Wi-Fi & BLE.
- **DHT22**: Precision temperature (-40°C to +80°C) & humidity probe on GPIO 4.
- **0.96" I2C OLED**: SSD1306 display on GPIO 21 (SDA) and GPIO 22 (SCL).

#### 💻 Fast ESP32 Wi-Fi Telemetry Code:
\`\`\`cpp
#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

const char* ssid = "YOUR_WIFI";
const char* pass = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  // Read sensors & publish to MQTT / Cloud Dashboard
  delay(2000);
}
\`\`\`
*All ESP32 DevKits at Z-Electronics come flash-tested with working bootloader and onboard CP2102/CH340 drivers.*`,
      suggestedComponents: suggested,
    };
  }

  // 4. OLED / Display / I2C
  if (q.includes("oled") || q.includes("display") || q.includes("i2c") || q.includes("lcd")) {
    suggested.push("0.96 inch I2C OLED Display (128x64 Blue)", "16x2 Character LCD Display with I2C Module");
    return {
      reply: `### 📺 I2C OLED (SSD1306) & LCD Wiring Guide

**I2C Pin Mapping:**
| Display Pin | Arduino Uno | ESP32 | Raspberry Pi Pico |
| :--- | :--- | :--- | :--- |
| **VCC** | \`5V\` or \`3.3V\` | \`3.3V\` | \`3.3V\` |
| **GND** | \`GND\` | \`GND\` | \`GND\` |
| **SCL** | \`A5\` | \`GPIO 22\` | \`GP5\` |
| **SDA** | \`A4\` | \`GPIO 21\` | \`GP4\` |

*Default I2C Hex Address: \`0x3C\` (OLED) or \`0x27\` (16x2 LCD Backpack).*`,
      suggestedComponents: suggested,
    };
  }

  // 5. Ordering, Shipping, Campus Delivery, Invoices, Sujith
  if (q.includes("order") || q.includes("delivery") || q.includes("price") || q.includes("invoice") || q.includes("sujith") || q.includes("buy")) {
    return {
      reply: `### 📦 Ordering & Delivery Policy at Z-Electronics

- **Instant Invoice Generation**: Every order generates an itemized GST-compliant PDF invoice instantly.
- **Campus Delivery Across Tamil Nadu**: Fast dispatch directly to engineering colleges, hostels, and lab facilities.
- **Direct Hotline**: You can contact our founder **Sujith** directly at **+91 8072726924** or click the WhatsApp engineering button for instant component availability.
- **Component Quality**: 100% bench-tested silicon — zero fake clones or dead-on-arrival (DOA) parts.`,
      suggestedComponents: ["Arduino Uno R3 (ATmega328P)", "ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)"],
    };
  }

  // General helpful response
  const matches = catalogNames.slice(0, 3);
  return {
    reply: `Hello! I am **Mr. Z**, your dedicated Hardware & Embedded Systems Engineer at Z-Electronics.

I can assist you with:
1. **Circuit Schematics & Pinouts**: Step-by-step pin connections for Arduino, ESP32, Raspberry Pi, sensors, and displays.
2. **Firmware & Code Snippets**: Ready-to-flash C++, MicroPython, and Arduino sketches.
3. **Project Architecture**: Designing obstacle rovers, IoT telemetry stations, drones, smart switches, and quadrupeds.
4. **Verified Hardware Catalog**: Sourcing factory-tested microcontrollers and ICs with instant invoices and campus delivery.

*Ask me anything specific like: "How do I connect an MPU-6050 to Arduino?" or "Give me code for a smart home relay system."*`,
    suggestedComponents: matches.length > 0 ? matches : ["Arduino Uno R3 (ATmega328P)", "ESP32 DevKit V1 (Dual Core Wi-Fi + Bluetooth)"],
  };
}

// ── System Prompt Builder ────────────────────────────────────
function buildSystemPrompt(components: any[], projects: any[]): string {
  const componentSummary = components
    .slice(0, 25)
    .map((c) => `- ${c.name} (₹${c.price}) [Stock: ${c.stock_quantity}]`)
    .join("\n");

  const projectSummary = projects
    .slice(0, 8)
    .map((p) => `- ${p.title} (${p.category}): ${p.description}`)
    .join("\n");

  return `You are "Mr. Z", the Chief AI Hardware & Embedded Systems Engineer at Z-Electronics (https://z-electronics-beige.vercel.app).
Founded and led by Sujith (+91 8072726924).

YOUR PERSONALITY & MISSION:
- Highly knowledgeable, practical, encouraging, and razor-sharp hardware engineer.
- You provide exact pinouts, voltage levels (3.3V vs 5V logic warnings), pull-up resistors, I2C addresses, and complete ready-to-run code snippets (C++/Arduino/MicroPython).
- You recommend matching components directly from Z-Electronics inventory.
- You inform makers about campus delivery across engineering colleges in Tamil Nadu, instant itemized invoice generation, and Sujith's WhatsApp engineering desk.

CURRENT Z-ELECTRONICS CATALOG & LIVE INVENTORY:
${componentSummary}

FEATURED HARDWARE BUILDS & LEGACY PROJECTS:
${projectSummary}

GUIDELINES:
1. When asked for code, write clean, complete, commented Arduino C++ or MicroPython.
2. Explicitly specify GPIO pins and electrical safety (e.g. current-limiting resistors for LEDs, flyback diodes or optocouplers for relays).
3. If the user asks how to buy or order, explain that they can add items to cart right here or message Sujith directly on WhatsApp (+91 8072726924).
4. Keep formatting clean with GitHub-flavored markdown, bullet points, and code blocks.`;
}

// ── Server Actions ───────────────────────────────────────────

/**
 * Chat with Mr. Z AI Hardware Assistant.
 * Uses Google Gemini API (1.5 Flash / 2.0 Flash) when available,
 * with an automatic fallback knowledge engine.
 */
export async function askMrZ(
  messages: ChatMessage[],
  userSessionId?: string
): Promise<{
  success: boolean;
  reply: string;
  suggestedComponents?: string[];
  provider: "gemini" | "knowledge-engine";
  error?: string;
}> {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        reply: "Please provide a question for Mr. Z.",
        provider: "knowledge-engine",
      };
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = sanitizeInputText(lastMessage.content, 1200);

    if (!userPrompt || userPrompt.length < 2) {
      return {
        success: false,
        reply: "Could you please clarify your hardware question or project requirement?",
        provider: "knowledge-engine",
      };
    }

    // Fetch live catalog context
    const [components, projects] = await Promise.all([
      getComponents(),
      getProjects(),
    ]);
    const catalogNames = components.map((c) => c.name);

    // Save inquiry to history
    const inquiry: AIInquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      query: userPrompt,
      timestamp: new Date().toISOString(),
    };

    const currentInquiries = readLocalInquiries();
    writeLocalInquiries([inquiry, ...currentInquiries]);

    // Check for Gemini API Key
    const apiKey = await getEffectiveGeminiApiKey();

    if (apiKey) {
      try {
        const systemPrompt = buildSystemPrompt(components, projects);

        // Format history for Gemini API
        const contents = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: sanitizeInputText(m.content, 1000) }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 1200,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText && candidateText.trim().length > 10) {
            // Find relevant catalog items mentioned
            const suggested = catalogNames.filter((name) =>
              candidateText.toLowerCase().includes(name.toLowerCase().split(" ")[0])
            ).slice(0, 4);

            return {
              success: true,
              reply: candidateText.trim(),
              suggestedComponents: suggested.length > 0 ? suggested : catalogNames.slice(0, 3),
              provider: "gemini",
            };
          }
        } else {
          const errBody = await response.text();
          console.warn("Gemini API returned error, activating fallback engine:", response.status, errBody);
        }
      } catch (geminiErr) {
        console.warn("Error communicating with Gemini, activating fallback engine:", geminiErr);
      }
    }

    // Fallback Knowledge Engine (Fast, Guaranteed, Offline-Capable)
    const fallback = generateFallbackHardwareResponse(userPrompt, catalogNames);
    return {
      success: true,
      reply: fallback.reply,
      suggestedComponents: fallback.suggestedComponents,
      provider: "knowledge-engine",
    };
  } catch (err: any) {
    console.error("Error in askMrZ:", err);
    return {
      success: false,
      reply: "I encountered an error processing your query. Please feel free to reach out directly to Sujith on WhatsApp at +91 8072726924.",
      provider: "knowledge-engine",
      error: err.message,
    };
  }
}

/**
 * Get AI Assistant inquiries for the Admin Portal.
 */
export async function getMrZInquiriesAdmin(): Promise<{
  inquiries: AIInquiry[];
  stats: { total: number; today: number };
}> {
  const inquiries = readLocalInquiries();
  const today = new Date().toDateString();

  const todayCount = inquiries.filter((inq) => {
    try {
      return new Date(inq.timestamp).toDateString() === today;
    } catch {
      return false;
    }
  }).length;

  return {
    inquiries,
    stats: {
      total: inquiries.length,
      today: todayCount,
    },
  };
}

/**
 * Check Gemini API Key status.
 */
export async function getGeminiConfig(): Promise<{
  hasKey: boolean;
  source: "env" | "database" | "none";
  maskedKey?: string;
}> {
  const envKey = (process.env.GEMINI_API_KEY || "").trim();
  if (envKey && envKey.length > 10) {
    return {
      hasKey: true,
      source: "env",
      maskedKey: `${envKey.substring(0, 6)}...${envKey.substring(envKey.length - 4)}`,
    };
  }

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("components")
        .select("description")
        .eq("name", SETTINGS_KEY_NAME)
        .maybeSingle();

      if (data && data.description?.startsWith("__GEMINI_KEY__")) {
        const key = data.description.replace("__GEMINI_KEY__", "").trim();
        if (key.length > 10) {
          return {
            hasKey: true,
            source: "database",
            maskedKey: `${key.substring(0, 6)}...${key.substring(key.length - 4)}`,
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    hasKey: false,
    source: "none",
  };
}

/**
 * Admin action: Set or update the Gemini API Key.
 */
export async function updateGeminiKeyAdmin(
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const cleanKey = (apiKey || "").trim();

    if (cleanKey.length > 0 && cleanKey.length < 15) {
      return { success: false, error: "Please enter a valid Google Gemini API Key." };
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      const { data: existing } = await supabase
        .from("components")
        .select("id")
        .eq("name", SETTINGS_KEY_NAME)
        .maybeSingle();

      const encodedDescription = `__GEMINI_KEY__${cleanKey}`;

      if (existing && existing.id) {
        await supabase
          .from("components")
          .update({ description: encodedDescription })
          .eq("id", existing.id);
      } else {
        await supabase.from("components").insert({
          name: SETTINGS_KEY_NAME,
          description: encodedDescription,
          price: 0,
          stock_quantity: 0,
        });
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating Gemini key:", err);
    return { success: false, error: err.message || "Failed to update API key." };
  }
}
