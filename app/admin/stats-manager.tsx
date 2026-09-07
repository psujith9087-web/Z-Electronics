"use client";

import { useState } from "react";
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
  Save,
  RotateCcw,
  Eye,
  Check,
} from "lucide-react";
import { StatCard, StatCardIcon, StatCardColor, DEFAULT_SITE_STATS } from "@/lib/types";
import { updateSiteStats, resetSiteStats } from "@/lib/actions/site-stats";
import { STAT_ICON_MAP, STAT_COLOR_MAP } from "@/components/home/stats-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface StatsManagerProps {
  initialStats: StatCard[];
}

const AVAILABLE_ICONS: { value: StatCardIcon; label: string }[] = [
  { value: "Cpu", label: "Cpu (Microchips / Silicon)" },
  { value: "Truck", label: "Truck (Delivery / Dispatch)" },
  { value: "CheckCircle2", label: "Check Circle (Tested / Quality)" },
  { value: "Headphones", label: "Headphones (Support / Helpdesk)" },
  { value: "ShieldCheck", label: "Shield Check (Warranty / Security)" },
  { value: "Zap", label: "Zap (Fast / Power)" },
  { value: "Package", label: "Package (Stock / Hardware)" },
  { value: "Clock", label: "Clock (Turnaround / 24/7)" },
  { value: "Sparkles", label: "Sparkles (Premium / Pro)" },
  { value: "IndianRupee", label: "Rupee (Affordable / Pricing)" },
];

const AVAILABLE_COLORS: { value: StatCardColor; label: string; bgClass: string; textClass: string }[] = [
  { value: "primary", label: "Cyan (Primary)", bgClass: "bg-primary", textClass: "text-primary" },
  { value: "emerald", label: "Green (Emerald)", bgClass: "bg-emerald-500", textClass: "text-emerald-500" },
  { value: "blue", label: "Sky Blue", bgClass: "bg-blue-500", textClass: "text-blue-500" },
  { value: "indigo", label: "Purple (Indigo)", bgClass: "bg-indigo-500", textClass: "text-indigo-500" },
  { value: "amber", label: "Amber (Gold)", bgClass: "bg-amber-500", textClass: "text-amber-500" },
  { value: "rose", label: "Rose (Red)", bgClass: "bg-rose-500", textClass: "text-rose-500" },
];

export function StatsManager({ initialStats }: StatsManagerProps) {
  const [stats, setStats] = useState<StatCard[]>(
    initialStats && initialStats.length > 0 ? initialStats : DEFAULT_SITE_STATS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleCardChange = (index: number, field: keyof StatCard, value: any) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSiteStats(stats);
      if (res.success && res.data) {
        setStats(res.data);
        toast.success("Homepage stats updated successfully!", {
          description: "Changes are now live on the customer homepage.",
        });
      } else {
        toast.error("Failed to save stats", {
          description: res.error || "Please check your inputs and try again.",
        });
      }
    } catch (err: any) {
      toast.error("Error saving stats", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all 4 stats to default values?")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetSiteStats();
      if (res.success && res.data) {
        setStats(res.data);
        toast.success("Restored default homepage stats!");
      } else {
        toast.error("Failed to reset stats", {
          description: res.error,
        });
      }
    } catch (err: any) {
      toast.error("Error resetting stats", {
        description: err.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Homepage Value Proposition Stats
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Customize the 4 highlight metric cards displayed right below the hero banner on the customer interface.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="rounded-xl gap-1.5 font-bold text-xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span>Reset Defaults</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isResetting}
            className="rounded-xl gap-2 font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          >
            <Save className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Live Customer Preview Card */}
      <Card className="rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 sm:px-6 bg-muted/40 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Eye className="h-4 w-4 text-primary" />
              <span>Live Customer Preview (Real-time)</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> Updates instantly
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-background/50">
          <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/90 p-4 sm:p-6 shadow-md backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
              {stats.map((stat, index) => {
                const IconComp = STAT_ICON_MAP[stat.icon] || Cpu;
                const colorConfig = STAT_COLOR_MAP[stat.color] || STAT_COLOR_MAP.primary;

                return (
                  <div
                    key={stat.id || index}
                    className={`flex flex-col items-center text-center px-2 ${
                      index === 0
                        ? "pt-2 md:pt-0"
                        : index === 1
                        ? "pt-4 sm:pt-2 md:pt-0"
                        : "pt-4 md:pt-0"
                    }`}
                  >
                    <div
                      className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl ${colorConfig.bg} ${colorConfig.icon}`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                      {stat.title || `Card ${index + 1}`}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground mt-0.5 leading-snug">
                      {stat.subtitle || "Subtitle description"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Card Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map((card, index) => {
          const IconComp = STAT_ICON_MAP[card.icon] || Cpu;
          const colorConfig = STAT_COLOR_MAP[card.color] || STAT_COLOR_MAP.primary;

          return (
            <Card key={card.id || index} className="rounded-2xl border border-border/80 bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorConfig.bg} ${colorConfig.icon}`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black">
                        Card #{index + 1}: {card.title || "Untitled"}
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Position {index + 1} of 4 on the value proposition bar
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                    {card.color}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Metric Title Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Headline Metric / Title
                  </Label>
                  <Input
                    type="text"
                    value={card.title}
                    placeholder="e.g. 500+, Same Day, 100% Tested"
                    onChange={(e) => handleCardChange(index, "title", e.target.value)}
                    className="h-10 text-sm font-semibold rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Displayed in bold typography as the main focal point.
                  </p>
                </div>

                {/* Subtitle Description Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Subtitle / Detail
                  </Label>
                  <Input
                    type="text"
                    value={card.subtitle}
                    placeholder="e.g. Components in Stock, Dispatch Available"
                    onChange={(e) => handleCardChange(index, "subtitle", e.target.value)}
                    className="h-10 text-sm rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Short descriptive subtitle shown right below the title.
                  </p>
                </div>

                {/* Icon Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Icon Graphic
                  </Label>
                  <div className="relative">
                    <select
                      value={card.icon}
                      onChange={(e) => handleCardChange(index, "icon", e.target.value as StatCardIcon)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-input bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Accent Color Theme
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {AVAILABLE_COLORS.map((c) => {
                      const isSelected = card.color === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleCardChange(index, "color", c.value)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40 font-bold"
                              : "border-border/70 hover:bg-muted/60 text-muted-foreground"
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${c.bgClass}`} />
                          <span>{c.label.split(" ")[0]}</span>
                          {isSelected && <Check className="h-3 w-3 text-primary ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting || isSaving}
          className="rounded-xl font-bold text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset Defaults
        </Button>

        <Button
          type="button"
          size="default"
          onClick={handleSave}
          disabled={isSaving || isResetting}
          className="rounded-xl gap-2 font-black text-sm px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        >
          <Save className={`h-4 w-4 ${isSaving ? "animate-spin" : ""}`} />
          <span>{isSaving ? "Saving All Changes..." : "Save All Changes"}</span>
        </Button>
      </div>
    </div>
  );
}
