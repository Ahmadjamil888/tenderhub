/**
 * AutonomousAgentsPage — AI Agent Orchestration Center (LIVE)
 * 151+ AI agents with real-time autonomous actions.
 * - Live feed fires every 4–9 seconds with toast notification
 * - KPI counters increment in real-time
 * - Activity bars update every second
 * - Agent "thinking" pulse indicator
 * - Relative timestamps ("Just now", "34s ago", etc.)
 * - Toast popup for every new critical action
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { pushNotification } from "@/lib/local-store";
import {
  Bot, Zap, CheckCircle2, AlertTriangle, Play, Pause, RefreshCw,
  Activity, Shield, TrendingUp, X, Cpu, Wifi, WifiOff,
  ChevronDown, Sparkles, Terminal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionType = "auto" | "alert" | "escalate" | "approve" | "flag";

interface AgentAction {
  id: string;
  agent: string;
  module: string;
  action: string;
  result: string;
  type: ActionType;
  ts: number;           // Unix ms timestamp
  confidence: number;
  notified?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTION_META: Record<ActionType, { bg: string; text: string; border: string; dot: string; label: string }> = {
  auto:     { bg:"bg-slate-50",    text:"text-[#0F172A]",    border:"border-slate-200",    dot:"bg-[#0F172A]",    label:"Auto-Executed" },
  alert:    { bg:"bg-slate-50",   text:"text-[#0F172A]",   border:"border-slate-200",   dot:"bg-[#0F172A]",   label:"Alert Sent"    },
  escalate: { bg:"bg-slate-50",  text:"text-[#0F172A]",  border:"border-slate-200",  dot:"bg-[#0F172A]",  label:"Escalated"     },
  approve:  { bg:"bg-slate-50", text:"text-[#0F172A]", border:"border-slate-200", dot:"bg-[#0F172A]", label:"Auto-Approved"  },
  flag:     { bg:"bg-red-50",     text:"text-red-700",     border:"border-red-200",     dot:"bg-red-500",     label:"Flagged"       },
};

const AGENT_GROUPS = [
  { label:"Procurement", color:"bg-[#0F172A]",    dot:"#334155", count:11, active:10 },
  { label:"Finance",     color:"bg-[#0F172A]",  dot:"#334155", count:12, active:12 },
  { label:"Inventory",   color:"bg-[#0F172A]",    dot:"#14b8a6", count:14, active:13 },
  { label:"Assets",      color:"bg-[#0F172A]",  dot:"#f97316", count:11, active:11 },
  { label:"Vendors",     color:"bg-[#0F172A]", dot:"#475569", count:15, active:14 },
  { label:"Projects",    color:"bg-[#0F172A]",   dot:"#64748B", count:8,  active:8  },
  { label:"HR & Staff",  color:"bg-[#0F172A]",    dot:"#ec4899", count:6,  active:6  },
  { label:"Compliance",  color:"bg-red-500",     dot:"#DC2626", count:8,  active:8  },
  { label:"Utility",     color:"bg-[#0F172A]",    dot:"#06b6d4", count:18, active:17 },
  { label:"Analytics",   color:"bg-[#0F172A]",  dot:"#6366f1", count:12, active:12 },
];
const TOTAL_AGENTS  = AGENT_GROUPS.reduce((s, g) => s + g.count, 0);
const ACTIVE_AGENTS = AGENT_GROUPS.reduce((s, g) => s + g.active, 0);

// ─── Live action pool — fired randomly ───────────────────────────────────────
const LIVE_POOL: Omit<AgentAction, "id" | "ts" | "notified">[] = [
  { agent:"Fraud Detection Agent",         module:"Procurement", type:"flag",     confidence:94, action:"Scanning new bid submissions — ZW-PRA-2026-00187",              result:"Abnormal pricing detected on 2 bids. Referred to CPO for review." },
  { agent:"Compliance Checker",            module:"Compliance",  type:"approve",  confidence:98, action:"Validating tender package — ZW-PRA-2026-00188",                 result:"All 14 compliance checks passed. Tender auto-approved for publication." },
  { agent:"Supplier Verification Agent",   module:"Vendors",     type:"auto",     confidence:96, action:"Processing KYC batch — 6 new vendor applications",              result:"5 vendors auto-approved. 1 flagged for manual review (missing tax cert)." },
  { agent:"Budget Guardian AI",            module:"Finance",     type:"escalate", confidence:97, action:"Monitoring budget burn rates across all 18 ministries",          result:"Health Ministry at 91% — exceeded warning threshold. CFO notified." },
  { agent:"Contract Intelligence Agent",   module:"Contracts",   type:"alert",    confidence:93, action:"Scanning contract expiry dates — next 60 days",                 result:"6 contracts expiring. Renewal notices auto-drafted and queued." },
  { agent:"SLA Guardian Agent",            module:"Performance", type:"escalate", confidence:97, action:"Checking SLA adherence — 47 active contracts",                  result:"Highveld Engineering 4 days behind. Penalty notice auto-drafted." },
  { agent:"Demand Forecast Agent",         module:"Inventory",   type:"auto",     confidence:91, action:"Updating 30-day demand forecast for 892 stock items",           result:"14 items below reorder point. 3 purchase orders auto-generated." },
  { agent:"Award Recommendation Agent",    module:"Procurement", type:"auto",     confidence:90, action:"Preparing award package — ZW-PRA-2026-00186",                   result:"Zimbabwe Pharma Holdings recommended. Package sent to adjudication board." },
  { agent:"Vendor Risk Intelligence",      module:"Vendors",     type:"alert",    confidence:91, action:"Daily risk score update — 12,847 registered vendors",           result:"2 vendors risk profile changed. Sable ICT moved to Medium risk." },
  { agent:"Predictive Maintenance Agent",  module:"Assets",      type:"alert",    confidence:89, action:"Scanning 312 assets for failure probability",                   result:"Generator at Parirenyatwa Hospital: 88% failure risk in 10 days. Maintenance scheduled." },
  { agent:"Anti-Corruption AI",            module:"Governance",  type:"flag",     confidence:89, action:"Analysing vendor relationship networks and evaluation patterns", result:"Possible conflict of interest: 2 evaluators linked to preferred vendor." },
  { agent:"Inventory Chief Intelligence",  module:"Inventory",   type:"auto",     confidence:95, action:"Monitoring critical medical supply levels across 12 hospitals",  result:"ARV stock critically low at Mpilo Hospital. Emergency order raised." },
  { agent:"Audit AI",                      module:"Audit",       type:"flag",     confidence:95, action:"Continuous audit trail analysis — all procurement records",      result:"3 unauthorized budget transfers detected. Audit finding raised." },
  { agent:"Compliance Checker",            module:"Compliance",  type:"auto",     confidence:98, action:"PPDPA method validation — 8 new requisitions",                  result:"All 8 within approved thresholds. No deviations." },
  { agent:"Treasury AI",                   module:"Finance",     type:"auto",     confidence:93, action:"Cash flow optimization — government payment queue",              result:"Payment queue reordered. USD 2.4M released for priority contracts." },
  { agent:"Performance Scoring Agent",     module:"Performance", type:"auto",     confidence:95, action:"Generating monthly vendor scorecards",                          result:"34 scorecards generated. 4 vendors below 60% threshold — warnings issued." },
  { agent:"Shortage Prevention Agent",     module:"Inventory",   type:"escalate", confidence:94, action:"Monitoring stock levels vs predicted demand — 5 categories",    result:"Critical shortage predicted for surgical gloves in 8 days. Urgent order triggered." },
  { agent:"Document Intelligence Agent",   module:"Projects",    type:"auto",     confidence:95, action:"Processing 5 new project documents — Victoria Falls Airport",   result:"148 clauses extracted. 2 milestone dates added to tracking system." },
  { agent:"Fraud Investigator AI",         module:"Finance",     type:"flag",     confidence:91, action:"Analysing invoice patterns — Ministry of Transport",             result:"Possible duplicate payment detected: INV-2026-4821 & INV-2026-4822 same amount." },
  { agent:"Revenue Assurance AI",          module:"Finance",     type:"alert",    confidence:92, action:"Checking revenue collection against targets — Q2 2026",         result:"ZIMRA revenue 8% below Q2 target. Escalated to Minister of Finance." },
];

// ─── Initial actions (pre-loaded) ────────────────────────────────────────────
function buildInitial(): AgentAction[] {
  const now = Date.now();
  return [
    { id:"i1",  agent:"Fraud Detection Agent",        module:"Procurement", type:"flag",     confidence:94, ts:now-12000,   action:"Analysed 14 new bids for ZW-PRA-2026-00184",             result:"Flagged 2 abnormally low bids — referred to CPO",            notified:true },
    { id:"i2",  agent:"Compliance Checker",           module:"Compliance",  type:"approve",  confidence:98, ts:now-85000,   action:"Validated tender documents — ZW-PRA-2026-00185",         result:"All 12 compliance checks passed. Auto-approved for publish.", notified:true },
    { id:"i3",  agent:"Supplier Verification Agent",  module:"Vendors",     type:"auto",     confidence:96, ts:now-200000,  action:"Processed KYC batch — 8 vendor applications",            result:"7 auto-approved. 1 flagged for manual review.",              notified:true },
    { id:"i4",  agent:"Contract Intelligence Agent",  module:"Contracts",   type:"alert",    confidence:93, ts:now-430000,  action:"Scanned 3 new contracts — CN-2026-0421 to 0423",         result:"Extracted 312 obligations. 2 non-standard clauses flagged.", notified:true },
    { id:"i5",  agent:"Budget Guardian AI",           module:"Finance",     type:"escalate", confidence:97, ts:now-680000,  action:"Monitored burn rates across 18 departments",             result:"Infrastructure Division at 88% — near ceiling. Alert sent.", notified:true },
    { id:"i6",  agent:"SLA Guardian Agent",           module:"Performance", type:"escalate", confidence:97, ts:now-820000,  action:"Checked 47 active contracts for SLA compliance",         result:"3 contractors behind schedule. Penalty notices drafted.",    notified:true },
    { id:"i7",  agent:"Award Recommendation Agent",   module:"Procurement", type:"auto",     confidence:90, ts:now-1180000, action:"Generated award package — ZW-PRA-2026-00180",            result:"Zimbabwe Pharma Holdings recommended. Package sent.",        notified:true },
    { id:"i8",  agent:"Inventory Chief Intelligence", module:"Inventory",   type:"auto",     confidence:95, ts:now-1620000, action:"Predicted stock depletion — 4 critical medical items",  result:"Auto-generated 4 purchase orders. Total: USD 84,200.",       notified:true },
    { id:"i9",  agent:"Predictive Maintenance Agent", module:"Assets",      type:"alert",    confidence:89, ts:now-2040000, action:"Scanned 312 assets for failure risk",                   result:"2 generators flagged — 90%+ failure probability in 14 days.",notified:true },
    { id:"i10", agent:"Anti-Corruption AI",           module:"Governance",  type:"flag",     confidence:89, ts:now-2480000, action:"Analysed vendor relationship networks",                  result:"Conflict of interest pattern detected — 2 evaluators.",      notified:true },
  ];
}

// ─── Relative timestamp ───────────────────────────────────────────────────────
function relativeTime(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 5)   return "Just now";
  if (sec < 60)  return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

// ─── Activity chart — 12 bars updating live ───────────────────────────────────
function ActivityBars({ actionsPerHour }: { actionsPerHour: number[] }) {
  const max = Math.max(...actionsPerHour, 1);
  const hours = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","Now"];
  return (
    <div>
      <div className="text-[11px] text-black/40 mb-2">Actions per hour (last 24h) — live</div>
      <div className="flex items-end gap-0.5 h-14">
        {actionsPerHour.map((v, i) => {
          const isNow = i === actionsPerHour.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${isNow ? "bg-[#0F172A] animate-pulse" : "bg-slate-200 hover:bg-slate-400"}`}
                style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
                title={`${v} actions`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-black/25 mt-1">
        {["00:00", "06:00", "12:00", "18:00", "Now"].map(h => <span key={h}>{h}</span>)}
      </div>
    </div>
  );
}

// ─── Thinking agent indicator ─────────────────────────────────────────────────
function ThinkingAgent({ agent }: { agent: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200">
      <div className="h-7 w-7 rounded-lg bg-[#0f172a] grid place-items-center flex-shrink-0">
        <Bot className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-[#0F172A]">{agent}</span>
        <span className="text-xs text-[#0F172A] ml-2">processing…</span>
      </div>
      <div className="flex gap-1">
        {[0,150,300].map(d => (
          <span key={d} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay:`${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AutonomousAgentsPage() {
  const [actions, setActions]         = useState<AgentAction[]>(buildInitial);
  const [paused, setPaused]           = useState(false);
  const [selected, setSelected]       = useState<AgentAction | null>(null);
  const [filterType, setFilterType]   = useState<"All" | ActionType>("All");
  const [tick, setTick]               = useState(0);                     // forces timestamp re-render
  const [thinking, setThinking]       = useState<string | null>(null);   // agent name currently "thinking"
  const [totalToday, setTotalToday]   = useState(73291);                 // live-incrementing counter
  const [alertCount, setAlertCount]   = useState(37);
  const [online, setOnline]           = useState(true);
  const [activityBars, setActivityBars] = useState<number[]>(() => {
    // 24 hours, last bar = current hour (live)
    const base = [42,38,31,28,24,21,30,55,82,108,124,138,152,148,165,172,184,190,188,185,176,168,142,0];
    base[base.length - 1] = Math.floor(Math.random() * 80 + 60);
    return base;
  });

  // ── Tick every second — updates relative timestamps ──
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Update last bar of activity chart every 30s ──
  useEffect(() => {
    const t = setInterval(() => {
      setActivityBars(prev => {
        const next = [...prev];
        next[next.length - 1] = Math.min(next[next.length - 1] + Math.floor(Math.random() * 8 + 2), 250);
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // ── Live feed — fires every 4–9 seconds ──
  useEffect(() => {
    if (paused) return;

    const fire = () => {
      const pick = LIVE_POOL[Math.floor(Math.random() * LIVE_POOL.length)];

      // 1. Show thinking indicator for 1.5s
      setThinking(pick.agent);

      setTimeout(() => {
        setThinking(null);

        const newAction: AgentAction = {
          ...pick,
          id: `live-${Date.now()}-${Math.random()}`,
          ts: Date.now(),
          notified: false,
        };

        setActions(prev => [newAction, ...prev.slice(0, 29)]);
        setTotalToday(v => v + Math.floor(Math.random() * 12 + 3));

        // Increment alert counter for flag/escalate/alert types
        if (["flag","escalate","alert"].includes(pick.type)) {
          setAlertCount(v => v + 1);
        }

        // Toast for critical actions
        if (pick.type === "flag" || pick.type === "escalate") {
          toast(`🤖 ${pick.agent}: ${pick.result}`, pick.type === "flag" ? "warning" : "error");
          if (!newAction.notified) {
            pushNotification(`Agent Action: ${pick.result}`, pick.type === "flag" ? "warning" : "error");
          }
        }
      }, 1500);
    };

    // Random interval 4–9 seconds
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 5000 + 4000);
      return setTimeout(() => { fire(); scheduleNext(); }, delay);
    };
    const t = scheduleNext();
    return () => clearTimeout(t);
  }, [paused]);

  const filtered = filterType === "All" ? actions : actions.filter(a => a.type === filterType);

  const typeCounts = actions.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="AI & Automation"
        process="Autonomous AI Agents"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Header */}
        <PageHeader
          title="Autonomous Agent Orchestration"
          description="151+ AI agents operating autonomously. Agents auto-approve, auto-route, auto-alert and auto-escalate in real-time — no manual click required."
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                {online
                  ? <><Wifi className="h-3.5 w-3.5 text-slate-600" /><span className="text-[#0F172A] font-semibold">Live</span></>
                  : <><WifiOff className="h-3.5 w-3.5 text-red-500" /><span className="text-red-600 font-semibold">Offline</span></>
                }
                <span className={`h-2 w-2 rounded-full ${paused ? "bg-slate-400" : "bg-slate-400 animate-pulse"}`} />
              </div>
              <button
                onClick={() => setPaused(v => !v)}
                className={`h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${
                  paused ? "bg-[#0F172A] text-white hover:bg-[#0F172A]" : "bg-slate-100 text-[#0F172A] hover:bg-slate-200"
                }`}
              >
                {paused ? <><Play className="h-4 w-4" />Resume</> : <><Pause className="h-4 w-4" />Pause Feed</>}
              </button>
              <button
                onClick={() => { toast("All agent models refreshed", "info"); setActivityBars(prev => { const n=[...prev]; n[n.length-1]=0; return n; }); }}
                className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />Refresh
              </button>
            </div>
          }
        />

        {/* KPIs — live */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total AI Agents"     value={String(TOTAL_AGENTS)}          delta={`${ACTIVE_AGENTS} active now`}   icon={Bot}           color="blue"   />
          <KpiCard label="Actions Today"       value={totalToday.toLocaleString()}    delta="updating live"                   icon={Zap}           color="violet" />
          <KpiCard label="Autonomous Rate"     value="94.2%"                          delta="no human intervention"           icon={Cpu}           color="green"  />
          <KpiCard label="Alerts Generated"    value={String(alertCount)}             delta="critical + medium"               icon={AlertTriangle} color="red"    positive={false} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

          {/* Agent Groups sidebar */}
          <Card>
            <CardHeader title="Agent Groups" subtitle="By module — active / total">
              <div className="mt-1 text-[10px] text-black/40">Total: {TOTAL_AGENTS} agents · {ACTIVE_AGENTS} online</div>
            </CardHeader>
            <div className="p-3 space-y-1.5">
              {AGENT_GROUPS.map(g => (
                <div key={g.label} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black leading-tight">{g.label}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full ${g.color} rounded-full transition-all`} style={{ width:`${(g.active/g.count)*100}%` }} />
                      </div>
                      <span className="text-[10px] text-black/40 flex-shrink-0">{g.active}/{g.count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-[#0F172A]">ON</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Health + Activity chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="Live System Health" subtitle="Real-time agent performance metrics">
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#0F172A] font-semibold">
                  <Wifi className="h-3 w-3" />All systems operational
                </div>
              </CardHeader>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label:"Avg Confidence",     value:"93.2%",               color:"text-[#0F172A]",    bg:"bg-slate-50",    icon:Cpu            },
                  { label:"Auto-Approval Rate", value:"94.2%",               color:"text-[#0F172A]", bg:"bg-slate-50", icon:CheckCircle2   },
                  { label:"Fraud Detected",     value:"23",                  color:"text-red-600",     bg:"bg-red-50",     icon:Shield         },
                  { label:"Alerts Today",       value:String(alertCount),    color:"text-[#0F172A]",   bg:"bg-slate-50",   icon:AlertTriangle  },
                  { label:"Escalations",        value:"18",                  color:"text-[#0F172A]",  bg:"bg-slate-50",  icon:TrendingUp     },
                  { label:"Models Updated",     value:"2h ago",              color:"text-[#0F172A]",  bg:"bg-slate-50",  icon:RefreshCw      },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className={`${m.bg} rounded-xl p-3 flex items-center gap-2.5`}>
                      <Icon className={`h-5 w-5 flex-shrink-0 ${m.color}`} />
                      <div>
                        <div className={`text-base font-bold ${m.color}`}>{m.value}</div>
                        <div className="text-[10px] text-black/50 leading-tight">{m.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 pb-4">
                <ActivityBars actionsPerHour={activityBars} />
              </div>
            </Card>
          </div>
        </div>

        {/* Live Actions Feed */}
        <Card>
          <CardHeader
            title="Live Autonomous Actions Feed"
            subtitle="Real-time — agents act without any human click"
          >
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {/* Type filters with live counts */}
              {(["All","auto","approve","alert","escalate","flag"] as const).map(f => {
                const count = f === "All" ? actions.length : (typeCounts[f] ?? 0);
                const meta  = f !== "All" ? ACTION_META[f as ActionType] : null;
                return (
                  <button key={f} onClick={() => setFilterType(f)}
                    className={`h-7 px-2.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1.5 ${
                      filterType === f
                        ? "bg-black text-white"
                        : `border hover:bg-gray-50 ${meta ? `${meta.border} ${meta.text} ${meta.bg}` : "border-black/10"}`
                    }`}>
                    {meta && <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />}
                    {f === "All" ? "All Actions" : ACTION_META[f as ActionType].label}
                    <span className="bg-white/50 px-1 rounded text-[9px] font-bold">{count}</span>
                  </button>
                );
              })}
              <div className="ml-auto text-[10px] text-black/40 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                {paused ? "Paused" : `Updates every 4–9s`}
              </div>
            </div>
          </CardHeader>

          {/* Thinking indicator */}
          {thinking && !paused && <ThinkingAgent agent={thinking} />}

          <div className="divide-y divide-black/5 max-h-[520px] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-black/30">No actions of this type yet.</div>
            )}
            {filtered.map((a, idx) => {
              const meta = ACTION_META[a.type];
              const isNew = Date.now() - a.ts < 6000;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-gray-50/80 ${isNew ? "bg-slate-50/40" : ""}`}
                >
                  {/* Agent icon — pulse if new */}
                  <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 mt-0.5 transition-colors ${isNew ? "bg-[#0F172A]" : "bg-[#0f172a]"}`}>
                    <Bot className={`h-4 w-4 ${isNew ? "text-white animate-pulse" : "text-slate-400"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-bold text-black">{a.agent}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${meta.bg} ${meta.text} ${meta.border}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-black/35 bg-gray-100 px-1.5 py-0.5 rounded">{a.module}</span>
                      {isNew && (
                        <span className="text-[9px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 rounded animate-pulse">NEW</span>
                      )}
                    </div>
                    <div className="text-xs text-black/55 mb-0.5 leading-relaxed">{a.action}</div>
                    <div className="text-xs font-semibold text-black leading-relaxed">{a.result}</div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-black/35">{relativeTime(a.ts)}</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-12 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-[#0F172A] rounded-full" style={{ width:`${a.confidence}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-black/50">{a.confidence}%</span>
                    </div>
                    <span className="text-[9px] text-black/25">#{String(idx+1).padStart(3,"0")}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feed footer */}
          <div className="px-5 py-2.5 border-t border-black/5 flex items-center justify-between bg-gray-50/60">
            <span className="text-[10px] text-black/40">
              Showing {filtered.length} actions · {actions.length} total in session
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-black/40">
              <span className={`h-1.5 w-1.5 rounded-full ${paused ? "bg-slate-400" : "bg-slate-400 animate-pulse"}`} />
              {paused ? "Feed paused — click Resume" : "Feed live · auto-updating"}
            </div>
          </div>
        </Card>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className={`px-5 py-3 flex items-center gap-3 ${ACTION_META[selected.type].bg} border-b ${ACTION_META[selected.type].border}`}>
              <div className="h-9 w-9 rounded-xl bg-[#0f172a] grid place-items-center flex-shrink-0">
                <Bot className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${ACTION_META[selected.type].text}`}>{selected.agent}</div>
                <div className="text-[11px] text-black/50">{selected.module} · {relativeTime(selected.ts)}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${ACTION_META[selected.type].bg} ${ACTION_META[selected.type].text} ${ACTION_META[selected.type].border}`}>
                {ACTION_META[selected.type].label}
              </span>
              <button onClick={() => setSelected(null)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-black/10 text-black/40">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1.5">Action Taken</div>
                <div className="text-sm text-black leading-relaxed bg-gray-50 rounded-xl p-3">{selected.action}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1.5">Result / Outcome</div>
                <div className={`text-sm font-semibold leading-relaxed rounded-xl p-3 border ${ACTION_META[selected.type].bg} ${ACTION_META[selected.type].text} ${ACTION_META[selected.type].border}`}>
                  {selected.result}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-[#0F172A]">{selected.confidence}%</div>
                  <div className="text-[10px] text-black/40 mt-0.5">AI Confidence</div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[#0F172A] rounded-full" style={{ width:`${selected.confidence}%` }} />
                  </div>
                </div>
                <div className={`rounded-xl p-3 text-center border ${ACTION_META[selected.type].bg} ${ACTION_META[selected.type].border}`}>
                  <div className={`text-sm font-bold leading-tight ${ACTION_META[selected.type].text}`}>{ACTION_META[selected.type].label}</div>
                  <div className="text-[10px] text-black/40 mt-1">Action Type</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-sm font-bold text-black">Autonomous</div>
                  <div className="text-[10px] text-black/40 mt-1">Zero clicks</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-black/8 flex gap-2">
              <button
                onClick={() => {
                  toast(`Action ${selected.id} acknowledged`, "success");
                  pushNotification(`Acknowledged: ${selected.result}`, "success");
                  setSelected(null);
                }}
                className="flex-1 h-9 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Acknowledge
              </button>
              <button
                onClick={() => {
                  toast(`Escalation raised for: ${selected.agent}`, "warning");
                  setSelected(null);
                }}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Escalate
              </button>
              <button onClick={() => setSelected(null)} className="h-9 px-4 rounded-lg border border-black/10 text-sm hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
