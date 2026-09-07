import Link from "next/link";
import { ArrowRight, FileText, Truck, Cpu, ShieldCheck } from "lucide-react";
import { DreamyButterflies } from "@/components/effects/dreamy-butterflies";
import { FloatingPcbTraces } from "@/components/effects/floating-pcb-traces";
import { InteractiveHeroHeadline } from "@/components/home/interactive-hero-headline";

export default function HeroSection() {
  // Out-of-focus neon particles (cyan and purple)
  const particles = [
    { top: "18%", left: "14%", size: 4, color: "bg-cyan-400", glow: "rgba(34, 211, 238, 0.85)", anim: "animate-particle-drift", delay: "0s", blur: 1 },
    { top: "28%", left: "22%", size: 6, color: "bg-purple-400", glow: "rgba(192, 132, 252, 0.8)", anim: "animate-particle-drift-reverse", delay: "1.2s", blur: 1.5 },
    { top: "42%", left: "16%", size: 5, color: "bg-cyan-300", glow: "rgba(103, 232, 249, 0.9)", anim: "animate-particle-drift", delay: "2.4s", blur: 1 },
    { top: "62%", left: "19%", size: 3, color: "bg-purple-500", glow: "rgba(168, 85, 247, 0.75)", anim: "animate-particle-drift-reverse", delay: "3.1s", blur: 0.8 },
    { top: "22%", right: "18%", size: 5, color: "bg-purple-400", glow: "rgba(192, 132, 252, 0.85)", anim: "animate-particle-drift", delay: "1.8s", blur: 1.2 },
    { top: "35%", right: "12%", size: 4, color: "bg-cyan-400", glow: "rgba(34, 211, 238, 0.8)", anim: "animate-particle-drift-reverse", delay: "0.5s", blur: 1 },
    { top: "54%", right: "20%", size: 6, color: "bg-purple-500", glow: "rgba(168, 85, 247, 0.7)", anim: "animate-particle-drift", delay: "2.9s", blur: 2 },
    { top: "68%", right: "15%", size: 3.5, color: "bg-cyan-300", glow: "rgba(103, 232, 249, 0.85)", anim: "animate-particle-drift-reverse", delay: "4s", blur: 1 },
    { top: "15%", left: "45%", size: 3, color: "bg-cyan-400", glow: "rgba(34, 211, 238, 0.6)", anim: "animate-particle-drift", delay: "3.5s", blur: 1 },
    { top: "75%", left: "48%", size: 4.5, color: "bg-purple-400", glow: "rgba(192, 132, 252, 0.7)", anim: "animate-particle-drift-reverse", delay: "1.5s", blur: 1.5 },
  ];

  return (
    <section className="relative overflow-hidden bg-[#070709] text-white py-20 sm:py-28 lg:py-32">
      {/* -- 1. Dark Dot-Matrix Grid Background with Soft Vignette Mask --- */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,black_35%,transparent_100%)]"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* -- 2. Out-of-Focus Neon & Warm Amber Glow Ambiance ----------- */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[500px] h-[380px] bg-cyan-500/10 blur-[140px] rounded-full animate-particle-drift" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-[540px] h-[420px] bg-purple-600/12 blur-[150px] rounded-full animate-particle-drift-reverse" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[460px] bg-amber-500/12 blur-[160px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-[460px] h-[360px] bg-indigo-600/10 blur-[130px] rounded-full" />

      {/* -- 3. Floating Golden PCB Circuit Traces & Naturally Illuminated Vias -- */}
      <FloatingPcbTraces />

      {/* -- 3.5. Floating Neon Particles (Drifting & Out-of-Focus) -------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${p.color} ${p.anim}`}
            style={{
              top: p.top,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size}px`,
              boxShadow: `0 0 ${p.size * 3}px ${p.glow}`,
              filter: `blur(${p.blur}px)`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* -- 3.8. Dreamy Bioluminescent Butterflies Flying in Background --- */}
      <DreamyButterflies />

      {/* -- 4. Content Area ---------------------------------------------- */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Flagship Center Logo Emblem with Neon Ambient Glow */}
        <div className="relative mx-auto mb-6 flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/25 via-cyan-500/25 to-purple-500/25 blur-xl opacity-75 animate-pulse" />
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full p-1.5 ring-2 ring-amber-500/40 bg-zinc-950/80 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:shadow-[0_0_50px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-105 group">
            <img
              src="/logo.png"
              alt="Z-Electronics Official Logo"
              className="h-full w-full object-cover rounded-full ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>

        {/* Sleek B2B Verification Pill with Brand Avatar */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 pl-2 pr-3.5 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md mb-8 transition-colors hover:border-zinc-700">
          <div className="h-4 w-4 rounded-full overflow-hidden ring-1 ring-amber-500/40 shrink-0">
            <img src="/logo.png" alt="Z" className="h-full w-full object-cover" />
          </div>
          <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-zinc-200 font-semibold">Z-Electronics</span>
          <span className="text-zinc-600">•</span>
          <span>Enterprise & Maker Hardware Supply</span>
        </div>

        {/* Interactive Living Headline: Typewriter, Cursor Reactive 3D Tilt, & Floating Levitation */}
        <InteractiveHeroHeadline />

        {/* Constrained Sub-headline for Optimal Readability */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal text-center">
          Certified distribution of high-grade microcontrollers, precision sensors, power ICs, and prototyping hardware with automated bill generation and guaranteed same-day dispatch.
        </p>

        {/* Action Area: Buttons with Pro Top-Tier Copy & Super Active Tactile Press Physics */}
        <div className="mt-9 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
          {/* Primary Button: Shimmer Highlight & Tactile Spring Rebound */}
          <a
            href="#catalog"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-sm font-bold text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.22)] transition-all duration-150 ease-out hover:bg-zinc-100 hover:shadow-[0_0_36px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 active:translate-y-1 active:scale-[0.94] active:shadow-inner cursor-pointer"
          >
            <span>Explore Component Store</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </a>

          {/* Secondary Button: Dark Glassmorphic with Pro WhatsApp Engineering Desk */}
          <a
            href="https://wa.me/918072726924?text=Hi%20Sujith,%20I'd%20like%20to%20inquire%20about%20Z-Electronics%20components%20and%20hardware."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/70 px-7 py-4 text-sm font-semibold text-zinc-200 shadow-sm backdrop-blur-xl transition-all duration-150 ease-out hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white hover:shadow-[0_0_25px_rgba(37,211,102,0.25)] hover:-translate-y-0.5 active:translate-y-1 active:scale-[0.94] cursor-pointer"
          >
            {/* Minimal WhatsApp Icon */}
            <svg
              className="h-4 w-4 text-[#25D366] fill-current transition-transform duration-150 group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.073-1.134-.067-.324-.105-.733-.243-1.288-.485-2.348-1.026-3.864-3.414-3.98-3.571-.116-.157-.951-1.265-.951-2.413 0-1.148.601-1.713.815-1.947.214-.234.469-.293.626-.293.157 0 .313.003.45.01.144.007.337-.054.527.401.196.47.669 1.636.728 1.753.059.117.099.255.02.411-.079.156-.118.254-.235.391-.118.137-.248.307-.354.412-.118.117-.241.245-.104.48.137.235.61 1.006 1.309 1.628.9.801 1.66 1.049 1.896 1.166.236.117.373.104.51-.053.138-.157.589-.686.746-.921.157-.235.314-.196.53-.117.216.078 1.373.647 1.609.765.236.118.393.176.452.274.059.098.059.568-.085.973z" />
            </svg>
            <span>Consult with Engineer</span>
          </a>
        </div>

        {/* -- Bottom Trust Banner: 3 Minimal Faded Badges ---------------- */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-zinc-900/80 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-zinc-400">
          <div className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-zinc-200">
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            <span>Automated GST Invoicing</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <div className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-zinc-200">
            <Truck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Express Campus Delivery</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <div className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-zinc-200">
            <Cpu className="h-3.5 w-3.5 text-cyan-500" />
            <span>100% Genuine Silicon</span>
          </div>
        </div>
      </div>
    </section>
  );
}

