"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  AlertCircle,
  Bot,
  Check,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's our revenue in the last 30 days?",
  "Who are the top 5 merchants?",
  "How healthy are our transactions?",
  "Break down revenue by payment method",
];

const TOOL_LABELS: Record<string, string> = {
  getPaymentsOverview: "Fetching KPIs",
  getTopMerchants: "Ranking merchants",
  getTransactionStatusBreakdown: "Analyzing statuses",
  getRevenueByMethod: "Splitting by method",
};

type UiMessage = ReturnType<typeof useChat>["messages"][number];

export function AssistantChat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-xl border bg-card">
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <EmptyState onPick={send} />
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}
        {status === "submitted" && <Thinking />}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error.message ||
              "Something went wrong. Ensure OPENAI_API_KEY is configured."}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about revenue, merchants, transactions…"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

function Message({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-muted" : "bg-primary text-primary-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] space-y-2 rounded-2xl px-4 py-2.5 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <p key={i} className="whitespace-pre-wrap leading-relaxed">
                {part.text}
              </p>
            );
          }
          if (part.type.startsWith("tool-")) {
            const tool = part as { type: string; state?: string };
            const name = tool.type.replace("tool-", "");
            return (
              <ToolChip
                key={i}
                label={TOOL_LABELS[name] ?? name}
                done={tool.state === "output-available"}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function ToolChip({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
      {done ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {label}
    </span>
  );
}

function Thinking() {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3.5">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-semibold">PayPulse Assistant</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ask about revenue, merchants, transaction health, and fees. I query your
        live data to answer.
      </p>
      <div className="mt-5 grid w-full max-w-md gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
