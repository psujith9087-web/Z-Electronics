"use client";

import { useState, useRef, useEffect } from "react";
import { askMrZ, ChatMessage } from "@/lib/actions/ai-agent";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Cpu,
  ShoppingCart,
  MessageSquare,
  ChevronDown,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export function MrZAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello Maker! I'm **Mr. Z**, your dedicated Hardware & Embedded Systems Engineer at Z-Electronics.\n\nAsk me anything about circuit schematics, pinouts, Arduino/ESP32 code, sensor interfacing, or component sourcing for your projects!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const starterPrompts = [
    {
      label: "HC-SR04 to ESP32 Pinout & Code",
      query: "How do I connect HC-SR04 ultrasonic sensor to ESP32 and write distance code?",
    },
    {
      label: "Obstacle Rover with L298N",
      query: "Give me circuit diagram and Arduino code for an obstacle avoiding rover using L298N.",
    },
    {
      label: "ESP32 IoT Weather Station",
      query: "What parts and Arduino code do I need for an ESP32 IoT Weather Station with DHT22 and OLED?",
    },
    {
      label: "Instant Invoices & Campus Delivery",
      query: "How does instant invoice generation and campus delivery work at Z-Electronics?",
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await askMrZ(newMessages);

      if (res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              res.reply ||
              "I encountered an error. You can also chat directly with Sujith on WhatsApp (+91 8072726924).",
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Network error connecting to Mr. Z's brain. Please reach out to Sujith on WhatsApp at +91 8072726924.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Memory reset. I'm **Mr. Z**, ready for your next electronics build or circuit query!",
      },
    ]);
  };

  // Render markdown text and extract code blocks with copy button
  const renderMessageContent = (content: string, msgIdx: number) => {
    // Regex to split code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const firstLineBreak = part.indexOf("\n");
            const lang =
              firstLineBreak > 3
                ? part.substring(3, firstLineBreak).trim()
                : "code";
            const code = part.substring(firstLineBreak + 1, part.length - 3).trim();
            const blockId = `${msgIdx}-${idx}`;

            return (
              <div
                key={idx}
                className="my-2 rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 overflow-hidden shadow-md"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-cyan-400">
                    <Terminal className="h-3 w-3" />
                    <span>{lang || "Code"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(code, blockId)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700"
                    title="Copy code snippet"
                  >
                    {copiedCodeIndex === blockId ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-[11px] font-mono text-cyan-200/90 leading-normal selection:bg-cyan-500/30">
                  <code>{code}</code>
                </pre>
              </div>
            );
          }

          // Regular text rendering with basic markdown formatting
          const formattedLines = part.split("\n").map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

            // Headings
            if (line.startsWith("### ")) {
              return (
                <h4 key={lIdx} className="font-bold text-sm text-foreground mt-2 mb-1">
                  {line.replace("### ", "")}
                </h4>
              );
            }
            if (line.startsWith("#### ")) {
              return (
                <h5 key={lIdx} className="font-bold text-xs text-foreground mt-1.5 mb-0.5 text-primary">
                  {line.replace("#### ", "")}
                </h5>
              );
            }

            // Bold styling
            let renderedLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            renderedLine = renderedLine.replace(/`([^`]+)`/g, "<code class='px-1 py-0.5 rounded bg-muted font-mono text-[11px] text-primary'>$1</code>");

            return (
              <p
                key={lIdx}
                dangerouslySetInnerHTML={{ __html: renderedLine }}
                className="leading-relaxed"
              />
            );
          });

          return <div key={idx}>{formattedLines}</div>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* ── Floating Launcher Button (Stacked Above WhatsApp at bottom-24 right-6) ── */}
      <div className="fixed bottom-24 right-6 z-40 group flex items-center">
        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute right-16 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 hidden sm:flex items-center gap-2 whitespace-nowrap rounded-full bg-background/95 border border-border/80 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-lg backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Ask Mr. Z (AI Hardware Engineer)</span>
        </div>

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/25 animate-radar pointer-events-none" />

        {/* Launcher Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-transform duration-75 active:scale-95 ring-4 ring-indigo-500/30 cursor-pointer"
          title="Ask Mr. Z — AI Hardware Assistant"
          aria-label="Open Mr. Z AI Hardware Assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-150 rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="h-7 w-7 transition-transform group-hover:scale-110" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-cyan-300 animate-pulse" />
            </div>
          )}

          {/* AI Badge on launcher */}
          <span className="absolute -bottom-1 font-black text-[9px] px-1.5 py-0.2 bg-zinc-950/90 text-cyan-400 rounded-full border border-cyan-500/40 tracking-wider uppercase">
            Mr. Z
          </span>
        </button>
      </div>

      {/* ── Chat Window (Drawer / Modal) ── */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] md:w-[460px] h-[600px] max-h-[85vh] rounded-2xl bg-card/95 border border-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Mr. Z AI Assistant Chat Window"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-gradient-to-r from-indigo-950/30 via-background to-cyan-950/20">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-sm ring-2 ring-cyan-500/20">
                <Bot className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground tracking-tight">
                    Mr. Z
                  </span>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[9px] px-1.5 py-0 font-bold border-none">
                    Gemini AI
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  Hardware & Circuit Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Minimize chat"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg, i) => {
              const isAssistant = msg.role === "assistant";

              return (
                <div
                  key={i}
                  className={`flex gap-2.5 ${isAssistant ? "items-start" : "items-end justify-end"}`}
                >
                  {isAssistant && (
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-indigo-500/20 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] ${
                      isAssistant
                        ? "bg-muted/60 border border-border/60 text-foreground"
                        : "bg-primary text-primary-foreground font-medium rounded-br-xs"
                    }`}
                  >
                    {renderMessageContent(msg.content, i)}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xs shrink-0 ring-1 ring-indigo-500/20 mt-0.5">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="rounded-2xl rounded-tl-xs px-3.5 py-2.5 bg-muted/60 border border-border/60 text-muted-foreground flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse delay-300" />
                  </span>
                  <span className="text-[11px] font-medium">
                    Mr. Z is compiling schematics & code...
                  </span>
                </div>
              </div>
            )}

            {/* Quick Starter Chips (Shown when only initial greeting exists) */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
                  ⚡ Quick Starter Prompts:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {starterPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(p.query)}
                      className="text-left text-[11px] font-medium p-2 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all active:scale-[0.98] text-foreground/90 flex items-center justify-between group cursor-pointer"
                    >
                      <span>{p.label}</span>
                      <Sparkles className="h-3 w-3 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Input */}
          <div className="p-3 border-t border-border/70 bg-card/70 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ESP32, Arduino code, sensor pinouts..."
                className="h-10 text-xs rounded-xl bg-background border-border/80 pr-2"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-10 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold shrink-0 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Verified Z-Electronics Hardware & Circuit Advice</span>
              <a
                href="https://chat.whatsapp.com/DjbAyUOmEgN67QDo0pPcGM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:underline font-semibold flex items-center gap-1"
              >
                <MessageSquare className="h-2.5 w-2.5" />
                WhatsApp Sujith
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
