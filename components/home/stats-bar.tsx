import React from "react";
import {
  Cpu,
  Truck,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Zap,
  Package,
  Clock,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import { StatCard, StatCardIcon, StatCardColor } from "@/lib/types";

interface StatsBarProps {
  stats: StatCard[];
}

export const STAT_ICON_MAP: Record<StatCardIcon, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Truck,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Zap,
  Package,
  Clock,
  Sparkles,
  IndianRupee,
};

export const STAT_COLOR_MAP: Record<StatCardColor, { icon: string; bg: string; border: string }> = {
  primary: {
    icon: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  emerald: {
    icon: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  blue: {
    icon: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  indigo: {
    icon: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  amber: {
    icon: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  rose: {
    icon: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl hover:border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {stats.map((stat, index) => {
            const IconComponent = STAT_ICON_MAP[stat.icon] || Cpu;
            const colorConfig = STAT_COLOR_MAP[stat.color] || STAT_COLOR_MAP.primary;

            return (
              <div
                key={stat.id || index}
                className={`group flex flex-col items-center text-center px-2 transition-transform duration-200 hover:-translate-y-0.5 ${
                  index === 0
                    ? "pt-2 md:pt-0"
                    : index === 1
                    ? "pt-4 sm:pt-2 md:pt-0"
                    : "pt-4 md:pt-0"
                }`}
              >
                <div
                  className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${colorConfig.bg} ${colorConfig.icon}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {stat.title}
                </span>
                <span className="text-xs font-medium text-muted-foreground mt-0.5 leading-snug">
                  {stat.subtitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
