import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  Eye,
  EyeOff
} from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  text: string; 
  actions?: string[];
  timestamp?: string;
};

type AiAgentChatPanelProps = {
  agentName?: string;
  agentRole?: string;
  context?: string;
  suggestedPrompts?: string[];
  color?: "blue" | "violet" | "emerald" | "amber" | "rose";
  defaultVisible?: boolean;
  className?: string;
  onSendMessage?: (message: string) => void;
};

const COLOR_MAP = {
  blue: { bg: "bg-[#0F172A]", light: "bg-slate-50", border: "border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
  violet: { bg: "bg-[#7C3AED]", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
  emerald: { bg: "bg-emerald-600", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  amber: { bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-600", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
};

export function AiAgentChatPanel({
  agentName = "AI Assistant",
  agentRole = "Procurement Intelligence",
  context = "tender creation",
  suggestedPrompts = [
    "Suggest evaluation method",
    "Check compliance requirements",
    "Generate technical specs",
    "Identify potential risks"
  ],
  color = "blue",
  defaultVisible = true,
  className = "",
  onSendMessage
}: AiAgentChatPanelProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello! I'm your ${agentName}. I can help you with ${context}. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const colors = COLOR_MAP[color];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    onSendMessage?.(input);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, context);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: aiResponse.text,
        actions: aiResponse.actions,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 1000);

    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    handleSend();
  };

  if (!isVisible) {
    return (
      <div className={`border-l bg-slate-50 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="w-full justify-start gap-2"
        >
          <Eye className="h-4 w-4" />
          Show AI Assistant
        </Button>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className={`border-l bg-white ${className}`}>
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bg}`}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">{agentName}</h3>
              <p className="text-xs text-slate-500">{agentRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col border-l bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bg}`}>
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">{agentName}</h3>
            <p className="text-xs text-slate-500">{agentRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user" 
                  ? "bg-[#0F172A] text-white" 
                  : "bg-slate-100 text-slate-700"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.actions.map((action, actionIdx) => (
                      <Button
                        key={actionIdx}
                        variant={msg.role === "user" ? "secondary" : "outline"}
                        size="sm"
                        className="h-6 text-xs"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
                <p className={`mt-1 text-xs ${msg.role === "user" ? "text-slate-300" : "text-slate-400"}`}>
                  {msg.timestamp}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {suggestedPrompts.length > 0 && (
        <div className="border-t p-3">
          <p className="mb-2 text-xs font-medium text-slate-500">Suggested:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestedPrompt(prompt)}
                className="h-7 text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className={`${colors.bg} hover:opacity-90`}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function generateAIResponse(userMsg: string, context: string): { text: string; actions?: string[] } {
  const msg = userMsg.toLowerCase();
  if (msg.includes("method") || msg.includes("approach")) {
    return {
      text: `Based on the estimated value and ${context}, I recommend **Open Competitive Tendering** as the preferred procurement method. This ensures maximum competition, transparency, and best value for money per PPDPA Section 32.`,
      actions: ["Apply this recommendation", "View policy reference", "Show alternatives"],
    };
  }
  if (msg.includes("risk")) {
    return {
      text: `Risk assessment for this ${context}:\n\n🔴 **High:** Single-source dependency\n🟡 **Medium:** Currency risk exposure\n🟢 **Low:** Regulatory compliance detected\n\nRecommended mitigation: Add performance bond clause and multi-currency payment option.`,
      actions: ["Add risk clauses", "Generate risk report", "Schedule review"],
    };
  }
  if (msg.includes("compliance") || msg.includes("require")) {
    return {
      text: `Compliance requirements for ${context}:\n\n✅ PPDPA Section 32 - Procurement Method\n✅ PPDPA Section 45 - Evaluation Criteria\n✅ PPDPA Section 67 - Award Notification\n✅ Public Procurement Regulations 2020\n\nAll requirements are met. Ready for submission.`,
      actions: ["View compliance checklist", "Generate certificate", "Run full audit"],
    };
  }
  return {
    text: `I understand you're asking about "${userMsg}" in the context of ${context}. Let me analyze this and provide relevant guidance based on PPDPA regulations and best practices.`,
    actions: ["Get more details", "View related policies", "Contact support"],
  };
}
