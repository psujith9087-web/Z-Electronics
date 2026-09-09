"use client";

import { useState } from "react";
import { updateGeminiKeyAdmin, AIInquiry } from "@/lib/actions/ai-agent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Key,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Save,
  MessageSquare,
  Clock,
  HelpCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface AiManagerProps {
  initialInquiries: AIInquiry[];
  initialConfig: {
    hasKey: boolean;
    source: "env" | "database" | "none";
    maskedKey?: string;
  };
}

export function AiManager({ initialInquiries, initialConfig }: AiManagerProps) {
  const [config, setConfig] = useState(initialConfig);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error("Please enter a Gemini API Key.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateGeminiKeyAdmin(apiKey.trim());
      if (res.success) {
        toast.success("Google Gemini API Key saved successfully!");
        setConfig({
          hasKey: true,
          source: "database",
          maskedKey: `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
        });
        setApiKey("");
      } else {
        toast.error(res.error || "Failed to update Gemini API key.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving key.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-500" />
            Mr. Z AI Hardware Agent & Gemini Configuration
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your AI embedded systems assistant, Gemini 1.5 Flash API credentials, and review customer technical queries.
          </p>
        </div>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-xl transition-all border border-indigo-500/20 w-fit"
        >
          <span>Get Free Google Gemini Key</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* API Key Status & Configuration Card */}
      <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Google Gemini AI Model Connection</h3>
                <p className="text-xs text-muted-foreground">
                  Power Mr. Z with Google Gemini 1.5 Flash (Generative Language API)
                </p>
              </div>
            </div>

            {config.hasKey ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-bold gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Active ({config.source === "env" ? "Environment" : "Database"})</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-bold gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Offline Knowledge Engine Active</span>
              </Badge>
            )}
          </div>

          {config.hasKey && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Configured Key:</span>
              <code className="font-mono text-xs font-bold text-foreground bg-background px-2 py-1 rounded border border-border">
                {config.maskedKey || "••••••••••••••••"}
              </code>
            </div>
          )}

          {/* Form to update key */}
          <form onSubmit={handleSaveKey} className="space-y-3 pt-2">
            <label className="text-xs font-bold text-foreground block">
              {config.hasKey ? "Update or Replace Gemini API Key:" : "Enter Free Google Gemini API Key:"}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-10 text-xs rounded-xl font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isSaving || !apiKey.trim()}
                className="h-10 px-4 rounded-xl font-bold text-xs gap-1.5 shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? "Saving..." : "Save Key"}</span>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Google provides free Gemini API access with generous rate limits. Keys are stored securely and never exposed to the public client.
            </p>
          </form>
        </div>
      </Card>

      {/* Customer Inquiries Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Recent Customer Inquiries with Mr. Z ({initialInquiries.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            Helps you track what components students and engineers are seeking
          </span>
        </div>

        {initialInquiries.length === 0 ? (
          <Card className="rounded-2xl border border-dashed p-8 text-center bg-card/50">
            <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h4 className="text-xs font-bold text-foreground">No customer questions logged yet</h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              When visitors ask Mr. Z questions about projects, pinouts, and components, they will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {initialInquiries.slice(0, 20).map((inq) => (
              <Card key={inq.id} className="rounded-xl border bg-card p-3.5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      &ldquo;{inq.query}&rdquo;
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(inq.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
