import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Zap, ChevronDown, ChevronUp } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string; actions?: string[] };

type Props = {
  agentName: string;
  agentRole: string;
  context: string;
  suggestedPrompts?: string[];
  color?: "blue" | "violet" | "emerald" | "amber" | "rose";
};

const COLOR_MAP = {
  blue: { bg: "bg-[#0F172A]", light: "bg-slate-50", border: "border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
  violet: { bg: "bg-[#0F172A]", light: "bg-slate-50", border: "border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
  emerald: { bg: "bg-[#0F172A]", light: "bg-slate-50", border: "border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
  amber: { bg: "bg-[#0F172A]", light: "bg-slate-50", border: "border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
  rose: { bg: "bg-rose-600", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
};

// Deterministic AI responses by context keyword
function getAIResponse(userMsg: string, context: string): { text: string; actions?: string[] } {
  const msg = userMsg.toLowerCase();
  if (msg.includes("method") || msg.includes("approach")) {
    return {
      text: `Based on the estimated value and ${context}, I recommend **Open Competitive Tendering** as the preferred procurement method. This ensures maximum competition, transparency, and best value for money per PPDPA Section 32. The market has sufficient qualified suppliers (12 in ZPCS database).`,
      actions: ["Apply this recommendation", "View policy reference", "Show alternatives"],
    };
  }
  if (msg.includes("risk")) {
    return {
      text: `Risk assessment for this ${context}:\n\n🔴 **High:** Single-source dependency (3 qualified suppliers)\n🟡 **Medium:** Currency risk — USD exposure 78%\n🟢 **Low:** Regulatory — full PPDPA compliance detected\n\nRecommended mitigation: Add performance bond clause (10%) and multi-currency payment option.`,
      actions: ["Add risk clauses", "Generate risk report", "Schedule risk review"],
    };
  }
  if (msg.includes("spec") || msg.includes("tor") || msg.includes("draft")) {
    return {
      text: `I've drafted the Technical Specifications for ${context}. Key sections generated:\n\n1. **Scope of Supply** — 847 words, 12 line items\n2. **Technical Requirements** — ISO 9001 compliance mandatory\n3. **Delivery Schedule** — 60 days ARO\n4. **Quality Standards** — SANS/SABS applicable\n\nReviewed against 3 previous similar tenders. Confidence: 94%`,
      actions: ["Insert into tender", "Review & edit", "Run compliance check"],
    };
  }
  if (msg.includes("supplier") || msg.includes("vendor")) {
    return {
      text: `Supplier intelligence for ${context}:\n\n✅ **12 pre-qualified suppliers** in category\n📊 **Top 3 by performance:** Highveld (4.7★), ZimPharma (4.5★), Sable ICT (4.2★)\n⚠️ **2 flagged:** Late delivery history > 30%\n🚫 **1 blacklisted:** Granite Construction (ZACC referral)\n\nRecommend: Open to all qualified, exclude blacklisted.`,
      actions: ["Generate supplier list", "View scorecards", "Send invitations"],
    };
  }
  if (msg.includes("evaluat") || msg.includes("score")) {
    return {
      text: `Evaluation analysis for ${context}:\n\n🏆 **Recommended winner:** Zimbabwe Pharma Holdings\n- Weighted score: **90.45/100**\n- Technical: 91.2 | Financial: 89.8\n- No conflict of interest detected\n- References verified: 3/3\n\n⚖️ Evaluation method: QCBS (70/30 split)\nCompliance: All responsive bids evaluated consistently.`,
      actions: ["Generate award recommendation", "Prepare evaluation report", "Notify bidders"],
    };
  }
  if (msg.includes("fraud") || msg.includes("collus") || msg.includes("corrupt")) {
    return {
      text: `🚨 **Fraud Detection Alert** for ${context}:\n\n**Pattern detected:** Bid rotation — VEN-00476 & VEN-00481 alternated wins 4 times in 18 months\n**Confidence:** 89%\n**Action taken:** Auto-flagged for investigation\n\nSimilar IP addresses detected in bid submissions. Recommend suspension pending ZACC review.`,
      actions: ["Refer to ZACC", "Suspend vendors", "Generate evidence package"],
    };
  }
  if (msg.includes("contract")) {
    return {
      text: `Contract intelligence for ${context}:\n\n📋 **Draft generated** — 34 clauses, 8 schedules\n⚠️ **Risky clause detected** in Section 14: "unlimited liability" — recommend cap at contract value\n📅 **3 milestone obligations** auto-extracted\n💰 **Payment terms** aligned with Treasury Instructions 2021\n\nContract compliant with PPDPA and Standard Conditions of Contract.`,
      actions: ["Review contract", "Apply recommendations", "Send for signature"],
    };
  }
  if (msg.includes("payment") || msg.includes("invoice")) {
    return {
      text: `Payment analysis for ${context}:\n\n✅ **3-way match:** PO ✓ | GRN ✓ | Invoice ✓\n💰 Amount: USD 2,840,000 — matches contract schedule\n🔍 **No duplicates** detected in payment history\n⏱️ Avg payment cycle: 28 days (target: 30)\n\nWithholding tax: USD 284,000 (10%) computed. Net payment: USD 2,556,000.`,
      actions: ["Approve payment", "Schedule payment", "Generate remittance advice"],
    };
  }
  // Default
  return {
    text: `I've analyzed the current ${context} stage. Here's my assessment:\n\n✅ **Status:** On track — no critical issues detected\n📊 **Completion:** 67% of required documentation submitted\n⏱️ **Timeline:** 3 days ahead of schedule\n💡 **Recommendation:** Proceed to next stage. Consider adding performance bond clause before award.\n\nAll checks passed against PPDPA 2018 and Treasury Instructions.`,
    actions: ["Proceed to next stage", "Generate status report", "Flag for review"],
  };
}

export default function AIAssistantPanel({ agentName, agentRole, context, suggestedPrompts = [], color = "blue" }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello! I'm **${agentName}**, your AI assistant for ${context}. I can help you with ${agentRole}. Ask me anything or choose a suggested prompt below.`,
      actions: suggestedPrompts.slice(0, 3),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const c = COLOR_MAP[color];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const response = getAIResponse(text, context);
      setMessages((prev) => [...prev, { role: "assistant", ...response }]);
      setThinking(false);
    }, 800 + Math.random() * 600);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 ${c.bg} text-white rounded-full px-4 py-3 flex items-center gap-2 shadow-elevated hover:opacity-90 transition-all z-50 text-sm font-medium`}
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">AI Assistant · Ask anything</span>
        <span className="sm:hidden">AI</span>
        <span className={`h-2 w-2 rounded-full bg-white opacity-80 animate-pulse`} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[380px] rounded-none sm:rounded-xl shadow-elevated border-t sm:border border-border bg-card z-50 flex flex-col overflow-hidden`} style={{ maxHeight: minimized ? "56px" : "min(560px, 80vh)" }}>
      {/* Header */}
      <div className={`${c.bg} px-4 py-3 flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{agentName}</div>
            <div className="text-[10px] text-white/70 flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse`} />
              Active · {agentRole}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="text-white/70 hover:text-white p-1 rounded">
            {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-secondary/30" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className={`h-6 w-6 rounded-full ${c.bg} grid place-items-center flex-shrink-0 mt-0.5`}>
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-1.5`}>
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? `${c.bg} text-white rounded-tr-none` : "bg-card border border-border text-foreground rounded-tl-none shadow-sm"}`}>
                    {m.text.split("\n").map((line, j) => {
                      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return <p key={j} className="mb-0.5" dangerouslySetInnerHTML={{ __html: bold }} />;
                    })}
                  </div>
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {m.actions.map((a) => (
                        <button
                          key={a}
                          onClick={() => send(a)}
                          className={`text-[10px] px-2 py-1 rounded-full border ${c.border} ${c.light} ${c.text} hover:opacity-80 transition-opacity font-medium`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="h-6 w-6 rounded-full bg-secondary grid place-items-center flex-shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex gap-2 justify-start">
                <div className={`h-6 w-6 rounded-full ${c.bg} grid place-items-center flex-shrink-0`}>
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-card border border-border rounded-xl rounded-tl-none px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-bounce`} style={{ animationDelay: "0ms" }} />
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-bounce`} style={{ animationDelay: "150ms" }} />
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-bounce`} style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts */}
          {suggestedPrompts.length > 0 && messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-border bg-secondary/20 flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className={`text-[10px] px-2 py-1 rounded-full ${c.light} ${c.text} ${c.border} border hover:opacity-80 font-medium transition-opacity flex items-center gap-1`}
                >
                  <Zap className="h-2.5 w-2.5" /> {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
                placeholder={`Ask ${agentName}…`}
                className="flex-1 h-8 px-3 rounded-lg border border-border bg-secondary text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                className={`h-8 w-8 rounded-lg ${c.bg} text-white grid place-items-center disabled:opacity-40 hover:opacity-90 transition-opacity`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
