/**
 * NewFeaturesBanner — Quick-access strip for new platform features.
 * Enterprise design: PRIMARY (#0F172A) + WHITE only.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Send, Globe2, Bot, TrendingUp, X, ChevronRight, Zap,
} from "lucide-react";

const FEATURES = [
  {
    id: "intake",
    label: "Intake Portal",
    desc: "Single front door — AI routes any request",
    icon: Send,
    route: "/intake",
    badge: "NEW",
  },
  {
    id: "marketplace",
    label: "Supplier Marketplace",
    desc: "National verified supplier network + pricing",
    icon: Globe2,
    route: "/marketplace",
    badge: "NEW",
  },
  {
    id: "agents",
    label: "Autonomous Agents",
    desc: "151+ agents taking real-time actions",
    icon: Bot,
    route: "/agents/orchestration",
    badge: "LIVE",
  },
  {
    id: "spend",
    label: "Spend Intelligence",
    desc: "Market pricing benchmarks & savings",
    icon: TrendingUp,
    route: "/spend-intelligence",
    badge: "NEW",
  },
];

export default function NewFeaturesBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("features-banner-dismissed") === "true"; } catch { return false; }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem("features-banner-dismissed", "true"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="mb-5 rounded-xl border border-slate-200 bg-[#0F172A] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white/70" />
          <span className="text-xs font-bold text-white">4 New Platform Features</span>
          <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-full">JUST LAUNCHED</span>
        </div>
        <button onClick={dismiss} className="h-6 w-6 grid place-items-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Feature cards — horizontal scroll on mobile */}
      <div className="flex gap-2 p-3 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {FEATURES.map(f => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => navigate(f.route)}
              className="flex-shrink-0 flex items-center gap-2.5 bg-white/8 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2.5 transition-all group text-left min-w-[180px]"
            >
              <div className="h-8 w-8 rounded-lg bg-white/15 grid place-items-center flex-shrink-0">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{f.label}</span>
                  <span className="text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">{f.badge}</span>
                </div>
                <div className="text-[10px] text-white/50 truncate mt-0.5">{f.desc}</div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70 flex-shrink-0" />
            </button>
          );
        })}

        {/* Stats pill */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-3 py-2.5 min-w-[160px]">
          <Zap className="h-5 w-5 text-white/70 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">151+ Agents</div>
            <div className="text-[10px] text-white/60">94.2% autonomous rate</div>
            <div className="text-[10px] text-white/40">Government ERP Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
}
