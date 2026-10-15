/**
 * BriefingPage — 9-tab AI Executive Briefing module.
 * Each tab has its own route; tab strip uses URL-based active state.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import ZimbabweMapTab from "@/components/ZimbabweMapTab";
import BriefingDashboard from "@/components/BriefingDashboard";
import { BIContent } from "@/pages/BIDashboardPage";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  CartesianGrid, Legend, LineChart, Line, ComposedChart,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
} from "recharts";
import {
  Sparkles, Play, Pause, SkipBack, SkipForward, Square,
  TrendingUp, TrendingDown, AlertTriangle,
  Bell, BarChart3, Globe2, MapPin, LayoutDashboard, FileText,
  Clock, Volume2, VolumeX, Radio, Cpu, Calendar, Mail,
  X, ChevronRight, Users, Building2, Download, Printer,
  Edit3, CheckCircle, AlertCircle, Plus, Save, Send,
  Monitor, Target, DollarSign, ShieldAlert, Activity,
  Package, Truck, Fuel, Zap, Droplets, Stethoscope,
  BookOpen, Wrench, AlertOctagon, CheckCircle2, XCircle,
  Flame, Filter,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import HODBriefingTab from "@/components/HODBriefingTab";
import MyBriefingTiles from "@/components/MyBriefingTiles";
import NewFeaturesBanner from "@/components/NewFeaturesBanner";
import PriorityBriefTab from "@/components/PriorityBriefTab";
import PerformanceOversightTab from "@/components/PerformanceOversightTab";
import BudgetIntelligenceCentre from "@/components/BudgetIntelligenceCentre";
import AIAssistantPanel from "@/components/AIAssistantPanel";

// ── Lazy import: Projects GIS map pulled from GisMapPage ─────────────────
// We replicate the ZimbabweMap component inline here so the Briefing tab
// has the full interactive map without the AppShell wrapper.
import { useEffect as useEffectGis, useRef as useRefGis, useState as useStateGis, useCallback as useCallbackGis } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ALL_GIS_PINS } from "@/lib/gis-data";
import { ZW_PROVINCES, spendIntensity, choroColor, TOTAL_SPEND_M } from "@/lib/zw-provinces-geo";
import type { GisPin } from "@/components/GisMapView";
import GisMapView from "@/components/GisMapView";
import markerIcon2xGis from "leaflet/dist/images/marker-icon-2x.png";
import markerIconGis    from "leaflet/dist/images/marker-icon.png";
import markerShadowGis  from "leaflet/dist/images/marker-shadow.png";

// ── Utilities ─────────────────────────────────────────────────────────────
function getTimeGreeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

// ── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { id: "notes",       label: "Notes & Alerts",         Icon: Bell            },
  { id: "dashboard",   label: "Visual Dashboard",        Icon: BarChart3       },
  { id: "video",       label: "AI Briefing Video",       Icon: Sparkles        },
  { id: "executive",   label: "Executive BI",            Icon: Globe2          },
  { id: "projects",    label: "Projects & Tenders",      Icon: MapPin          },
  { id: "mybriefing",  label: "My Briefing",             Icon: LayoutDashboard },
  { id: "meeting",     label: "Meeting Board Pack",      Icon: FileText        },
  { id: "notesdeck",   label: "Briefing Notes Deck",     Icon: FileText        },
  { id: "trading",     label: "Live Trading Board",      Icon: Monitor         },
  { id: "procoverview",label: "Procurement Overview",    Icon: Target          },
  { id: "economic",    label: "Economic Performance",    Icon: TrendingUp      },
  { id: "projectsgis", label: "Projects GIS",            Icon: MapPin          },
  { id: "hodbriefing", label: "HOD Briefing",            Icon: Building2       },
  { id: "prioritybrief",label: "Priority Brief",         Icon: AlertOctagon    },
  { id: "perfoverview", label: "Performance Oversight",  Icon: Activity        },
  { id: "budgetintel",  label: "Budget Intelligence",    Icon: DollarSign      },
];

// ── Video tab data ─────────────────────────────────────────────────────────
const BRIEFING_TOPICS = [
  { id: 1, title: "Welcome & System Status",        duration: "0:45", type: "intro"   },
  { id: 2, title: "Procurement Overview",           duration: "1:20", type: "report"  },
  { id: 3, title: "Budget Performance",             duration: "1:15", type: "finance" },
  { id: 4, title: "Active Tenders & Deadlines",     duration: "0:55", type: "tender"  },
  { id: 5, title: "Risk Alerts & Flags",            duration: "1:05", type: "risk"    },
  { id: 6, title: "Vendor Performance",             duration: "0:50", type: "vendor"  },
  { id: 7, title: "Your Tasks & Urgent Items",      duration: "0:40", type: "tasks"   },
  { id: 8, title: "AI Insights & Recommendations", duration: "1:10", type: "ai"      },
];

const NARRATION_SCRIPTS: Record<number, string> = {
  0: "Welcome to your AI-generated executive briefing. I am your AI intelligence assistant. Today's date is July 1st 2026. The system is fully operational with all AI agents active. Let me walk you through the key metrics on your dashboard.",
  1: "Looking at the Procurement Overview. National spend year-to-date stands at USD 2.84 billion, up 6.2 percent. There are 1,287 active tenders across all ministries.",
  2: "On Budget Performance: Budget utilisation is at 67.8 percent, which is on track. However, Infrastructure Division is approaching 88 percent utilisation.",
  3: "Regarding Active Tenders and Deadlines: The Solar Mini-Grid installation tender closes in 48 hours. The Highway Rehabilitation tender worth USD 88 million was recently published.",
  4: "Risk Alerts and Flags: There are 23 open fraud alerts. 4 ghost vendor transactions have been detected this week. Asset wastage of USD 2.1 million has been flagged.",
  5: "Vendor Performance Update: The Compliance Score stands at 94.2 percent. VEN-00476 Granite Construction has been blacklisted due to high risk classification.",
  6: "Your Tasks and Urgent Items: You have 12 overdue tasks requiring immediate attention. Q3 Budget submission is due in 3 days.",
  7: "AI Insights and Recommendations: Recommend immediate review of bid rotation pattern flagged for VEN-00476 and VEN-00481. Briefing complete. Have a productive day.",
};

const ALERTS = [
  { type: "critical", msg: "Ghost vendor pattern detected — VEN-00476 & VEN-00481" },
  { type: "warning",  msg: "Budget ceiling approaching: Infrastructure Div at 88%" },
  { type: "warning",  msg: "3 ARV medicines at critically low stock levels" },
  { type: "critical", msg: "Solar Mini-Grid tender closing in 48 hours — no award yet" },
  { type: "info",     msg: "12 overdue tasks require immediate attention" },
  { type: "critical", msg: "Asset wastage of USD 2.1M flagged in Transport Dept" },
  { type: "info",     msg: "Q3 Budget submission due in 3 days" },
  { type: "warning",  msg: "4 ghost vendor transactions detected this week" },
];

// ── Animated waveform bars ─────────────────────────────────────────────────
function VoiceWaveform({ active, bars = 28 }: { active: boolean; bars?: number }) {
  const [heights, setHeights] = useState(() => Array.from({ length: bars }, () => 4));
  useEffect(() => {
    if (!active) { setHeights(Array.from({ length: bars }, () => 4)); return; }
    const id = setInterval(() => {
      setHeights(Array.from({ length: bars }, (_, i) => {
        const base = 4 + Math.sin(Date.now() / 200 + i * 0.6) * 12;
        return Math.max(3, Math.min(32, base + (Math.random() - 0.5) * 10));
      }));
    }, 80);
    return () => clearInterval(id);
  }, [active, bars]);
  return (
    <div className="flex items-center justify-center gap-[2px]" style={{ height: 40 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h, borderRadius: 2,
          background: active ? `hsl(${200 + i * 5}, 90%, ${50 + h}%)` : "rgba(255,255,255,0.15)",
          transition: "height 80ms ease",
        }} />
      ))}
    </div>
  );
}

function MiniSparkline({ color, points }: { color: string; points: number[] }) {
  const w = 80, h = 32;
  const min = Math.min(...points), max = Math.max(...points), range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(v => h - ((v - min) / range) * (h - 4) - 2);
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")} fill="none" stroke={color} strokeWidth={1.5} />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill={color} />
    </svg>
  );
}

// ── Language definitions (world + African) ────────────────────────────────
const LANGUAGES = [
  { code: "en",  label: "English",     lang: "en-GB" },
  { code: "fr",  label: "French",      lang: "fr-FR" },
  { code: "es",  label: "Spanish",     lang: "es-ES" },
  { code: "pt",  label: "Portuguese",  lang: "pt-PT" },
  { code: "ar",  label: "Arabic",      lang: "ar-SA" },
  { code: "zh",  label: "Chinese",     lang: "zh-CN" },
  { code: "hi",  label: "Hindi",       lang: "hi-IN" },
  { code: "ru",  label: "Russian",     lang: "ru-RU" },
  { code: "de",  label: "German",      lang: "de-DE" },
  { code: "it",  label: "Italian",     lang: "it-IT" },
  { code: "ja",  label: "Japanese",    lang: "ja-JP" },
  { code: "ko",  label: "Korean",      lang: "ko-KR" },
  { code: "tr",  label: "Turkish",     lang: "tr-TR" },
  { code: "sw",  label: "Swahili",     lang: "sw-KE" },
  { code: "zu",  label: "Zulu",        lang: "en-ZA" },
  { code: "xh",  label: "Xhosa",       lang: "en-ZA" },
  { code: "af",  label: "Afrikaans",   lang: "af-ZA" },
  { code: "yo",  label: "Yoruba",      lang: "en-NG" },
  { code: "ig",  label: "Igbo",        lang: "en-NG" },
  { code: "ha",  label: "Hausa",       lang: "en-NG" },
  { code: "am",  label: "Amharic",     lang: "am-ET" },
  { code: "so",  label: "Somali",      lang: "so-SO" },
  { code: "om",  label: "Oromo",       lang: "en-ET" },
  { code: "sn",  label: "Shona",       lang: "en-ZW" },
  { code: "ts",  label: "Xitsonga",    lang: "en-ZA" },
  { code: "tn",  label: "Setswana",    lang: "en-ZA" },
  { code: "rw",  label: "Kinyarwanda", lang: "en-RW" },
  { code: "rn",  label: "Kirundi",     lang: "en-BI" },
  { code: "lg",  label: "Luganda",     lang: "en-UG" },
  { code: "nd",  label: "Ndebele",     lang: "en-ZW" },
];

// ── Searchable language picker for the AI briefing video ────────────────
function LanguagePicker({ language, onChange }: { language: string; onChange: (l: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];
  const filtered = q ? LANGUAGES.filter(l => l.label.toLowerCase().includes(q.toLowerCase())) : LANGUAGES;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="px-3 py-1 text-[10px] font-bold border border-white/20 bg-[#0F172A]/90 text-white hover:bg-white hover:text-[#0F172A] transition-colors rounded">
        🌐 {current.label} ▾
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-56 bg-[#0F172A] border border-white/20 rounded shadow-2xl z-50">
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search language…"
            className="w-full h-8 px-2 text-[11px] bg-white/5 border-b border-white/10 text-white placeholder:text-white/40 focus:outline-none" />
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(l => (
              <button key={l.code} onClick={() => { onChange(l.code); setOpen(false); setQ(""); }}
                className={`w-full text-left px-3 py-1.5 text-[11px] font-medium transition-colors ${language === l.code ? "bg-white text-[#0F172A]" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                {l.label}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-3 py-2 text-[11px] text-white/40">No match</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const NARRATION_INTRO: Record<number, string> = {
  0: "Topic one. Welcome and System Status. ",
  1: "Topic two. Procurement Overview. ",
  2: "Topic three. Budget Performance. ",
  3: "Topic four. Active Tenders and Deadlines. ",
  4: "Topic five. Risk Alerts and Flags. ",
  5: "Topic six. Vendor Performance. ",
  6: "Topic seven. Your Tasks and Urgent Items. ",
  7: "Topic eight. AI Insights and Recommendations. ",
};

// ── Scrolling KPI ticker for the left panel ───────────────────────────────
const VIDEO_KPIS = [
  { label: "National Spend YTD",     value: "USD 2.84B", delta: "+6.2%",  up: true  },
  { label: "Active Tenders",         value: "1,287",     delta: "+42",    up: true  },
  { label: "Budget Utilisation",     value: "67.8%",     delta: "+1.4%",  up: true  },
  { label: "Compliance Score",       value: "94.2%",     delta: "+0.4pt", up: true  },
  { label: "Fraud Alerts Open",      value: "23",        delta: "+3",     up: false },
  { label: "AI Savings YTD",         value: "USD 184M",  delta: "+12M",   up: true  },
  { label: "Vendor Performance",     value: "87.3%",     delta: "-0.8%",  up: false },
  { label: "Contract Value Active",  value: "USD 1.2B",  delta: "+84M",   up: true  },
  { label: "Ghost Vendors Blocked",  value: "7",         delta: "+2",     up: false },
  { label: "Procurement Backlog",    value: "34 items",  delta: "-6",     up: true  },
  { label: "Treasury Cash Pos.",     value: "USD 428M",  delta: "-14M",   up: false },
  { label: "Revenue Collected",      value: "98.8%",     delta: "+1.2%",  up: true  },
];

// ── Flash hazard topics for right panel ───────────────────────────────────
const FLASH_TOPICS = [
  { title: "Ghost Vendor Detection",           minutes: "REF: FA-2026-041 · 3 vendors flagged" },
  { title: "Budget Ceiling Alert",             minutes: "Infrastructure Div 88% — Q3 at risk" },
  { title: "Solar Mini-Grid Tender Deadline",  minutes: "Closes in 48 hrs — no award issued" },
  { title: "ARV Medicine Stock Critical",      minutes: "3 lines below threshold — MOHCC urgent" },
  { title: "AI Briefing: Spend Intelligence",  minutes: "YTD USD 2.84B · +6.2% vs last year" },
];

// ── AI Video Panel component ───────────────────────────────────────────────
function AiBriefingVideoPanel({
  playing, paused, currentTopic, onPlay, onPause, onStop,
  onPrev, onNext, muted, onMuteToggle, name, language, onLanguageChange,
  onOpenAssistant,
}: {
  playing: boolean; paused: boolean; currentTopic: number;
  onPlay: () => void; onPause: () => void; onStop: () => void;
  onPrev: () => void; onNext: () => void;
  muted: boolean; onMuteToggle: () => void; name: string;
  language: string; onLanguageChange: (l: string) => void;
  onOpenAssistant: () => void;
}) {
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [captionText, setCaptionText] = useState("");
  const captionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sparkData, setSparkData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i * 0.5) * 20)
  );
  useEffect(() => {
    const id = setInterval(() => setSparkData(d => [...d.slice(1), 30 + Math.random() * 50]), 600);
    return () => clearInterval(id);
  }, []);

  const startCaption = useCallback((topicIdx: number) => {
    if (captionIntervalRef.current) clearInterval(captionIntervalRef.current);
    const intro = NARRATION_INTRO[topicIdx] ?? "";
    const script = intro + (NARRATION_SCRIPTS[topicIdx] ?? "");
    const words = script.split(" ");
    let idx = 0;
    setCaptionText(words.slice(0, 10).join(" "));
    captionIntervalRef.current = setInterval(() => {
      idx += 5;
      if (idx >= words.length) { if (captionIntervalRef.current) clearInterval(captionIntervalRef.current); return; }
      setCaptionText(words.slice(Math.max(0, idx - 3), idx + 10).join(" "));
    }, 1600);
  }, []);

  const speak = useCallback((topicIdx: number) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const intro = NARRATION_INTRO[topicIdx] ?? "";
    const fullScript = intro + (NARRATION_SCRIPTS[topicIdx] ?? "");
    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = 0.9; utterance.pitch = 1.05; utterance.volume = muted ? 0 : 1;
    const selectedLang = LANGUAGES.find(l => l.code === language)?.lang ?? "en-GB";
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => v.lang === selectedLang) ??
      voices.find(v => v.lang.startsWith(selectedLang.split("-")[0])) ??
      voices.find(v => v.lang.startsWith("en")) ??
      voices[0];
    if (preferred) utterance.voice = preferred;
    // Auto-advance to next topic — continuous audio
    utterance.onend = () => { if (topicIdx < BRIEFING_TOPICS.length - 1) onNext(); };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted, language]);

  const startTimer = useCallback(() => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    setElapsed(0);
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, []);
  const stopTimer = useCallback(() => {
    if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null; }
  }, []);

  useEffect(() => {
    if (playing && !paused) { speak(currentTopic); startCaption(currentTopic); startTimer(); }
    else {
      if ("speechSynthesis" in window) {
        if (paused) window.speechSynthesis.pause();
        else { window.speechSynthesis.cancel(); stopTimer(); setCaptionText(""); }
      }
      if (!paused) stopTimer();
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (captionIntervalRef.current) clearInterval(captionIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, paused, currentTopic]);

  const totalDuration = BRIEFING_TOPICS[currentTopic]?.duration ?? "1:00";
  const [tMin, tSec] = totalDuration.split(":").map(Number);
  const totalSec = tMin * 60 + tSec;
  const progress = Math.min(1, elapsed / Math.max(totalSec, 1));
  const elapsedFmt = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  // Scrolling KPI ticker
  const [kpiOffset, setKpiOffset] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setKpiOffset(o => (o + 1) % VIDEO_KPIS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const visibleKpis = [...VIDEO_KPIS, ...VIDEO_KPIS].slice(kpiOffset, kpiOffset + 5);

  // Flash hazard topic rotation
  const [flashIdx, setFlashIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFlashIdx(i => (i + 1) % FLASH_TOPICS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const [topicSearch, setTopicSearch] = useState("");
  const [filterMinistry, setFilterMinistry] = useState("All Ministries");
  const [filterFY, setFilterFY] = useState("FY2026");
  const MINISTRY_OPTS = ["All Ministries","Finance","Health","Education","Transport","ICT","Energy"];
  const FY_OPTS = ["FY2026","FY2025","FY2024"];
  const filteredFlashTopics = FLASH_TOPICS.filter(t =>
    topicSearch.length < 2 || t.title.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#050d1a] overflow-hidden">
      {/* ── Main stage ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #0d2545 0%, #050d1a 80%)" }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(37,99,235,0.04) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(37,99,235,0.04) 60px)",
        }} />

        {/* ── LEFT PANEL — AI Assistant button + scrolling KPIs ─────── */}
        <div className="relative z-20 w-44 flex-shrink-0 flex flex-col gap-2 p-3">
          <button onClick={onOpenAssistant}
            className="flex items-center gap-1.5 bg-[#2563eb] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-2 rounded-lg hover:bg-slate-400 transition-colors shadow-[0_0_14px_3px_rgba(37,99,235,0.6)] w-full">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            CLICK FOR AI ASSISTANT TO POP UP
          </button>
          <div className="flex-1 overflow-hidden border border-[#2563eb]/40 bg-[#0a1628]/80 rounded-lg p-2 flex flex-col gap-1.5">
            <div className="text-[8px] font-bold uppercase tracking-widest text-[#2563eb] mb-1">SCROLL UP DATA, FIGURES, INDICATORS…</div>
            {visibleKpis.map((kpi, i) => (
              <div key={`${kpi.label}-${i}`} className="flex items-center justify-between gap-1 border-b border-[#2563eb]/10 pb-1 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] text-white/50 truncate">{kpi.label}</div>
                  <div className="text-[11px] font-bold font-mono text-white">{kpi.value}</div>
                </div>
                <div className={`flex items-center gap-0.5 flex-shrink-0 text-[10px] font-bold ${kpi.up ? "text-[#00e676]" : "text-[#ff1744]"}`}>
                  {kpi.up ? <span>▲</span> : <span>▼</span>}{kpi.delta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTRE — AI orb + waveform + captions ─────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 relative">
          {playing && !paused && (
            <div className="absolute top-3 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-1.5 bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> AI LIVE
              </div>
            </div>
          )}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 mt-6">
            <LanguagePicker language={language} onChange={onLanguageChange} />
          </div>
          <div className="relative mb-3 mt-12">
            <div className="h-20 w-20 rounded-full flex items-center justify-center bg-[#0F172A]"
              style={{ boxShadow: playing && !paused ? "0 0 40px 12px rgba(15,23,42,0.35)" : "0 0 16px 4px rgba(15,23,42,0.15)" }}>
              <Sparkles className="h-9 w-9 text-white" />
            </div>
            {playing && !paused && <div className="absolute -inset-2 rounded-full border border-[#0F172A]/25" />}
          </div>
          <VoiceWaveform active={playing && !paused} bars={32} />
          <div className="mt-2 text-[11px] font-semibold tracking-wider px-4 text-center"
            style={{ color: playing && !paused ? "#0F172A" : "#ffffff60" }}>
            {!playing ? BRIEFING_TOPICS[currentTopic]?.title ?? "Procurement Overview" : paused ? "⏸ PAUSED" : `● ${BRIEFING_TOPICS[currentTopic]?.title ?? "AI NARRATING"}`}
          </div>
          {playing && captionText && (
            <div className="mt-2 max-w-sm text-center text-[12px] leading-relaxed text-white/95 bg-[#050d1a]/90 px-4 py-2 border border-[#2563eb]/30 font-medium">
              {captionText}
            </div>
          )}
          {!playing && (
            <p className="mt-3 text-white/50 text-[10px] text-center max-w-xs px-4">
              {NARRATION_SCRIPTS[currentTopic]?.slice(0, 120)}…
            </p>
          )}
        </div>

        {/* ── RIGHT PANEL — Flash Hazard topics ──────────────────────── */}
        <div className="relative z-20 w-52 flex-shrink-0 flex flex-col gap-2 p-3">
          <div className="border border-[#2563eb]/50 bg-[#0a1628]/80 rounded-lg p-2.5 flex flex-col gap-1.5 h-full">
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#2563eb] border-b border-[#2563eb]/30 pb-1 flex-shrink-0">
              ⚡ FLASH HAZARD — TOPIC AT PLAY
            </div>
            {FLASH_TOPICS.map((t, i) => (
              <div key={i} onClick={() => setFlashIdx(i)}
                className={`rounded px-2 py-1.5 cursor-pointer flex-shrink-0 transition-colors ${i === flashIdx ? "bg-[#2563eb]/20 border border-[#2563eb]/40" : "border border-transparent hover:bg-white/5"}`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-[#2563eb]">TOPIC {i + 1}</span>
                  {i === flashIdx && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <div className="text-[10px] font-bold text-white leading-snug">{t.title}</div>
                <div className="text-[9px] text-white/45 mt-0.5 leading-tight">{t.minutes}</div>
              </div>
            ))}
            <div className="mt-auto border-t border-[#2563eb]/20 pt-2">
              <div className="text-[8px] font-bold uppercase tracking-widest text-[#2563eb] mb-1">SEARCH TOPIC</div>
              <input value={topicSearch} onChange={e => setTopicSearch(e.target.value)}
                placeholder="Type to search…"
                className="w-full bg-[#0a1628] border border-[#2563eb]/30 text-white text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[#2563eb] placeholder:text-white/25" />
              {topicSearch.length >= 2 && (
                <div className="mt-1 space-y-0.5">
                  {filteredFlashTopics.length === 0
                    ? <div className="text-[9px] text-white/40 italic px-1">No topics found</div>
                    : filteredFlashTopics.map((t, i) => (
                      <div key={i} onClick={() => { setFlashIdx(FLASH_TOPICS.indexOf(t)); setTopicSearch(""); }}
                        className="text-[9px] text-[#2563eb] px-1 truncate cursor-pointer hover:text-white">→ {t.title}</div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{/* end main stage */}

      {/* ── Caption bar ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#020b18] border-t border-[#2563eb]/25 px-6 py-2 min-h-[36px] flex items-center justify-center">
        {captionText && playing
          ? <p className="text-[12px] text-white font-medium text-center leading-relaxed max-w-3xl">{captionText}</p>
          : <p className="text-[10px] text-white/30 italic text-center">Subtitles will appear here during playback…</p>
        }
      </div>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0a1628] px-4 pt-1.5 pb-0.5">
        <div className="relative bg-white/10 h-1 overflow-hidden">
          {BRIEFING_TOPICS.map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 border-r border-[#0a1628]"
              style={{ left: `${(i / BRIEFING_TOPICS.length) * 100}%`, width: `${100 / BRIEFING_TOPICS.length}%`,
                background: i < currentTopic ? "#0F172A" : i === currentTopic ? `rgba(41,184,197,${0.3 + progress * 0.7})` : "transparent" }} />
          ))}
          <div className="absolute top-0 bottom-0 bg-[#2563eb] transition-all"
            style={{ left: `${(currentTopic / BRIEFING_TOPICS.length) * 100}%`, width: `${(progress / BRIEFING_TOPICS.length) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] font-mono text-white/55">{elapsedFmt}</span>
          <span className="text-[9px] font-mono text-white/55">{totalDuration}</span>
        </div>
      </div>

      {/* ── Transport controls + AUTO NEXT + Filters ────────────────────── */}
      <div className="flex-shrink-0 bg-[#0a1628] border-t border-white/10 px-4 py-2 flex items-center gap-2">
        <button onClick={onPrev} className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all rounded"><SkipBack className="h-4 w-4" /></button>
        <button onClick={playing && !paused ? onPause : onPlay}
          className="h-9 w-9 flex items-center justify-center bg-[#2563eb] text-white hover:bg-[#0F172A] transition-all rounded"
          style={{ boxShadow: "0 0 12px 3px rgba(41,184,197,0.4)" }}>
          {playing && !paused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={onStop} className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all rounded"><Square className="h-4 w-4" /></button>
        <button onClick={onNext} className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all rounded"><SkipForward className="h-4 w-4" /></button>
        <button onClick={onMuteToggle} className="h-8 w-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all rounded ml-1">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none ml-1 flex-1">
          {BRIEFING_TOPICS.map((t, i) => (
            <button key={t.id} title={t.title}
              className={`flex-shrink-0 h-1.5 rounded-full transition-all ${i === currentTopic ? "bg-[#2563eb]" : i < currentTopic ? "bg-[#2563eb]/50" : "bg-white/20 hover:bg-white/40"}`}
              style={{ width: i === currentTopic ? 24 : 12 }} />
          ))}
        </div>
        {/* AUTO NEXT TOPIC label */}
        <div className="flex items-center gap-1.5 text-[#2563eb] text-[10px] font-bold whitespace-nowrap flex-shrink-0 border border-[#2563eb]/30 px-2 py-1 rounded">
          <Play className="h-3 w-3" /> AUTO NEXT TOPIC ▶ PLAY
        </div>
        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-shrink-0 border-l border-white/10 pl-2">
          <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)}
            className="bg-[#0a1628] border border-[#2563eb]/30 text-white text-[9px] px-1.5 py-1 rounded focus:outline-none max-w-[90px]">
            {MINISTRY_OPTS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filterFY} onChange={e => setFilterFY(e.target.value)}
            className="bg-[#0a1628] border border-[#2563eb]/30 text-white text-[9px] px-1.5 py-1 rounded focus:outline-none">
            {FY_OPTS.map(y => <option key={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1 text-[#2563eb] text-[9px] font-bold">
            <Cpu className="h-3 w-3" /> AI GEN
          </div>
        </div>
      </div>

      {/* ── Bottom label bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#07101e] border-t border-[#2563eb]/15 px-4 py-1 flex items-center justify-between">
        <div className="text-[9px] font-bold text-[#ff1744] uppercase tracking-widest flex items-center gap-2">
          <Radio className="h-3 w-3 animate-pulse" /> AI GENERATED BRIEFING · CONTINUOUS AUDIO · LIVE SUBTITLES <Radio className="h-3 w-3 animate-pulse" />
        </div>
        <div className="text-[9px] font-bold text-[#2563eb] uppercase tracking-widest">
          FILTER: MINISTRY / FINANCIAL YEAR / DATE, TIME
        </div>
      </div>

      {/* AI Assistant prompt bar */}
      <div className="flex-shrink-0 bg-[#050d1a] border-t border-[#2563eb]/30 px-4 py-2 flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-[#2563eb] flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <input placeholder="AI ASSISTANT PROMPT BAR — ask anything about the briefing…"
          className="flex-1 bg-transparent text-[10px] text-white/80 placeholder:text-white/30 focus:outline-none" />
        <button className="text-[#2563eb] text-[10px] font-bold hover:text-slate-400 transition-colors flex-shrink-0">SEND</button>
      </div>
    </div>
  );
}

// ── Tab 1: Notes & Alerts — Auto-scrolling hazard feed with topic rotation ──
const HAZARD_TOPICS: {
  topic: string;
  alerts: { level: "critical" | "warning" | "caution" | "info"; msg: string; source: string }[];
}[] = [
  {
    topic: "Fraud & Integrity Watch",
    alerts: [
      { level: "critical", msg: "Ghost vendor pattern detected — VEN-00476 & VEN-00481 alternating wins", source: "/vendors" },
      { level: "critical", msg: "Asset wastage of USD 2.1M flagged in Transport Department", source: "/audit" },
      { level: "critical", msg: "Bid rotation scheme suspected in MOTID roads tenders", source: "/ai-analytics" },
      { level: "warning",  msg: "4 ghost vendor transactions detected this week", source: "/vendors" },
      { level: "warning",  msg: "Collusion signals — 3 vendors sharing directors", source: "/vendors" },
    ],
  },
  {
    topic: "Budget & Financial Pressure",
    alerts: [
      { level: "critical", msg: "Infrastructure Division at 88% budget utilisation — Q3 still ahead", source: "/budget" },
      { level: "warning",  msg: "Ministry of Health commitments exceed cash releases by USD 4.2M", source: "/finance" },
      { level: "caution",  msg: "Foreign currency exposure on 3 pending contracts", source: "/contracts" },
      { level: "info",     msg: "Q3 Budget submission due in 3 days", source: "/budget" },
    ],
  },
  {
    topic: "Tender Deadlines",
    alerts: [
      { level: "critical", msg: "Solar Mini-Grid tender closing in 48 hours — no award yet", source: "/tenders" },
      { level: "warning",  msg: "Highway Rehab Lot 3 evaluation running 6 days late", source: "/evaluations" },
      { level: "caution",  msg: "ARV framework technical scoring pending sign-off", source: "/evaluations" },
      { level: "info",     msg: "12 overdue procurement tasks require attention", source: "/tenders" },
    ],
  },
  {
    topic: "Service Delivery",
    alerts: [
      { level: "critical", msg: "3 ARV medicines at critically low stock levels — MOHCC", source: "/inventory" },
      { level: "warning",  msg: "Ambulance shortages: 74% shortfall (184/248)", source: "/analytics" },
      { level: "caution",  msg: "Hospital bed occupancy 15% above capacity", source: "/analytics" },
      { level: "info",     msg: "Fuel availability at 94% nationally", source: "/analytics" },
    ],
  },
];

const HAZARD_STYLE = {
  critical: { border: "border-red-500",    bg: "bg-red-50",    text: "text-red-900",    dot: "bg-red-500",    icon: "🔴", glow: "shadow-[0_0_12px_2px_rgba(239,68,68,0.45)] ring-1 ring-red-400/60"   },
  warning:  { border: "border-slate-200",  bg: "bg-slate-50",  text: "text-[#0F172A]",  dot: "bg-[#0F172A]",  icon: "⚠️", glow: "shadow-[0_0_10px_2px_rgba(245,158,11,0.40)] ring-1 ring-amber-400/50" },
  caution:  { border: "border-slate-200",bg: "bg-slate-50",text: "text-[#0F172A]",dot: "bg-[#0F172A]",icon: "🟢", glow: ""                                                                       },
  info:     { border: "border-slate-200",    bg: "bg-slate-50",    text: "text-[#0F172A]",    dot: "bg-slate-200",    icon: "ℹ️", glow: ""                                                                       },
} as const;

function NotesAlertsTab({ greeting, today }: { greeting: string; today: string }) {
  const navigate = useNavigate();
  const [topicIdx, setTopicIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTopic = HAZARD_TOPICS[topicIdx];

  // Auto-rotate topics every 12 seconds — clean setInterval, no animation events
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTopicIdx(i => (i + 1) % HAZARD_TOPICS.length);
    }, 12000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Duplicate alerts for seamless scroll loop
  const doubled = [...currentTopic.alerts, ...currentTopic.alerts];

  return (
    <div className="flex-1 overflow-hidden bg-white p-4 flex flex-col">
      {/* Header banner */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-3 border-b-2 border-slate-200 flex items-center justify-between rounded-t-xl">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">AI Executive Briefing — Intelligence Feed</p>
          <h1 className="text-lg font-bold">{greeting}</h1>
          <p className="text-xs text-white/60">{today}</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Now Presenting</div>
          <div className="text-sm font-bold text-white mt-0.5">{currentTopic.topic}</div>
          <div className="text-[10px] text-white/50 mt-0.5">Topic {topicIdx + 1} of {HAZARD_TOPICS.length} · Auto-rotate 12s</div>
        </div>
      </div>

      {/* Scroll-up alerts feed — smooth CSS animation */}
      <div className="flex-1 overflow-hidden bg-white border border-slate-200 relative"
        style={{ minHeight: 0 }}>
        {/* Gradient fades */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white z-10 pointer-events-none" />

        <div className="tender-scroll-track" style={{ animationDuration: "28s" }}>
          {doubled.map((a, i) => {
            const s = HAZARD_STYLE[a.level];
            return (
              <div key={`${topicIdx}-${i}`}
                className={`flex items-center gap-3 border-l-4 ${s.border} ${s.bg} px-4 py-3 mx-3 my-2 rounded-r-lg ${s.glow}`}>
                <span className="text-base flex-shrink-0">{s.icon}</span>
                <span className={`h-2 w-2 rounded-full ${s.dot} flex-shrink-0 ${a.level === "critical" ? "animate-pulse" : ""}`} />
                <span className={`text-xs font-semibold flex-1 ${s.text}`}>{a.msg}</span>
                <button
                  onClick={() => navigate(a.source)}
                  className={`flex-shrink-0 h-7 px-3 text-white text-[10px] font-bold uppercase tracking-wider transition-colors rounded-lg ${
                    a.level === "critical" ? "bg-red-600 hover:bg-red-700 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]" :
                    a.level === "warning"  ? "bg-[#0F172A] hover:bg-[#0F172A] shadow-[0_0_8px_2px_rgba(245,158,11,0.45)]" :
                    "bg-[#0F172A] hover:bg-[#0F172A]"
                  }`}>
                  View →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic navigator */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 py-3 border-t border-slate-200 mt-2">
        {HAZARD_TOPICS.map((t, i) => (
          <button key={i}
            onClick={() => {
              setTopicIdx(i);
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => setTopicIdx(idx => (idx + 1) % HAZARD_TOPICS.length), 12000);
            }}
            className={`h-2 rounded-full transition-all ${i === topicIdx ? "w-8 bg-[#0F172A]" : "w-2 bg-slate-200 hover:bg-slate-400"}`}
            title={t.topic} />
        ))}
        <span className="text-[10px] text-slate-600 font-medium ml-2">{currentTopic.topic}</span>
      </div>
    </div>
  );
}


// ── Tab 2: Visual Dashboard ────────────────────────────────────────────────
function VisualDashboardTab() {
  const kpiCards = [
    { label: "NATIONAL SPEND YTD", value: "USD 2.84B", delta: "+6.2% YoY", up: true  },
    { label: "SAVINGS",            value: "USD 184M",  delta: "+11.4%",    up: true  },
    { label: "COMPLIANCE",         value: "94.2%",     delta: "+1.8 pts",  up: true  },
    { label: "OPEN FRAUD ALERTS",  value: "23",        delta: "+3 today",  up: false },
  ];
  const monthlyData = [
    { month: "Jan", spend: 220, savings: 8  }, { month: "Feb", spend: 235, savings: 10 },
    { month: "Mar", spend: 240, savings: 9  }, { month: "Apr", spend: 250, savings: 12 },
    { month: "May", spend: 265, savings: 14 }, { month: "Jun", spend: 280, savings: 15 },
  ];
  const ministrySpend = [
    { name: "Defence",     value: 450 }, { name: "Transport",   value: 350 },
    { name: "Agriculture", value: 300 }, { name: "Health",      value: 280 },
    { name: "Finance",     value: 200 }, { name: "Education",   value: 165 },
  ];
  const riskData = [
    { name: "Low",      value: 24 }, { name: "Medium", value: 10 },
    { name: "High",     value: 4  }, { name: "Critical",value: 4  },
  ];
  const riskColors = ["#475569", "#64748B", "#475569", "#DC2626"];
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628] p-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((k, i) => (
          <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">{k.label}</div>
            <div className="text-xl font-black text-white">{k.value}</div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${k.up ? "text-emerald-400" : "text-red-400"}`}>
              {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f1f3d] rounded-lg border border-white/10 overflow-hidden" style={{ height: 420 }}>
          <div className="px-3 py-2 border-b border-white/10 text-xs font-bold text-white/80 uppercase tracking-widest">Live Scrolling KPI Stream</div>
          <KpiScrollTicker height={376} theme="dark" speed={1} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f1f3d] rounded-lg border border-white/10 p-4">
            <div className="text-xs font-bold text-white/60 uppercase mb-2">Monthly Spend &amp; Savings (USD M)</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#ffffff80" }} />
                <YAxis tick={{ fontSize: 10, fill: "#ffffff80" }} />
                <Tooltip contentStyle={{ background: "#0f1f3d", border: "1px solid #ffffff20", color: "#fff" }} />
                <Area type="monotone" dataKey="spend" stroke="#0F172A" fill="#2563eb22" name="Spend" />
                <Area type="monotone" dataKey="savings" stroke="#475569" fill="#33415522" name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f1f3d] rounded-lg border border-white/10 p-3">
              <div className="text-xs font-bold text-white/60 uppercase mb-2">Spend by Ministry (USD M)</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={ministrySpend} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#ffffff60" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#ffffff60" }} width={60} />
                  <Tooltip contentStyle={{ background: "#0f1f3d", border: "1px solid #ffffff20", color: "#fff" }} />
                  <Bar dataKey="value" fill="#1D4ED8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#0f1f3d] rounded-lg border border-white/10 p-3">
              <div className="text-xs font-bold text-white/60 uppercase mb-2">Risk Distribution (%)</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50}
                    label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {riskData.map((_, i) => <Cell key={i} fill={riskColors[i % riskColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f1f3d", border: "1px solid #ffffff20", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: AI Briefing Video wrapper ──────────────────────────────────────
function VideoTab({ name }: { name: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!playing || paused) return;
    const dur = BRIEFING_TOPICS[currentTopic]?.duration ?? "1:00";
    const [m, s] = dur.split(":").map(Number);
    const ms = (m * 60 + s) * 1000;
    const timer = setTimeout(() => {
      if (currentTopic < BRIEFING_TOPICS.length - 1) setCurrentTopic(p => p + 1);
      else setPlaying(false);
    }, ms);
    return () => clearTimeout(timer);
  }, [playing, currentTopic, paused]);

  const handlePlay  = () => { setPlaying(true); setPaused(false); };
  const handlePause = () => setPaused(true);
  const handleStop  = () => { setPlaying(false); setPaused(false); if ("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  const handlePrev  = () => { handleStop(); setTimeout(() => setCurrentTopic(p => Math.max(0, p - 1)), 50); };
  const handleNext  = () => { handleStop(); setTimeout(() => setCurrentTopic(p => Math.min(BRIEFING_TOPICS.length - 1, p + 1)), 50); };

  // AI chatbox state
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "I'm your AI Briefing Assistant. Ask me anything about today's briefing — KPIs, alerts, tenders, budgets, or vendor risk." },
  ]);
  const sendChat = () => {
    const q = chatInput.trim();
    if (!q) return;
    setChatMsgs(m => [...m, { role: "user", text: q }]);
    setChatInput("");
    setTimeout(() => {
      const reply = `Based on today's briefing: ${q.toLowerCase().includes("spend") ? "YTD national spend is USD 2.84B (+6.2% YoY), driven mainly by Infrastructure (38%) and Health (22%)." : q.toLowerCase().includes("risk") || q.toLowerCase().includes("fraud") ? "23 open fraud alerts. Priority: ghost-vendor pattern VEN-00476 / VEN-00481 and bid rotation in MOTID roads." : q.toLowerCase().includes("budget") ? "Utilisation is 67.8% nationally. Infrastructure Division is running hot at 88% with Q3 ahead — recommend reallocation review." : "I've cross-checked your query against active tenders, contracts, and audit logs. Recommend opening the relevant workbench for a deeper drill-down."}`;
      setChatMsgs(m => [...m, { role: "ai", text: reply }]);
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050d1a]">
      {/* Full-height video */}
      <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: "60%" }}>
        <AiBriefingVideoPanel
          playing={playing} paused={paused} currentTopic={currentTopic}
          onPlay={handlePlay} onPause={handlePause} onStop={handleStop}
          onPrev={handlePrev} onNext={handleNext}
          muted={muted} onMuteToggle={() => setMuted(m => !m)} name={name}
          language={language} onLanguageChange={setLanguage}
          onOpenAssistant={() => setChatMsgs(m => [...m, { role: "ai", text: "AI Assistant opened. How can I help with today's briefing?" }])}
        />
      </div>

      {/* AI chatbox underneath */}
      <div className="flex-shrink-0 bg-[#0a1628] border-t-2 border-slate-200 flex flex-col" style={{ height: 220 }}>
        <div className="flex-shrink-0 px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">Ask Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System — About This Briefing</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {chatMsgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] text-xs px-3 py-2 rounded ${m.role === "user" ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/90 border border-white/10"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 border-t border-white/10 p-2 flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Ask about today's KPIs, alerts, tenders, budgets…"
            className="flex-1 h-9 px-3 bg-[#050d1a] border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-slate-200" />
          <button onClick={sendChat} disabled={!chatInput.trim()}
            className="h-9 px-4 bg-[#0F172A] text-white text-xs font-bold hover:bg-[#0F172A] disabled:opacity-40 uppercase tracking-wider">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Tab 4: Executive BI — real BIDashboard embedded inline ───────────────
function ExecutiveBITab() {
  // Wrap in a div that ensures pointer events are not blocked
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ isolation: "isolate" }}>
      <BIContent />
    </div>
  );
}

function ProjectsTendersTab() {
  const [filterMinistry, setFilterMinistry] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  // Slow auto-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);

  // Slow automatic scroll effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isScrolling) return;
    let animId: number;
    let lastTime = 0;
    const speed = 0.4; // px per ms — slow scroll
    const step = (ts: number) => {
      if (lastTime) {
        const delta = ts - lastTime;
        el.scrollTop += speed * delta;
        // Reset to top when reaching bottom
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
          el.scrollTop = 0;
        }
      }
      lastTime = ts;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isScrolling]);

  const projects = [
    { name: "Solar Mini-Grids (12 Clinics)",    ministry: "MOE",   dept: "Energy",    value: "USD 14.8M", status: "On Track", province: "Matabeleland",     progress: 72, year: "2026/27" },
    { name: "Highway Rehabilitation Lot 3",      ministry: "MOTID", dept: "Transport", value: "USD 88M",   status: "At Risk",  province: "Mash East",        progress: 38, year: "2026/27" },
    { name: "ARV Supply Framework",              ministry: "MOH",   dept: "Health",    value: "USD 12.4M", status: "On Track", province: "National",          progress: 85, year: "2026/27" },
    { name: "Water Treatment Upgrade Bulawayo",  ministry: "ZINWA", dept: "Water",     value: "USD 31M",   status: "Troubled", province: "Bulawayo",          progress: 21, year: "2025/26" },
    { name: "School Textbooks 2026/27",          ministry: "MOPSE", dept: "Education", value: "USD 8.2M",  status: "On Track", province: "National",          progress: 60, year: "2026/27" },
  ];
  const tenders = [
    { ref: "ZW-PRA-2026-00184", title: "Solar Mini-Grid Installation",   ministry: "MOE",   dept: "Energy",    value: "USD 14.8M", closes: "2026-07-03", status: "Active", year: "2026/27" },
    { ref: "ZW-MOTID-2026-088", title: "Highway Rehabilitation Lot 3",   ministry: "MOTID", dept: "Transport", value: "USD 88M",   closes: "2026-07-18", status: "Active", year: "2026/27" },
    { ref: "ZW-MOH-2026-0124",  title: "ARV Medicines Framework 2026",   ministry: "MOH",   dept: "Health",    value: "USD 12.4M", closes: "2026-07-25", status: "Active", year: "2026/27" },
    { ref: "ZW-ZINWA-2026-031", title: "Water Treatment Plant Upgrade",  ministry: "ZINWA", dept: "Water",     value: "USD 31M",   closes: "2026-08-01", status: "Active", year: "2025/26" },
    { ref: "ZW-ZIMRA-2026-045", title: "Tax Admin System Phase II",      ministry: "ZIMRA", dept: "ICT",       value: "USD 45M",   closes: "2026-08-15", status: "Active", year: "2026/27" },
  ];

  const ministries = ["All", ...Array.from(new Set([...projects.map(p=>p.ministry), ...tenders.map(t=>t.ministry)]))];
  const depts = ["All", ...Array.from(new Set([...projects.map(p=>p.dept), ...tenders.map(t=>t.dept)]))];
  const years = ["All", "2026/27", "2025/26"];

  const filtP = projects.filter(p =>
    (filterMinistry === "All" || p.ministry === filterMinistry) &&
    (filterDept === "All" || p.dept === filterDept) &&
    (filterYear === "All" || p.year === filterYear)
  );
  const filtT = tenders.filter(t =>
    (filterMinistry === "All" || t.ministry === filterMinistry) &&
    (filterDept === "All" || t.dept === filterDept) &&
    (filterYear === "All" || t.year === filterYear)
  );

  const projectStatusStyle: Record<string, string> = {
    "On Track": "bg-emerald-100 text-emerald-800",
    "At Risk":  "bg-amber-100 text-amber-800",
    "Troubled": "bg-red-100 text-red-700",
  };
  const inp = "h-8 px-2 rounded border border-slate-200 bg-slate-50 text-xs text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400";

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0f2a3d]">
      {/* Dark teal filter bar — new theme */}
      <div className="flex-shrink-0 bg-[#0d3349] px-4 py-2 flex items-center gap-3 flex-wrap border-b border-slate-200/40">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Filters</span>
        <select value={filterMinistry} onChange={e=>setFilterMinistry(e.target.value)} className={inp}>
          {ministries.map(m=><option key={m}>{m}</option>)}
        </select>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className={inp}>
          {depts.map(d=><option key={d}>{d}</option>)}
        </select>
        <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} className={inp}>
          {years.map(y=><option key={y}>{y}</option>)}
        </select>
        {/* Scroll toggle */}
        <button
          onClick={() => setIsScrolling(v => !v)}
          className={`ml-auto flex items-center gap-1.5 h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${isScrolling ? "bg-[#0F172A]/20 text-slate-500 border border-slate-200/40" : "bg-white/8 text-white/50 border border-white/10"}`}
        >
          {isScrolling ? "⏸ Pause Scroll" : "▶ Auto Scroll"}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
        onMouseEnter={() => setIsScrolling(false)}
        onMouseLeave={() => setIsScrolling(true)}
      >
        <div>
          <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <span className="h-5 w-1.5 bg-emerald-400 rounded-full inline-block" />
            Active Projects ({filtP.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-[#0d3349] text-white/50">
                <tr>{["Project","Ministry","Dept","Value","Status","Province","Progress"].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtP.map((p,i) => (
                  <tr key={i} className="border-b border-white/8 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                    <td className="px-4 py-3 text-white/70">{p.ministry}</td>
                    <td className="px-4 py-3 text-white/70">{p.dept}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{p.value}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${projectStatusStyle[p.status]??""}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-white/70">{p.province}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden" style={{minWidth:60}}>
                          <div className="h-full rounded-full" style={{width:`${p.progress}%`,background:p.progress>60?"#10B981":p.progress>30?"#F59E0B":"#DC2626"}}/>
                        </div>
                        <span className="text-[10px] text-white/60 w-8">{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <span className="h-5 w-1.5 bg-blue-400 rounded-full inline-block" />
            Active Tenders ({filtT.length})
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-[#0d3349] text-white/50">
                <tr>{["Ref","Title","Ministry","Dept","Value","Closes","Status"].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtT.map((t,i) => (
                  <tr key={i} className="border-b border-white/8 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-blue-300">{t.ref}</td>
                    <td className="px-4 py-3 font-semibold text-white">{t.title}</td>
                    <td className="px-4 py-3 text-white/70">{t.ministry}</td>
                    <td className="px-4 py-3 text-white/70">{t.dept}</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{t.value}</td>
                    <td className="px-4 py-3 font-mono text-white/60">{t.closes}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 6: My Briefing — delegates to MyBriefingTiles component ───────────
function MyBriefingTab() {
  return <MyBriefingTiles />;
}

// ── DEAD CODE below — kept for reference, not rendered ────────────────────
function _OldMyBriefingTab_UNUSED() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm"];
  const calEvents = [
    { col: 1, row: 1, label: "Executive...",   color: "bg-[#0F172A]"   },
    { col: 2, row: 2, label: "Procuram...",    color: "bg-slate-400"   },
    { col: 3, row: 3, label: "Vendor p...",    color: "bg-[#0F172A]" },
    { col: 4, row: 1, label: "Ministry v...",  color: "bg-[#0F172A]"   },
    { col: 3, row: 5, label: "Board pre...",   color: "bg-[#0F172A]"    },
  ];
  const [todos, setTodos] = useState([
    { time: "9:00am",  task: "Approve Solar Mini-Grid award",           done: false },
    { time: "11:00am", task: "Review ZACC referral pack",               done: false },
    { time: "2:00pm",  task: "Sign INV-2026-4821 payment authority",    done: true  },
    { time: "10:00am", task: "Prep Q3 budget submission",               done: false },
    { time: "3:30pm",  task: "Cabinet committee — Infrastructure brief",done: false },
  ]);
  const mails = [
    { from: "Treasury Secretary",   subject: "Q3 Budget submission",          time: "07:22" },
    { from: "Chief Procurement",    subject: "Solar Mini-Grid award rec.",     time: "08:14" },
    { from: "Auditor-General",      subject: "ZACC referral — VEN-00476",     time: "08:41" },
    { from: "PS Health",            subject: "ARV stockout alert",            time: "09:02" },
    { from: "World Bank Mission",   subject: "Project disbursement schedule", time: "09:35" },
  ];
  const scrollAlerts = [
    { msg: "Ghost vendor flag active — ZACC referral pending",  color: "bg-red-100 border-red-400"   },
    { msg: "Budget submission reminder — 3 days remaining",     color: "bg-slate-100 border-slate-200"},
    { msg: "Solar Mini-Grid tender closing in 48 hours",        color: "bg-red-100 border-red-400"   },
    { msg: "APIs health check OK — 10 days uptime",             color: "bg-slate-100 border-slate-200" },
    { msg: "Vendor Portal uptime alert OK for 2 days",          color: "bg-slate-100 border-slate-200" },
    { msg: "Dashboard Loads Peaking OK for 3 days",             color: "bg-slate-100 border-slate-200"},
    { msg: "Infrastructure Div approaching 88% budget limit",   color: "bg-red-100 border-red-400"   },
    { msg: "Q3 Cabinet meeting rescheduled to Friday",          color: "bg-slate-100 border-slate-200" },
  ];
  // Contact cards data
  const contacts = [
    { name: "Prof. M. Ncube",         role: "Minister of Finance",         phone: "+263 242 123 456", email: "mncube@gov.zw",    avatar: "MN", color: "bg-[#0F172A]"  },
    { name: "Dr. E. Murwira",         role: "Minister of ICT",             phone: "+263 242 234 567", email: "emurwira@gov.zw",  avatar: "EM", color: "bg-[#0F172A]"},
    { name: "Eng. F. Mhere",          role: "Minister of Energy",          phone: "+263 242 345 678", email: "fmhere@gov.zw",    avatar: "FM", color: "bg-[#0F172A]"  },
    { name: "Dr. C. Mnangagwa",       role: "Permanent Secretary",         phone: "+263 242 456 789", email: "cmnangagwa@gov.zw",avatar: "CM", color: "bg-[#0F172A]"   },
    { name: "Mr. L. Sibanda",         role: "Chief Procurement Officer",   phone: "+263 242 567 890", email: "lsibanda@praz.zw", avatar: "LS", color: "bg-[#0F172A]"  },
    { name: "Ms. T. Makoni",          role: "Treasury Secretary",          phone: "+263 242 678 901", email: "tmakoni@mof.zw",   avatar: "TM", color: "bg-[#0F172A]"},
  ];
  // Briefing cards data
  const [briefingCards, setBriefingCards] = useState([
    { id: 1, subject: "Q2 Procurement Performance Review", date: "2026-07-01", status: "Pending Review",   comments: "" },
    { id: 2, subject: "Solar Mini-Grid Tender Award Brief",date: "2026-07-02", status: "Approved",         comments: "Proceed to contract award." },
    { id: 3, subject: "Ghost Vendor ZACC Referral Brief",  date: "2026-07-03", status: "Returned",         comments: "Clarify VEN-00476 shareholding." },
    { id: 4, subject: "ARV Medicines Stockout Emergency",  date: "2026-07-04", status: "Pending Review",   comments: "" },
    { id: 5, subject: "Infrastructure Budget Overrun Rpt", date: "2026-07-05", status: "Pending Review",   comments: "" },
  ]);
  const [openBriefing, setOpenBriefing] = useState<null | typeof briefingCards[0]>(null);
  const [bcComment, setBcComment] = useState("");
  const statusColor: Record<string,string> = {
    "Approved":        "bg-slate-100 text-[#0F172A]",
    "Returned":        "bg-red-100 text-red-700",
    "Pending Review":  "bg-slate-100 text-[#0F172A]",
    "Rejected":        "bg-red-200 text-red-800",
  };

  const tileHead = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
      <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0">{icon}</div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A]">{title}</span>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#EAF4FF] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* TILE 1: Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<Calendar className="h-4 w-4 text-white"/>, "My Calendar")}
          <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns: "40px repeat(7, 1fr)", minWidth: 380 }}>
              <div />
              {days.map(d => <div key={d} className="text-center text-[9px] font-bold text-slate-600 pb-1 border-b border-slate-200">{d}</div>)}
              {hours.map((hr, rowIdx) => (
                <div key={rowIdx} className="contents">
                  <div className="text-[8px] text-slate-400 font-mono pt-1 pr-1 text-right">{hr}</div>
                  {days.map((_, colIdx) => {
                    const ev = calEvents.find(e => e.col === colIdx && e.row === rowIdx);
                    return (
                      <div key={colIdx} className="border border-slate-200 h-7 relative">
                        {ev && <div className={`absolute inset-0.5 rounded text-[8px] text-white font-semibold flex items-center px-1 truncate ${ev.color}`}>{ev.label}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TILE 2: To-Do List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<Clock className="h-4 w-4 text-white"/>, "My To-Do List")}
          <div className="space-y-2">
            {todos.map((t, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded border cursor-pointer ${t.done ? "border-slate-200 bg-slate-50/40" : "border-slate-200 bg-slate-50"}`}
                onClick={() => setTodos(ts => ts.map((x,j) => j===i ? {...x, done: !x.done} : x))}>
                <input type="checkbox" checked={t.done} readOnly className="mt-0.5 h-3.5 w-3.5 accent-blue-600 flex-shrink-0"/>
                <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 mt-0.5">{t.time}</span>
                <span className={`text-xs flex-1 ${t.done ? "line-through text-slate-400" : "text-[#0F172A] font-medium"}`}>{t.task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 3: My Mails */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<Mail className="h-4 w-4 text-white"/>, "My Mails")}
          <div className="space-y-1.5">
            {mails.map((m, i) => (
              <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                <div className="h-7 w-7 rounded-full bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-white">{m.from[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-[#0F172A] truncate">{m.from}</div>
                  <div className="text-[10px] text-slate-600 truncate">{m.subject}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{m.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 4: Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<Bell className="h-4 w-4 text-white"/>, "Alerts & Notifications")}
          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 220 }}>
            {scrollAlerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1.5 border-l-4 rounded-r text-[10px] font-medium text-gray-700 ${a.color}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />{a.msg}
              </div>
            ))}
          </div>
        </div>

        {/* TILE 5: My Contact Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<Users className="h-4 w-4 text-white"/>, "My Contact Cards")}
          <div className="grid grid-cols-2 gap-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className={`h-9 w-9 rounded-full ${c.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-[10px] font-bold text-white">{c.avatar}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#0F172A] truncate">{c.name}</div>
                  <div className="text-[9px] text-slate-600 truncate">{c.role}</div>
                  <div className="text-[9px] text-slate-400 truncate">{c.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 6: Briefing Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          {tileHead(<FileText className="h-4 w-4 text-white"/>, "Briefing Cards")}
          {openBriefing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] leading-snug flex-1 mr-2">{openBriefing.subject}</span>
                <button onClick={() => setOpenBriefing(null)} className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0"><X className="h-3.5 w-3.5 text-[#0F172A]"/></button>
              </div>
              <div className="text-[10px] text-slate-400">{openBriefing.date}</div>
              <textarea value={bcComment} onChange={e => setBcComment(e.target.value)} rows={3}
                placeholder="Minister's official comments on this briefing…"
                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 resize-none"/>
              <div className="flex gap-1.5 flex-wrap">
                {(["Approved","Rejected","Returned"] as const).map(s => (
                  <button key={s} onClick={() => {
                    setBriefingCards(bs => bs.map(b => b.id === openBriefing.id ? {...b, status: s, comments: bcComment} : b));
                    setOpenBriefing(null); setBcComment("");
                  }} className={`h-7 px-3 rounded text-[10px] font-bold flex-shrink-0 transition-colors ${s==="Approved"?"bg-[#0F172A] text-white hover:bg-[#0F172A]":s==="Rejected"?"bg-red-600 text-white hover:bg-red-700":"bg-[#0F172A] text-white hover:bg-[#0F172A]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 220 }}>
              {briefingCards.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => { setOpenBriefing(b); setBcComment(b.comments); }}>
                  <FileText className="h-4 w-4 text-slate-600 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-[#0F172A] truncate">{b.subject}</div>
                    <div className="text-[9px] text-slate-400">{b.date}</div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${statusColor[b.status]??""}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
// ── END DEAD CODE ─────────────────────────────────────────────────────────

// ── Tab 7: Meeting Board Pack ─────────────────────────────────────────────
type BoardMeeting = {
  name: string; date: string; time: string; venue: string;
  members: number; scope: string; owner: string; status: string;
  agenda: string[];
  documents: { title: string; type: string; size: string; url?: string }[];
};

// Sample PDF served from /public — used for all mock PDF documents
const SAMPLE_PDF = "/sample-board-document.pdf";

const BOARD_MEETINGS: BoardMeeting[] = [
  { name: "Annual Board Meeting", date: "2026-05-07", time: "09:00", venue: "The Country Club", members: 12, scope: "Governance", owner: "Board Chair", status: "SCHEDULED",
    agenda: ["Call to order & quorum confirmation","Adoption of previous minutes","Chairperson's report","CEO / Accounting Officer report","Financial performance — Q1 2026","Procurement performance overview","Audit & risk updates","Any other business","Close"],
    documents: [
      { title:"Board Pack Cover Letter",          type:"PDF",  size:"124 KB",  url: SAMPLE_PDF },
      { title:"Previous Minutes — Dec 2025",      type:"PDF",  size:"312 KB",  url: SAMPLE_PDF },
      { title:"Q1 Financial Statements",          type:"XLSX", size:"890 KB"                   },
      { title:"Procurement Performance Report",   type:"PDF",  size:"1.2 MB",  url: SAMPLE_PDF },
      { title:"Risk Register Q1",                 type:"PDF",  size:"445 KB",  url: SAMPLE_PDF },
    ] },
  { name: "Audit & Risk Committee", date: "2026-05-09", time: "10:30", venue: "Boardroom A, Kaguvi Building", members: 7, scope: "Audit", owner: "Auditor-General", status: "SCHEDULED",
    agenda: ["Opening & quorum","Review of internal audit findings","Ghost vendor alerts — update","External audit status","Risk register review","Fraud & forensic updates","Close"],
    documents: [
      { title:"Internal Audit Report Q1",         type:"PDF",  size:"2.1 MB",  url: SAMPLE_PDF },
      { title:"Risk Register Updated",            type:"XLSX", size:"560 KB"                   },
      { title:"Ghost Vendor Investigation Report",type:"PDF",  size:"780 KB",  url: SAMPLE_PDF },
    ] },
  { name: "Monthly Sales & Ops Review", date: "2026-05-12", time: "14:00", venue: "Virtual (Teams)", members: 18, scope: "Operations", owner: "COO", status: "SCHEDULED",
    agenda: ["KPI dashboard review","Operational bottlenecks","Procurement pipeline update","HR & staffing","IT systems status","AOB"],
    documents: [
      { title:"Monthly KPI Dashboard",            type:"PPTX", size:"3.4 MB"                   },
      { title:"Procurement Pipeline",             type:"XLSX", size:"440 KB"                   },
    ] },
  { name: "Procurement Committee", date: "2026-04-28", time: "11:00", venue: "Boardroom B", members: 9, scope: "Procurement", owner: "CPO", status: "CONCLUDED",
    agenda: ["Review of tender awards above USD 1M","Framework contract renewals","Supplier performance scores","Blacklist review","Minutes & close"],
    documents: [
      { title:"Tender Awards Summary Apr 2026",   type:"PDF",  size:"670 KB",  url: SAMPLE_PDF },
      { title:"Supplier Scorecards",              type:"XLSX", size:"1.1 MB"                   },
      { title:"Signed Minutes",                   type:"PDF",  size:"290 KB",  url: SAMPLE_PDF },
    ] },
  { name: "Strategic Priorities Retreat", date: "2026-06-02", time: "08:30", venue: "Nyanga Conference Centre", members: 24, scope: "Strategy", owner: "PS Cabinet", status: "SCHEDULED",
    agenda: ["National Development Strategy review","Ministry priority alignment","Budget envelope 2027","Procurement reform agenda","Workshop — digital transformation","Communiqué drafting","Close"],
    documents: [
      { title:"NDS Progress Report",              type:"PDF",  size:"4.2 MB",  url: SAMPLE_PDF },
      { title:"Budget Framework 2027",            type:"PDF",  size:"1.8 MB",  url: SAMPLE_PDF },
      { title:"Digital Transformation Roadmap",   type:"PPTX", size:"5.1 MB"                   },
    ] },
  { name: "Cabinet Meeting — July 2026", date: "2026-07-24", time: "09:00", venue: "Cabinet Room, Munhumutapa Building", members: 30, scope: "Cabinet", owner: "Chief Secretary to Cabinet", status: "SCHEDULED",
    agenda: ["Opening prayer & quorum","Adoption of previous minutes","Budget policy statement — July review","Infrastructure levy implementation update","SOE performance reports","Ministry priority items","Any other business","Close"],
    documents: [
      { title:"Cabinet Agenda — July 2026",       type:"PDF",  size:"480 KB",  url: SAMPLE_PDF },
      { title:"Previous Cabinet Minutes",         type:"PDF",  size:"620 KB",  url: SAMPLE_PDF },
      { title:"Budget Policy Statement",          type:"PDF",  size:"2.1 MB",  url: SAMPLE_PDF },
      { title:"SOE Performance Summary",          type:"XLSX", size:"940 KB"                   },
    ] },
  { name: "Parliamentary Questions — Finance", date: "2026-07-22", time: "14:30", venue: "Parliament Building, Harare", members: 8, scope: "Parliament", owner: "Minister of Finance", status: "SCHEDULED",
    agenda: ["Q1: Supplementary budget justification","Q2: Foreign reserve position","Q3: ZIMRA revenue shortfall","Q4: Ghost worker payroll findings","Q5: SOE dividend remittance","Q6: Debt sustainability plan","Q7: Fuel subsidy expenditure","Q8: e-Procurement rollout progress"],
    documents: [
      { title:"Parliamentary Question Register",  type:"PDF",  size:"340 KB",  url: SAMPLE_PDF },
      { title:"Draft Ministerial Responses",      type:"PDF",  size:"1.1 MB",  url: SAMPLE_PDF },
      { title:"Supporting Data Pack",             type:"XLSX", size:"780 KB"                   },
      { title:"Previous Session Hansard",         type:"PDF",  size:"2.4 MB",  url: SAMPLE_PDF },
    ] },
];

// ── Per-Document Chat + Meeting Chat ──────────────────────────────────────
type ChatMsg = { author: string; text: string; time: string; avatar: string };

function DocChatPanel({ docTitle, meetingName }: { docTitle: string; meetingName: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { author: "D. Moyo",      avatar: "DM", text: `Please review slide 3 of the ${docTitle} before the meeting.`,   time: "08:14" },
    { author: "A. Chikwanda", avatar: "AC", text: "Noted. I'll also check the budget figures on page 7.",             time: "08:31" },
    { author: "Presenter",    avatar: "PR", text: "Updated version uploaded. Please confirm receipt.",                time: "09:02" },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages(p => [...p, { author: "You", avatar: "YO", text: t, time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) }]);
    setDraft("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col h-full border-t border-gray-100">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <div className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">💬 Document Chat — {docTitle}</div>
        <div className="text-[9px] text-slate-600">{meetingName}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.map((m, i) => {
          const isMe = m.author === "You";
          return (
            <div key={i} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMe ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-600"}`}>{m.avatar}</div>
              <div className={`max-w-[80%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {!isMe && <span className="text-[9px] text-gray-400 mb-0.5 px-1">{m.author}</span>}
                <div className={`px-2.5 py-1.5 text-[11px] leading-relaxed rounded-xl ${isMe ? "bg-[#0F172A] text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>{m.text}</div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 px-3 py-2 border-t border-gray-100 flex-shrink-0">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Message about this document…"
          className="flex-1 h-8 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
        <button onClick={send} disabled={!draft.trim()}
          className="h-8 w-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center hover:bg-[#0F172A] disabled:opacity-30 flex-shrink-0">
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MeetingChatPanel({ meetingName, members }: { meetingName: string; members: number }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { author: "Board Chair",  avatar: "BC", text: "Good morning all. Please confirm attendance for today's meeting.", time: "07:45" },
    { author: "CEO",          avatar: "CE", text: "Confirmed. I have a brief update on agenda item 4.",              time: "07:52" },
    { author: "CFO",          avatar: "CF", text: "Confirmed. The Q1 financial report has been revised — please check the updated document.", time: "08:10" },
    { author: "Legal Officer",avatar: "LO", text: "Noted on the revised report. Any changes to agenda?",             time: "08:22" },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages(p => [...p, { author: "You", avatar: "YO", text: t, time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) }]);
    setDraft("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 bg-[#0f172a] text-white flex-shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">👥 Meeting Chat — All {members} Members</div>
        <div className="text-[9px] text-white/50">{meetingName}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0 bg-gray-50">
        {messages.map((m, i) => {
          const isMe = m.author === "You";
          return (
            <div key={i} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMe ? "bg-[#0F172A] text-white" : "bg-[#0f172a] text-white"}`}>{m.avatar}</div>
              <div className={`max-w-[80%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-[9px] text-gray-400 mb-0.5 px-1">{m.author}</span>}
                <div className={`px-2.5 py-1.5 text-[11px] leading-relaxed rounded-xl ${isMe ? "bg-[#0F172A] text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"}`}>{m.text}</div>
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 px-3 py-2 border-t border-gray-200 flex-shrink-0 bg-white">
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Message all meeting members…"
          className="flex-1 h-8 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
        <button onClick={send} disabled={!draft.trim()}
          className="h-8 w-8 bg-[#0f172a] text-white rounded-lg flex items-center justify-center hover:bg-black/80 disabled:opacity-30 flex-shrink-0">
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MeetingBoardPackTab() {
  const [openMeeting, setOpenMeeting] = useState<BoardMeeting | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorTab, setEditorTab] = useState<"agenda"|"minutes"|"documents"|"actions"|"meeting-chat">("agenda");
  const [savedToast, setSavedToast] = useState(false);
  const [boardDocs, setBoardDocs] = useState<{ title: string; type: string; size: string; url?: string }[]>([]);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; type: string; size: string; url?: string } | null>(null);
  const [showDocChat, setShowDocChat] = useState(false);
  const [fullScreenDoc, setFullScreenDoc] = useState<{ title: string; type: string; size: string; url?: string } | null>(null);
  function handleSave() { setSavedToast(true); setTimeout(() => setSavedToast(false), 2500); }

  const statusStyle: Record<string,string> = { SCHEDULED:"bg-slate-100 text-[#0F172A]", CONCLUDED:"bg-slate-100 text-[#0F172A]", CANCELLED:"bg-red-100 text-red-600" };

  const docTypeColor: Record<string,string> = { PDF:"bg-red-500", XLSX:"bg-[#0F172A]", PPTX:"bg-[#0F172A]", DOCX:"bg-[#0F172A]" };

  // ── Full-page PDF viewer overlay ───────────────────────────────────────
  if (fullScreenDoc) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-[#1a1a2e]">
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-[#0f172a] border-b border-white/10 shadow-xl">
          {/* File type badge */}
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${docTypeColor[fullScreenDoc.type] ?? "bg-[#0F172A]"}`}>
            {fullScreenDoc.type}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate leading-tight">{fullScreenDoc.title}</span>
            <span className="text-[10px] text-white/40">{fullScreenDoc.size}</span>
          </div>
          {/* Read-only badge */}
          <span className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/10 text-white/60 text-[10px] font-semibold rounded-full border border-white/10 flex-shrink-0">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            View Only
          </span>
          {/* Close button */}
          <button
            onClick={() => setFullScreenDoc(null)}
            className="flex-shrink-0 flex items-center gap-1.5 h-9 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 transition-colors"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>

        {/* Viewer body */}
        <div className="flex-1 min-h-0 bg-[#1a1a2e]">
          {fullScreenDoc.type === "PDF" && fullScreenDoc.url ? (
            /* Native browser PDF viewer via iframe — full bleed */
            <iframe
              src={fullScreenDoc.url}
              className="w-full h-full border-0"
              title={fullScreenDoc.title}
            />
          ) : fullScreenDoc.type === "PDF" && !fullScreenDoc.url ? (
            /* PDF with no blob URL (mock data — no real file) */
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
              <div className="h-20 w-20 rounded-2xl bg-red-500 flex items-center justify-center text-white font-black text-2xl shadow-2xl">PDF</div>
              <div>
                <div className="text-lg font-bold text-white mb-1">{fullScreenDoc.title}</div>
                <div className="text-sm text-white/40">{fullScreenDoc.size}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 max-w-sm">
                <p className="text-sm text-white/60 leading-relaxed">
                  This is a sample document. Upload a real PDF file to preview it here using the native browser viewer.
                </p>
              </div>
            </div>
          ) : (
            /* Non-PDF: show styled placeholder + download */
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl ${docTypeColor[fullScreenDoc.type] ?? "bg-[#0F172A]"}`}>
                {fullScreenDoc.type}
              </div>
              <div>
                <div className="text-lg font-bold text-white mb-1">{fullScreenDoc.title}</div>
                <div className="text-sm text-white/40">{fullScreenDoc.size}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 max-w-sm">
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  Inline preview is only available for PDF files.<br />
                  Download this {fullScreenDoc.type} to open it in its native application.
                </p>
                {fullScreenDoc.url && (
                  <a
                    href={fullScreenDoc.url}
                    download={fullScreenDoc.title}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-xl transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4" /> Download {fullScreenDoc.type}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Board pack editor modal
  if (openMeeting) {
    const allDocs = [...openMeeting.documents, ...boardDocs];
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
        {/* Modal top bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2 flex-wrap">
          <button onClick={() => { setOpenMeeting(null); setViewingDoc(null); setShowDocChat(false); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 font-medium">
            <X className="h-3.5 w-3.5" /> Back
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-sm font-bold text-gray-900">{openMeeting.name}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusStyle[openMeeting.status] ?? "bg-gray-100 text-gray-600"}`}>{openMeeting.status}</span>
          <div className="flex-1" />
          {savedToast && <span className="text-xs text-[#0F172A] font-semibold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Saved</span>}
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#0F172A]"><Save className="h-3.5 w-3.5" /> Save</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"><Download className="h-3.5 w-3.5" /> PDF</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"><Printer className="h-3.5 w-3.5" /> Print</button>
        </div>
        {/* Blue meta strip */}
        <div className="flex-shrink-0 bg-[#0F172A] px-6 py-3 text-white flex items-center gap-6 flex-wrap">
          <div><div className="text-[10px] text-slate-300 uppercase">Date & Time</div><div className="text-xs font-bold">{openMeeting.date} · {openMeeting.time}</div></div>
          <div><div className="text-[10px] text-slate-300 uppercase">Venue</div><div className="text-xs font-bold">{openMeeting.venue}</div></div>
          <div><div className="text-[10px] text-slate-300 uppercase">Members</div><div className="text-xs font-bold">{openMeeting.members}</div></div>
          <div><div className="text-[10px] text-slate-300 uppercase">Scope</div><div className="text-xs font-bold">{openMeeting.scope}</div></div>
          <div><div className="text-[10px] text-slate-300 uppercase">Owner</div><div className="text-xs font-bold">{openMeeting.owner}</div></div>
        </div>
        {/* Inner sub-tabs */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 flex overflow-x-auto">
          {(["agenda","minutes","documents","actions","meeting-chat"] as const).map(t => (
            <button key={t} onClick={() => setEditorTab(t)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${editorTab === t ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "agenda" ? "📋 Agenda" : t === "minutes" ? "✍️ Minutes" : t === "documents" ? "📁 Documents" : t === "actions" ? "✅ Actions" : "💬 Meeting Chat"}
            </button>
          ))}
        </div>
        {/* Editor body */}
        <div className="flex-1 min-h-0 overflow-hidden flex">
          {/* Main content */}
          <div className={`flex-1 overflow-y-auto p-6 min-w-0 ${editorTab === "documents" && viewingDoc ? "flex flex-col" : ""}`}>
            {editorTab === "agenda" && (
              <div className="max-w-2xl space-y-3">
                <h2 className="text-base font-bold text-gray-900">Meeting Agenda</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {openMeeting.agenda.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50/40 group">
                      <span className="h-5 w-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                      <span className="text-sm text-gray-700 flex-1">{item}</span>
                      <Edit3 className="h-3.5 w-3.5 text-gray-300 group-hover:text-slate-400 flex-shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 text-xs text-[#0F172A] hover:text-[#0F172A] font-medium px-3 py-2 border border-dashed border-slate-200 rounded-lg hover:bg-slate-50 w-full justify-center"><Plus className="h-3.5 w-3.5" /> Add Agenda Item</button>
              </div>
            )}
            {editorTab === "minutes" && (
              <div className="max-w-2xl space-y-3">
                <h2 className="text-base font-bold text-gray-900">Meeting Minutes</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <Edit3 className="h-3.5 w-3.5 text-[#0F172A]" />
                    <span className="text-xs font-semibold text-gray-600">Minutes Editor</span>
                    {openMeeting.status === "CONCLUDED" && <span className="ml-auto text-[10px] px-2 py-0.5 bg-slate-100 text-[#0F172A] rounded-full font-bold">Signed & Approved</span>}
                  </div>
                  <textarea
                    className="w-full min-h-[300px] p-4 text-sm text-gray-700 resize-none focus:outline-none leading-relaxed placeholder:text-gray-400"
                    placeholder={`Minutes for: ${openMeeting.name}\nDate: ${openMeeting.date} · ${openMeeting.time}\nVenue: ${openMeeting.venue}\n\nPresent:\n\nApologies:\n\nProceedings:\n`}
                    value={editorContent} onChange={e => setEditorContent(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#0F172A]"><Save className="h-3.5 w-3.5" /> Save Minutes</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"><Download className="h-3.5 w-3.5" /> Export DOCX</button>
                </div>
              </div>
            )}
            {editorTab === "documents" && (
              <div className="flex flex-col h-full gap-4">
                {/* Upload bar */}
                <div className="flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
                  <h2 className="text-base font-bold text-gray-900">Board Pack Documents</h2>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#0F172A] cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Upload Document
                    <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt" className="hidden"
                      onChange={e => {
                        if (!e.target.files) return;
                        Array.from(e.target.files).forEach(f => {
                          const url = URL.createObjectURL(f);
                          setBoardDocs(prev => [...prev, {
                            title: f.name,
                            type: (f.name.split(".").pop() ?? "DOC").toUpperCase(),
                            size: f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`,
                            url,
                          }]);
                        });
                      }} />
                  </label>
                </div>

                {/* Inline viewer + chat */}
                {viewingDoc ? (
                  <div className="flex flex-1 min-h-0 gap-3 overflow-hidden">
                    {/* Document viewer */}
                    <div className="flex-1 flex flex-col min-w-0 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] text-white flex-shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-xs font-semibold truncate">{viewingDoc.title}</span>
                          <span className="text-[10px] text-white/50 flex-shrink-0">{viewingDoc.size}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setShowDocChat(v => !v)}
                            className={`h-7 px-2.5 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-colors ${showDocChat ? "bg-[#0F172A] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                            💬 Chat
                          </button>
                          {viewingDoc.url && (
                            <a href={viewingDoc.url} download={viewingDoc.title}
                              className="h-7 px-2.5 text-[10px] bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1">
                              <Download className="h-3 w-3" /> Download
                            </a>
                          )}
                          <button onClick={() => setViewingDoc(null)}
                            className="h-7 w-7 bg-red-700/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-100 overflow-auto">
                        {viewingDoc.type === "PDF" && viewingDoc.url ? (
                          <iframe src={viewingDoc.url} className="w-full h-full min-h-[400px] border-0" title={viewingDoc.title} />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                            <div className={`h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-lg ${docTypeColor[viewingDoc.type] ?? "bg-[#0F172A]"}`}>{viewingDoc.type}</div>
                            <div className="text-sm font-bold text-gray-800">{viewingDoc.title}</div>
                            <div className="text-xs text-gray-400">{viewingDoc.size}</div>
                            <p className="text-xs text-gray-400 max-w-xs">Inline preview is available for PDF files. For {viewingDoc.type} files, click Download to open in your application.</p>
                            {viewingDoc.url && (
                              <a href={viewingDoc.url} download={viewingDoc.title}
                                className="text-xs bg-[#0f172a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90">
                                <Download className="h-3.5 w-3.5" /> Download {viewingDoc.type}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Per-document chat panel */}
                    {showDocChat && (
                      <div className="w-72 flex-shrink-0 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                        <DocChatPanel docTitle={viewingDoc.title} meetingName={openMeeting.name} />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Document list (no doc selected) */
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                    {allDocs.length === 0 && (
                      <div className="px-4 py-8 text-center text-xs text-gray-400">No documents yet. Upload files above.</div>
                    )}
                    {allDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50/40 group">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${docTypeColor[doc.type] ?? "bg-[#0F172A]"}`}>{doc.type}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{doc.title}</div>
                          <div className="text-[11px] text-gray-400">{doc.size}</div>
                        </div>
                        {/* View button — always visible, opens inline PDF viewer */}
                        <button onClick={() => { setViewingDoc(doc); setShowDocChat(false); }}
                          className="h-7 px-3 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors flex items-center gap-1">
                          👁 Preview
                        </button>
                        <button onClick={() => { setViewingDoc(doc); setShowDocChat(true); }}
                          className="h-7 px-3 bg-[#0f172a] text-white text-xs font-semibold rounded-lg hover:bg-black/80 transition-colors flex items-center gap-1">
                          💬 Chat
                        </button>
                        {doc.url && (
                          <a href={doc.url} download={doc.title}
                            className="h-7 px-3 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1">
                            <Download className="h-3 w-3" /> DL
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {editorTab === "actions" && (
              <div className="max-w-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Action Items</h2>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#0F172A]"><Plus className="h-3.5 w-3.5" /> Add Action</button>
                </div>
                {openMeeting.status === "SCHEDULED" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#0F172A]">Meeting not yet held</p>
                    <p className="text-xs text-[#0F172A] mt-1">Action items will be captured during or after the meeting.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {["Review ghost vendor report and escalate to ZACC","Submit Q1 audit findings to Board Secretary","Update risk register by 15 May 2026"].map((action, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 flex-1">{action}</span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">Due: 2026-05-20</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {editorTab === "meeting-chat" && (
              <div className="flex-1 h-full min-h-[500px]">
                <MeetingChatPanel meetingName={openMeeting.name} members={openMeeting.members} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex-1 overflow-y-auto bg-[#0f1e2e] p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-white" /></div>
        <div>
          <h1 className="text-xl font-black text-white">Meeting Board Pack</h1>
          <p className="text-xs text-white/60 mt-0.5">Click <strong className="text-blue-300">Open Board Pack</strong> to view agenda, edit minutes, <strong className="text-blue-300">preview documents inline</strong>, and chat with presenters and all meeting members.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {BOARD_MEETINGS.map((m, i) => (
          <div key={i} className="bg-[#162636] rounded-2xl border border-white/10 shadow-md hover:shadow-lg hover:border-white/20 transition-all overflow-hidden">
            <div className={`h-1.5 w-full ${m.status==="SCHEDULED"?"bg-blue-500":m.status==="CONCLUDED"?"bg-emerald-500":"bg-red-500"}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-white leading-tight">{m.name}</h3>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  m.status==="SCHEDULED" ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  : m.status==="CONCLUDED" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-red-500/20 text-red-300 border border-red-400/30"
                }`}>{m.status}</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-white/60 mb-4">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-white/40" /> {m.date} · {m.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-white/40" /> {m.venue}</div>
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-white/40" /> {m.members} members · {m.scope}</div>
                <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-white/40" /> {m.owner}</div>
              </div>
              <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {m.documents.map((d, j) => (
                  <span key={j} className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.type==="PDF"  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                    : d.type==="XLSX" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    : d.type==="PPTX" ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  }`}>{d.type}</span>
                ))}
              </div>
              <button onClick={() => { setOpenMeeting(m); setEditorTab("documents"); setEditorContent(""); setViewingDoc(null); setShowDocChat(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                <FileText className="h-3.5 w-3.5" /> Open Board Pack
              </button>
            </div>
          </div>
        ))}
      {/* Best Practices tile */}
      <div className="bg-[#162636] rounded-2xl border border-white/10 shadow-md hover:shadow-lg transition-all overflow-hidden">
        <div className="h-1.5 w-full bg-violet-500" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-white leading-tight">Board Pack Best Practices</h3>
            <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30">GUIDELINES</span>
          </div>
          <div className="space-y-2 mb-4">
            {[
              "Issue board packs at least 7 days before the meeting.",
              "Include executive summary, agenda, and all supporting documents.",
              "Use a standardised format across all committees.",
              "Access-control and watermark all sensitive annexures.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-white/70">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-violet-500/30 text-violet-300 flex items-center justify-center text-[9px] font-bold flex-shrink-0">{i+1}</span>{tip}
              </div>
            ))}
          </div>
          <div className="space-y-1.5 text-[11px] text-white/60 mb-4">
            <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-white/40" /> Next Meeting: Annual Board · 2026-05-07 · 09:00</div>
            <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-white/40" /> 3 scheduled · 1 concluded · 0 cancelled</div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
            <Plus className="h-3.5 w-3.5" /> Schedule New Meeting
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Tab 7: Briefing Notes Deck ───────────────────────────────────────────
const BRIEFING_NOTES = [
  {
    id: "BN-2026-001",
    subject: "Implementation of Urban Electric Vehicle (EV) Charging Stations",
    ministry: "Ministry of Transport & Infrastructural Development",
    date: "2026-07-01",
    preparedBy: "Director of Transport Policy",
    classification: "CONFIDENTIAL",
    purpose: "To obtain the Minister's approval for the proposed national rollout plan for electric vehicle charging stations in urban areas.",
    background: "With the increasing adoption of electric vehicles, there is a pressing need to expand the infrastructure for EV charging across urban centres. The proposed initiative aligns with the government's environmental policy to reduce carbon emissions by 40% by 2030.",
    currentStatus: "A pilot project in the capital city has resulted in a 15% increase in EV usage. Feedback from EV owners indicates a high satisfaction rate due to improved accessibility to charging stations.",
    advantages: [
      "Supports the transition to greener transportation.",
      "Likely to stimulate further adoption of EVs in urban populations.",
      "Potential to attract investments in green technologies.",
    ],
    challenges: [
      "High initial capital investment required.",
      "Need for coordination between multiple government agencies.",
      "Potential resistance from fossil fuel industry stakeholders.",
    ],
    recommendation: "Approve the phased national rollout of EV charging stations, beginning with Harare and Bulawayo CBDs, with a total estimated budget of USD 12.4 million for Phase 1.",
    urgency: "HIGH",
  },
  {
    id: "BN-2026-002",
    subject: "Procurement of ARV Medicines — 2-Year Framework Agreement",
    ministry: "Ministry of Health & Child Care",
    date: "2026-06-28",
    preparedBy: "Chief Pharmacist & Procurement Division",
    classification: "RESTRICTED",
    purpose: "To brief the Minister on the procurement status of ARV medicines and seek approval for emergency procurement to address critical stock shortages.",
    background: "Current stock levels of three key ARV formulations are critically low. Without intervention, an estimated 84,000 patients will face treatment interruptions within 21 days.",
    currentStatus: "The open tender ZW-MOH-2026-ARV-01 is under evaluation. Emergency procurement under direct procurement provisions is being considered to bridge the gap.",
    advantages: [
      "Prevents treatment interruption for 84,000+ patients.",
      "Maintains Zimbabwe's ART programme compliance metrics.",
      "Bridges the gap until framework agreement is finalised.",
    ],
    challenges: [
      "Emergency procurement may attract higher unit prices.",
      "Supplier lead times of 14–21 days.",
      "Budget reallocation from Q3 health budget required.",
    ],
    recommendation: "Authorise emergency direct procurement of ARV medicines (estimated USD 3.2 million) while the framework tender evaluation continues.",
    urgency: "CRITICAL",
  },
  {
    id: "BN-2026-003",
    subject: "Highway Rehabilitation Programme — Lot 3 Evaluation Delays",
    ministry: "Ministry of Transport & Infrastructural Development",
    date: "2026-06-25",
    preparedBy: "Roads Authority Procurement Unit",
    classification: "INTERNAL",
    purpose: "To inform the Minister of delays in the evaluation of Highway Rehabilitation Lot 3 and seek guidance on timeline extension.",
    background: "The evaluation committee for the USD 88 million Highway Rehabilitation Lot 3 tender has encountered technical scoring disputes among evaluators regarding road design specifications.",
    currentStatus: "Evaluation is 6 days behind schedule. Three of five evaluation committee members have raised formal objections to the scoring methodology.",
    advantages: [
      "Proper resolution ensures procurement integrity.",
      "Transparent process reduces risk of legal challenges post-award.",
    ],
    challenges: [
      "Further delays will impact the rainy-season construction window.",
      "Contractor mobilisation timelines may be compressed.",
    ],
    recommendation: "Approve a 10-day evaluation extension and direct the Procurement Unit to engage PRAZ for independent oversight of the technical scoring process.",
    urgency: "MEDIUM",
  },
  {
    id: "BN-2026-004",
    subject: "Solar Mini-Grid Installation — Binga District Closing Date",
    ministry: "Ministry of Energy & Power Development",
    date: "2026-07-02",
    preparedBy: "Rural Electrification Agency",
    classification: "INTERNAL",
    purpose: "To update the Minister on the Solar Mini-Grid tender status and seek approval for award recommendation.",
    background: "The tender for solar mini-grid installation covering 24 schools and 8 clinics in Binga District closes in 48 hours. Six technically qualified bids have been received.",
    currentStatus: "Technical evaluation is complete. Financial evaluation is ongoing. Estimated award value: USD 4.8 million.",
    advantages: [
      "Electrification of 32 social facilities in a remote district.",
      "Aligns with Rural Electrification Programme targets.",
      "Strong competition received — 6 qualifying bids.",
    ],
    challenges: [
      "Logistics of installations in remote Binga terrain.",
      "Community engagement requirements before commencement.",
    ],
    recommendation: "Note the status. Approve award recommendation once financial evaluation is complete, expected within 3 business days.",
    urgency: "HIGH",
  },
  {
    id: "BN-2026-005",
    subject: "Fraud Alerts — Ghost Vendor Pattern VEN-00476 & VEN-00481",
    ministry: "Office of the Comptroller & Auditor General",
    date: "2026-07-03",
    preparedBy: "AI Analytics & Fraud Detection Unit",
    classification: "TOP SECRET",
    purpose: "To brief the Minister on AI-detected bid rotation and ghost vendor patterns involving two registered vendors.",
    background: "The Ai Powered e-Government Procurement & Automated Oversight Intelligence System AI fraud detection module has flagged a statistically significant pattern of bid rotation between VEN-00476 (Granite Construction) and VEN-00481 (Pinnacle Civil Works). The two companies share three directors and have alternated contract wins across 14 tenders over 18 months.",
    currentStatus: "23 open fraud alerts. VEN-00476 has been placed on the watch list. Formal investigation referral to ZACC is under preparation.",
    advantages: [
      "Early AI detection prevents further procurement losses.",
      "Building of ZACC case with strong evidentiary trail.",
    ],
    challenges: [
      "Existing contracts with both vendors remain active.",
      "Legal advice required before contract suspension.",
    ],
    recommendation: "Approve referral to ZACC. Direct legal team to assess grounds for contract suspension pending investigation. Debarment proceedings to commence upon formal charges.",
    urgency: "CRITICAL",
  },
];

type BriefingNote = typeof BRIEFING_NOTES[0];

const URGENCY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-300"    },
  HIGH:     { bg: "bg-slate-50",  text: "text-[#0F172A]",  border: "border-slate-200"  },
  MEDIUM:   { bg: "bg-slate-50",   text: "text-[#0F172A]",   border: "border-slate-200"   },
  LOW:      { bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200"   },
};

const CLASS_STYLE: Record<string, string> = {
  "TOP SECRET":   "bg-red-700 text-white",
  "CONFIDENTIAL": "bg-[#0F172A] text-white",
  "RESTRICTED":   "bg-[#0F172A] text-white",
  "INTERNAL":     "bg-gray-700 text-white",
};

// ── Per-note status state (approval + action) stored outside component so it persists
type NoteStatus = { approval: "Pending" | "Approved" | "Rejected"; action: "Not Actioned" | "Actioned" };
const INITIAL_NOTE_STATUSES: Record<string, NoteStatus> = Object.fromEntries(
  BRIEFING_NOTES.map(n => [n.id, { approval: "Pending", action: "Not Actioned" }])
);

function BriefingNotesDeckTab() {
  const [selected, setSelected] = useState<BriefingNote | null>(null);
  const [noteStatuses, setNoteStatuses] = useState<Record<string, NoteStatus>>(INITIAL_NOTE_STATUSES);
  const [viewerTab, setViewerTab] = useState<"note" | "instructions" | "messages" | "attachments">("note");
  const [instructions, setInstructions] = useState<{ text: string; by: string; time: string }[]>([
    { text: "Review background section carefully — compare with Q1 2026 data.", by: "Chief of Staff", time: "08:10" },
    { text: "Consult Procurement Division before signing off.", by: "PS Cabinet", time: "09:45" },
  ]);
  const [instrDraft, setInstrDraft] = useState("");
  const [messages, setMessages] = useState<{ text: string; by: string; time: string; mine: boolean }[]>([
    { text: "Please review this briefing note urgently.", by: "Director Policy", time: "07:55", mine: false },
    { text: "Noted. Will review before the 10am meeting.", by: "You", time: "08:02", mine: true },
  ]);
  const [msgDraft, setMsgDraft] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; type: string; size: string; url?: string }[]>([
    { name: "Supporting Data — ARV Stock Levels.xlsx", type: "XLSX", size: "340 KB" },
    { name: "Cabinet Decision No. 12 of 2026.pdf",     type: "PDF",  size: "218 KB" },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const setStatus = (id: string, field: keyof NoteStatus, val: string) =>
    setNoteStatuses(p => ({ ...p, [id]: { ...p[id], [field]: val as NoteStatus[typeof field] } }));

  if (selected) {
    const urg = URGENCY_STYLE[selected.urgency] ?? URGENCY_STYLE.LOW;
    const st = noteStatuses[selected.id] ?? { approval: "Pending", action: "Not Actioned" };
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-[#f8fafc]">
        {/* ── Top chrome bar ── */}
        <div className="flex-shrink-0 bg-[#0f172a] px-5 py-3 flex items-center gap-3 flex-wrap border-b border-white/10">
          <button onClick={() => { setSelected(null); setViewerTab("note"); }}
            className="flex items-center gap-1.5 h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/15 transition-colors flex-shrink-0">
            <X className="h-3.5 w-3.5" /> Close
          </button>
          <div className={`w-1 h-6 rounded-full flex-shrink-0 ${selected.urgency==="CRITICAL"?"bg-red-500":selected.urgency==="HIGH"?"bg-[#0F172A]":selected.urgency==="MEDIUM"?"bg-slate-400":"bg-gray-400"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-mono text-white/40">{selected.id}</span>
            <span className="text-sm font-bold text-white truncate leading-tight">{selected.subject}</span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-1 rounded flex-shrink-0 ${CLASS_STYLE[selected.classification] ?? "bg-gray-700 text-white"}`}>{selected.classification}</span>
          {/* Approval status selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-white/40 font-semibold uppercase">Approval</span>
            <select value={st.approval} onChange={e => setStatus(selected.id, "approval", e.target.value)}
              className={`h-7 px-2 text-[10px] font-bold rounded border-0 focus:outline-none cursor-pointer ${st.approval==="Approved"?"bg-emerald-600 text-white":st.approval==="Rejected"?"bg-red-600 text-white":"bg-amber-500 text-white"}`}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {/* Action status selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-white/40 font-semibold uppercase">Action</span>
            <select value={st.action} onChange={e => setStatus(selected.id, "action", e.target.value)}
              className={`h-7 px-2 text-[10px] font-bold rounded border-0 focus:outline-none cursor-pointer ${st.action==="Actioned"?"bg-[#0F172A] text-white":"bg-gray-500 text-white"}`}>
              <option value="Not Actioned">Not Actioned</option>
              <option value="Actioned">Actioned</option>
            </select>
          </div>
          <button onClick={() => window.print()} className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg border border-white/15 flex items-center gap-1.5 flex-shrink-0"><Printer className="h-3.5 w-3.5"/>Print</button>
        </div>

        {/* ── Sub-tab strip ── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 flex overflow-x-auto">
          {(["note","instructions","messages","attachments"] as const).map(t => (
            <button key={t} onClick={() => setViewerTab(t)}
              className={`px-5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${viewerTab===t?"border-slate-200 text-[#0F172A]":"border-transparent text-gray-500 hover:text-gray-800"}`}>
              {t==="note"?"📄 Briefing Note":t==="instructions"?"📋 Instructions":t==="messages"?"💬 Messages":"📎 Attachments"}
            </button>
          ))}
        </div>

        {/* ── Viewer body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc]">

          {viewerTab === "note" && (
          <div className="w-full py-6 px-4 sm:px-6">
          {/* Header — formal government style */}
          <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#0f172a] px-6 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Government of the Republic of Zimbabwe</div>
                  <div className="text-[10px] text-white/50">{selected.ministry}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${CLASS_STYLE[selected.classification] ?? "bg-gray-700 text-white"}`}>{selected.classification}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${urg.bg} ${urg.text} ${urg.border}`}>{selected.urgency} PRIORITY</span>
                </div>
              </div>
              <h1 className="text-lg font-bold text-white mt-3 leading-snug">Briefing Note to Minister</h1>
            </div>
            <div className="px-6 py-4 border-b border-black/8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#f8fafc]">
              {[
                { label: "Reference",   value: selected.id },
                { label: "Date",        value: new Date(selected.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
                { label: "Prepared By", value: selected.preparedBy },
                { label: "Ministry",    value: selected.ministry.replace("Ministry of ", "Min. of ") },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-[9px] font-bold text-black/40 uppercase tracking-wider">{f.label}</div>
                  <div className="text-xs font-semibold text-black mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="bg-[#f0f8ff] border border-slate-200 rounded-lg px-4 py-3">
                <div className="text-xs font-bold text-black/50 uppercase tracking-wider mb-1">Subject</div>
                <div className="text-sm font-bold text-black">{selected.subject}</div>
              </div>
              {[
                { heading: "1. Purpose",       body: selected.purpose       },
                { heading: "2. Background",     body: selected.background    },
                { heading: "3. Current Status", body: selected.currentStatus },
              ].map(s => (
                <div key={s.heading}>
                  <div className="text-sm font-bold text-black mb-1">{s.heading}</div>
                  <p className="text-sm text-black/70 leading-relaxed">{s.body}</p>
                </div>
              ))}
              <div>
                <div className="text-sm font-bold text-black mb-2">4. Considerations</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-[#0F172A] mb-1.5">Advantages</div>
                    <ul className="space-y-1">{selected.advantages.map((a,i) => <li key={i} className="flex items-start gap-1.5 text-xs text-black/70"><span className="text-slate-600 mt-0.5">●</span>{a}</li>)}</ul>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-[#0F172A] mb-1.5">Challenges</div>
                    <ul className="space-y-1">{selected.challenges.map((c,i) => <li key={i} className="flex items-start gap-1.5 text-xs text-black/70"><span className="text-slate-600 mt-0.5">●</span>{c}</li>)}</ul>
                  </div>
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-lg px-4 py-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">5. Recommendation</div>
                <p className="text-sm text-white leading-relaxed">{selected.recommendation}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-black/8">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5"><Printer className="h-4 w-4"/>Print</button>
                <button onClick={() => { const blob=new Blob([`BRIEFING NOTE\n\nRef: ${selected.id}\nSubject: ${selected.subject}\n\n${selected.purpose}`],{type:"text/plain"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=`${selected.id}.txt`;a.click();URL.revokeObjectURL(u); }} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5"><Download className="h-4 w-4"/>Download</button>
                <button onClick={() => setStatus(selected.id,"approval","Approved")} className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A] ml-auto"><CheckCircle className="h-4 w-4"/>Approve</button>
                <button onClick={() => setStatus(selected.id,"approval","Rejected")} className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"><X className="h-4 w-4"/>Reject</button>
                <button onClick={() => setStatus(selected.id,"action","Actioned")} className="flex items-center gap-1.5 h-9 px-5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]"><Send className="h-4 w-4"/>Mark Actioned</button>
              </div>
            </div>
          </div>
          </div>
          )}

          {viewerTab === "instructions" && (
            <div className="w-full py-6 px-4 sm:px-6 space-y-4">
              <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#0f172a] px-5 py-3"><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 Instructions for {selected.id}</div></div>
                <div className="divide-y divide-gray-100">
                  {instructions.map((ins, i) => (
                    <div key={i} className="flex gap-3 px-5 py-3">
                      <div className="h-7 w-7 rounded-full bg-[#0F172A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{ins.text}</p>
                        <div className="text-[10px] text-gray-400 mt-1">{ins.by} · {ins.time}</div>
                      </div>
                    </div>
                  ))}
                  {instructions.length === 0 && <div className="px-5 py-8 text-center text-xs text-gray-400">No instructions yet.</div>}
                </div>
              </div>
              <div className="flex gap-2">
                <input value={instrDraft} onChange={e => setInstrDraft(e.target.value)}
                  placeholder="Add instruction for this briefing note…"
                  className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
                <button onClick={() => { if(!instrDraft.trim()) return; setInstructions(p=>[...p,{text:instrDraft.trim(),by:"You",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]); setInstrDraft(""); }}
                  className="h-9 px-4 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A]">Add</button>
              </div>
            </div>
          )}

          {viewerTab === "messages" && (
            <div className="w-full py-6 px-4 sm:px-6 flex flex-col gap-3">
              <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#0f172a] px-5 py-3"><div className="text-xs font-bold text-slate-400 uppercase tracking-wider">💬 Messages — {selected.id}</div></div>
                <div className="p-4 space-y-3 min-h-[200px]">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.mine?"flex-row-reverse":""}`}>
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${m.mine?"bg-[#0F172A] text-white":"bg-[#0f172a] text-white"}`}>{m.by.slice(0,2).toUpperCase()}</div>
                      <div className={`max-w-[75%] flex flex-col ${m.mine?"items-end":"items-start"}`}>
                        {!m.mine && <span className="text-[9px] text-gray-400 mb-0.5 px-1">{m.by}</span>}
                        <div className={`px-3 py-2 text-xs leading-relaxed rounded-xl ${m.mine?"bg-[#0F172A] text-white rounded-tr-sm":"bg-gray-100 text-gray-800 rounded-tl-sm"}`}>{m.text}</div>
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input value={msgDraft} onChange={e => setMsgDraft(e.target.value)}
                  onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); if(!msgDraft.trim()) return; setMessages(p=>[...p,{text:msgDraft.trim(),by:"You",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),mine:true}]); setMsgDraft(""); }}}
                  placeholder="Send a message about this briefing note…"
                  className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
                <button onClick={() => { if(!msgDraft.trim()) return; setMessages(p=>[...p,{text:msgDraft.trim(),by:"You",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),mine:true}]); setMsgDraft(""); }}
                  className="h-9 w-9 bg-[#0F172A] text-white rounded-lg flex items-center justify-center hover:bg-[#0F172A]"><Send className="h-4 w-4"/></button>
              </div>
            </div>
          )}

          {viewerTab === "attachments" && (
            <div className="w-full py-6 px-4 sm:px-6 space-y-4">
              <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#0f172a] px-5 py-3 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">📎 Attachments — {selected.id}</div>
                  <label className="flex items-center gap-1 h-7 px-3 bg-[#0F172A] hover:bg-[#0F172A] text-white text-[10px] font-semibold rounded-lg cursor-pointer">
                    <Plus className="h-3 w-3"/>Attach
                    <input ref={fileRef} type="file" multiple className="hidden" onChange={e => {
                      if(!e.target.files) return;
                      Array.from(e.target.files).forEach(f => {
                        setAttachments(p=>[...p,{name:f.name,type:(f.name.split(".").pop()??"DOC").toUpperCase(),size:f.size>1024*1024?`${(f.size/1024/1024).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`,url:URL.createObjectURL(f)}]);
                      });
                    }}/>
                  </label>
                </div>
                {attachments.length === 0 && <div className="px-5 py-8 text-center text-xs text-gray-400">No attachments yet.</div>}
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50/30 group">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${att.type==="PDF"?"bg-red-500":att.type==="XLSX"?"bg-[#0F172A]":att.type==="PPTX"?"bg-[#0F172A]":"bg-[#0F172A]"}`}>{att.type}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-gray-800 truncate">{att.name}</div><div className="text-[11px] text-gray-400">{att.size}</div></div>
                    {att.url && att.type==="PDF" && (
                      <a href={att.url} target="_blank" rel="noreferrer" className="h-7 px-3 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] flex items-center gap-1 opacity-0 group-hover:opacity-100">👁 View</a>
                    )}
                    {att.url && (
                      <a href={att.url} download={att.name} className="h-7 px-3 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1 opacity-0 group-hover:opacity-100"><Download className="h-3 w-3"/></a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-[#0f172a] rounded-xl px-6 py-4 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Minister's Executive Office</div>
            <h1 className="text-lg font-bold text-white">Briefing Notes Deck</h1>
            <div className="text-xs text-white/50 mt-0.5">{BRIEFING_NOTES.length} briefing notes · {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}</div>
          </div>
          <div className="flex gap-2">
            {[{label:"Critical",count:BRIEFING_NOTES.filter(n=>n.urgency==="CRITICAL").length,color:"bg-red-100 text-red-700"},{label:"High",count:BRIEFING_NOTES.filter(n=>n.urgency==="HIGH").length,color:"bg-slate-100 text-[#0F172A]"},{label:"Medium",count:BRIEFING_NOTES.filter(n=>n.urgency==="MEDIUM").length,color:"bg-slate-100 text-[#0F172A]"}].map(s=>(
              <div key={s.label} className={`text-center px-3 py-1.5 rounded-lg ${s.color}`}><div className="text-lg font-bold leading-none">{s.count}</div><div className="text-[9px] font-semibold uppercase">{s.label}</div></div>
            ))}
          </div>
        </div>

        {/* Register table */}
        <div className="bg-white rounded-xl border border-black/8 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-x-3 px-4 py-2.5 bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-wider">
            <span className="w-28">Ref / Date</span>
            <span>Subject &amp; Ministry</span>
            <span className="w-20 text-center">Priority</span>
            <span className="w-20 text-center">Class.</span>
            <span className="w-24 text-center">Approval</span>
            <span className="w-24 text-center">Action</span>
            <span className="w-12 text-center">View</span>
          </div>

          {BRIEFING_NOTES.map((note) => {
            const urg = URGENCY_STYLE[note.urgency] ?? URGENCY_STYLE.LOW;
            const st = noteStatuses[note.id] ?? { approval: "Pending", action: "Not Actioned" };
            const urgStripe = note.urgency==="CRITICAL"?"bg-red-500":note.urgency==="HIGH"?"bg-[#0F172A]":note.urgency==="MEDIUM"?"bg-[#0F172A]":"bg-gray-300";
            return (
              <div key={note.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] items-center gap-x-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50/30 transition-colors group">
                {/* Ref + date */}
                <div className="w-28">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${urgStripe}`}/>
                    <span className="text-[10px] font-mono font-bold text-gray-700">{note.id}</span>
                  </div>
                  <div className="text-[10px] text-gray-400">{new Date(note.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                </div>

                {/* Subject */}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate leading-snug">{note.subject}</div>
                  <div className="text-[10px] text-gray-400 truncate">{note.ministry}</div>
                </div>

                {/* Priority badge */}
                <div className="w-20 flex justify-center">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded border ${urg.bg} ${urg.text} ${urg.border}`}>{note.urgency}</span>
                </div>

                {/* Classification */}
                <div className="w-20 flex justify-center">
                  <span className={`text-[9px] font-bold px-2 py-1 rounded ${CLASS_STYLE[note.classification] ?? "bg-gray-700 text-white"}`}>{note.classification}</span>
                </div>

                {/* Approval status dropdown */}
                <div className="w-24 flex justify-center">
                  <select value={st.approval} onChange={e => setStatus(note.id,"approval",e.target.value)}
                    className={`w-full h-7 px-1.5 text-[10px] font-bold rounded border-0 focus:outline-none cursor-pointer text-center ${st.approval==="Approved"?"bg-slate-100 text-[#0F172A]":st.approval==="Rejected"?"bg-red-100 text-red-700":"bg-slate-100 text-[#0F172A]"}`}>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Approved">✅ Approved</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                </div>

                {/* Action status dropdown */}
                <div className="w-24 flex justify-center">
                  <select value={st.action} onChange={e => setStatus(note.id,"action",e.target.value)}
                    className={`w-full h-7 px-1.5 text-[10px] font-bold rounded border-0 focus:outline-none cursor-pointer text-center ${st.action==="Actioned"?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>
                    <option value="Not Actioned">⬜ Not Actioned</option>
                    <option value="Actioned">✅ Actioned</option>
                  </select>
                </div>

                {/* View link */}
                <div className="w-12 flex justify-center">
                  <button onClick={() => { setSelected(note); setViewerTab("note"); }}
                    className="text-xs font-bold text-[#0F172A] hover:text-[#0F172A] hover:underline whitespace-nowrap">
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab 8: Live Trading Board ─────────────────────────────────────────────
function TradingBoardTab() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <BriefingDashboard />
    </div>
  );
}

// ── Procurement Overview data ─────────────────────────────────────────────
const EXEC_KPIS_BRIEF = [
  { label: "Total Procurement Projects", value: "1,487", delta: "+42 this quarter", positive: true  },
  { label: "Active Contracts",           value: "964",   delta: "+8 this month",    positive: true  },
  { label: "Procurement Value",          value: "USD 2.84B", delta: "+6.2% vs prior year", positive: true },
  { label: "Budget Utilization",         value: "67.8%", delta: "On track",         positive: true  },
  { label: "Savings Achieved",           value: "USD 184M", delta: "+11.4%",        positive: true  },
  { label: "Compliance Score",           value: "94.2%", delta: "+1.8 pts",         positive: true  },
  { label: "AI Alerts",                  value: "7",     delta: "Needs attention",  positive: false },
  { label: "Outstanding Actions",        value: "23",    delta: "Pending",          positive: false },
];
const SPEND_TREND_BRIEF = [
  { month: "Jan", actual: 180, budget: 200, savings: 20 },
  { month: "Feb", actual: 210, budget: 220, savings: 22 },
  { month: "Mar", actual: 245, budget: 255, savings: 28 },
  { month: "Apr", actual: 230, budget: 240, savings: 24 },
  { month: "May", actual: 268, budget: 275, savings: 32 },
  { month: "Jun", actual: 290, budget: 300, savings: 38 },
  { month: "Jul", actual: 305, budget: 310, savings: 35 },
];
const CATEGORY_DIST_BRIEF = [
  { name: "Infrastructure", value: 38 }, { name: "Health & Pharma", value: 22 },
  { name: "ICT & Digital", value: 14 }, { name: "Agriculture", value: 11 },
  { name: "Education", value: 9 },       { name: "Other", value: 6 },
];
const CAT_COLORS_BRIEF = ["#000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"];
const AI_ALERTS_BRIEF = [
  { id: 1, type: "Risk",       msg: "Harare Water Treatment — contractor cash flow stress detected.", severity: "High"     },
  { id: 2, type: "Fraud",      msg: "Bid rotation pattern detected in Transport Ministry tenders.",   severity: "Critical" },
  { id: 3, type: "Budget",     msg: "ICT procurement budget 88% utilized with 6 months remaining.",  severity: "Medium"   },
  { id: 4, type: "Compliance", msg: "3 contracts in Ministry of Education past approval deadline.",   severity: "High"     },
  { id: 5, type: "Warranty",   msg: "ZESA Substation warranty expires in 5 days.",                   severity: "High"     },
  { id: 6, type: "Performance",msg: "Bulawayo Civil Works KPI below 60% for 2nd consecutive period.",severity: "Medium"   },
  { id: 7, type: "Supplier",   msg: "2 new supplier debarment applications pending CPO review.",     severity: "Low"      },
];
const PROC_PIPELINE = [
  { stage: "Planning",      count: 142 }, { stage: "Tender Prep",   count: 203 },
  { stage: "Advertisement", count: 287 }, { stage: "Bid Evaluation",count: 318 },
  { stage: "Contract Award",count: 89  }, { stage: "Execution",     count: 964 },
  { stage: "Closure",       count: 23  },
];
const SEV_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High:     "bg-slate-100 text-[#0F172A] border-slate-200",
  Medium:   "bg-slate-100 text-[#0F172A] border-slate-200",
  Low:      "bg-slate-100 text-[#0F172A] border-slate-200",
};

// ── Tab 9: Procurement Overview (Executive BI) ────────────────────────────
function ProcurementOverviewTab() {
  const [tab, setTab] = useState<"Overview"|"Contracts"|"Finance"|"Suppliers"|"AI Insights">("Overview");
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#EAF1F8]">
      {/* KPI cards row */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 overflow-x-auto">
        {EXEC_KPIS_BRIEF.map(k => (
          <div key={k.label} className="bg-white border border-black/8 rounded-xl p-3 flex flex-col gap-1">
            <div className="text-[9px] text-black/50 font-medium leading-tight">{k.label}</div>
            <div className="text-base font-bold text-black">{k.value}</div>
            <div className={`text-[10px] font-semibold flex items-center gap-0.5 ${k.positive ? "text-[#0F172A]" : "text-red-500"}`}>
              {k.positive ? "▲" : "▼"} {k.delta}
            </div>
          </div>
        ))}
      </div>
      {/* Sub-tab strip */}
      <div className="flex-shrink-0 px-4 flex gap-1 border-b border-black/10 bg-white overflow-x-auto">
        {(["Overview","Contracts","Finance","Suppliers","AI Insights"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t ? "border-slate-200 text-[#0F172A]" : "border-transparent text-black/55 hover:text-black"}`}>
            {t}
          </button>
        ))}
      </div>
      {/* Content area + right KPI rail */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-0">
        <div className="flex-1 overflow-y-auto p-4 min-w-0 scroll-smooth">
          {tab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <div className="text-sm font-semibold text-black">Procurement Spend vs Budget</div>
                    <div className="text-xs text-black/45 mt-0.5">Monthly YTD — USD millions</div>
                  </div>
                  <div className="p-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={SPEND_TREND_BRIEF}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="actual" fill="#1D4ED8" radius={[3,3,0,0]} name="Actual" />
                        <Bar dataKey="budget" fill="#e5e7eb" radius={[3,3,0,0]} name="Budget" />
                        <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} dot={false} name="Savings" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <div className="text-sm font-semibold text-black">Spend by Category</div>
                    <div className="text-xs text-black/45 mt-0.5">Year to date distribution</div>
                  </div>
                  <div className="p-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CATEGORY_DIST_BRIEF} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={2}>
                          {CATEGORY_DIST_BRIEF.map((_, i) => <Cell key={i} fill={CAT_COLORS_BRIEF[i % CAT_COLORS_BRIEF.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <div className="text-sm font-semibold text-black">Procurement Pipeline by Stage</div>
                    <div className="text-xs text-black/45 mt-0.5">Current distribution of all procurement activities</div>
                  </div>
                  <div className="p-4 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PROC_PIPELINE}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="#1D4ED8" radius={[3,3,0,0]} name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1">
                    <div className="text-sm font-semibold text-black">Outstanding Actions</div>
                    <div className="text-xs text-black/45 mt-0.5">Pending items requiring attention</div>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { label: "Contract Approvals",      count: 8,  color: "text-red-600"    },
                      { label: "Payment Authorisations",  count: 6,  color: "text-[#0F172A]"  },
                      { label: "Vendor Reviews",          count: 4,  color: "text-[#0F172A]"   },
                      { label: "Audit Responses",         count: 3,  color: "text-[#0F172A]" },
                      { label: "Warranty Renewals",       count: 2,  color: "text-[#0F172A]"},
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-black/5">
                        <span className="text-xs text-black/65">{item.label}</span>
                        <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "Finance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Committed", value: "USD 1.94B", delta: "68.3% of budget" },
                  { label: "Total Paid YTD",  value: "USD 1.12B", delta: "39.4% of budget" },
                  { label: "Retained Funds",  value: "USD 84.2M", delta: "Under warranty"  },
                  { label: "Savings YTD",     value: "USD 184M",  delta: "+11.4% vs target"},
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className="text-xs text-black/50">{k.label}</div>
                    <div className="text-xl font-bold text-black mt-1">{k.value}</div>
                    <div className="text-xs text-[#0F172A] mt-1">▲ {k.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1"><div className="text-sm font-semibold text-black">Cumulative Spend vs Budget</div></div>
                  <div className="p-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SPEND_TREND_BRIEF}>
                        <defs>
                          <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }} />
                        <Area type="monotone" dataKey="actual" stroke="#1D4ED8" strokeWidth={2} fill="url(#spGrad)" name="Actual Spend" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                  <div className="px-4 pt-4 pb-1"><div className="text-sm font-semibold text-black">Savings Achievement vs Target</div></div>
                  <div className="p-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SPEND_TREND_BRIEF}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }} />
                        <Bar dataKey="savings" fill="#10B981" radius={[3,3,0,0]} name="Savings (USD M)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "Suppliers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Registered Suppliers", value: "12,847" },
                  { label: "Active Suppliers",           value: "8,214"  },
                  { label: "SME Suppliers",              value: "4,392"  },
                  { label: "Blacklisted",                value: "225"    },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className="text-xs text-black/50">{k.label}</div>
                    <div className="text-xl font-bold text-black mt-1">{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                <div className="px-4 pt-4 pb-1"><div className="text-sm font-semibold text-black">Top Performing Suppliers</div></div>
                <div className="p-4 space-y-3">
                  {[
                    { name: "Zimbabwe Pharma Holdings",        score: 4.7, contracts: 24, value: "USD 42.5M", grade: "A+" },
                    { name: "Highveld Engineering (Pvt) Ltd",  score: 4.5, contracts: 18, value: "USD 71.0M", grade: "A"  },
                    { name: "Mashonaland Agri Supplies",       score: 4.5, contracts: 16, value: "USD 28.4M", grade: "A"  },
                    { name: "Eastern Highlands Logistics",     score: 4.1, contracts: 7,  value: "USD 8.2M",  grade: "B+" },
                    { name: "Sable ICT Solutions",             score: 4.0, contracts: 11, value: "USD 7.8M",  grade: "B+" },
                  ].map((s, i) => (
                    <div key={s.name} className="flex items-center gap-4 p-3 border border-black/8 rounded-xl">
                      <div className="h-8 w-8 rounded-full bg-black text-white text-xs font-bold grid place-items-center flex-shrink-0">#{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-black truncate">{s.name}</div>
                        <div className="text-xs text-black/65">{s.contracts} contracts · {s.value}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-black">{s.score.toFixed(1)}/5.0</div>
                        <div className="text-xs text-black/55">Score</div>
                      </div>
                      <span className="text-sm font-bold bg-slate-100 text-[#0F172A] px-2 py-1 rounded-full">{s.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "AI Insights" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                <div className="px-4 pt-4 pb-1"><div className="text-sm font-semibold text-black">AI Intelligence Alerts</div></div>
                <div className="p-4 space-y-3">
                  {AI_ALERTS_BRIEF.map(alert => (
                    <div key={alert.id} className={`flex items-start gap-3 p-4 border rounded-xl ${SEV_COLOR[alert.severity]}`}>
                      <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold">{alert.type}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${SEV_COLOR[alert.severity]}`}>{alert.severity}</span>
                        </div>
                        <div className="text-xs leading-relaxed">{alert.msg}</div>
                      </div>
                      <button onClick={() => pushNotification(`Action taken on: ${alert.msg.substring(0,40)}...`, "info")} className="text-[10px] font-medium underline flex-shrink-0">Take Action</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { title: "Budget Forecast",          body: "Based on current spend trajectory, budget utilization will reach 78% by year-end. Recommend reviewing Q3 procurement plan allocation.", color: "bg-slate-50"    },
                  { title: "Supplier Risk Prediction", body: "AI predicts 3 suppliers in ICT category have elevated default risk based on payment behavior patterns. Proactive engagement recommended.", color: "bg-slate-50"   },
                  { title: "Procurement Efficiency",   body: "Cycle time reduced 6.7% this quarter vs prior year. Main driver: AI-assisted bid evaluation reducing evaluation time by 40%.",            color: "bg-slate-50" },
                ].map(insight => (
                  <div key={insight.title} className={`rounded-xl border border-black/8 p-4 ${insight.color}`}>
                    <div className="text-sm font-semibold text-black mb-2">{insight.title}</div>
                    <div className="text-xs text-black/70 leading-relaxed">{insight.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Contracts" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Active Contracts", value: "964", delta: "In execution",   pos: true  },
                  { label: "On Track",          value: "841", delta: "87.2%",          pos: true  },
                  { label: "At Risk",           value: "89",  delta: "9.2%",           pos: false },
                  { label: "Delayed",           value: "34",  delta: "3.5%",           pos: false },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className="text-xs text-black/50">{k.label}</div>
                    <div className="text-xl font-bold text-black mt-1">{k.value}</div>
                    <div className={`text-xs mt-1 font-semibold ${k.pos ? "text-[#0F172A]" : "text-red-500"}`}>{k.delta}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
                <div className="px-4 pt-4 pb-1"><div className="text-sm font-semibold text-black">Contract Health Distribution</div></div>
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { ministry:"Transport", onTrack:42, atRisk:8, delayed:4 },
                      { ministry:"Health",    onTrack:38, atRisk:5, delayed:2 },
                      { ministry:"Education", onTrack:28, atRisk:3, delayed:1 },
                      { ministry:"Energy",    onTrack:22, atRisk:4, delayed:2 },
                      { ministry:"Agriculture",onTrack:35,atRisk:6, delayed:3 },
                      { ministry:"Water",     onTrack:18, atRisk:7, delayed:4 },
                    ]}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="ministry" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }} />
                      <Legend wrapperStyle={{ fontSize:11 }} />
                      <Bar dataKey="onTrack" fill="#10B981" radius={[3,3,0,0]} name="On Track" stackId="a" />
                      <Bar dataKey="atRisk"  fill="#F59E0B" name="At Risk"   stackId="a" />
                      <Bar dataKey="delayed" fill="#DC2626" radius={[3,3,0,0]} name="Delayed" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right KPI ticker rail */}
        <div className="hidden lg:flex flex-col w-52 flex-shrink-0 bg-[#0f172a] border-l border-white/8 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
            <div className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
              Live KPIs
            </div>
            <div className="text-[9px] text-white/55 mt-0.5">Hover to pause</div>
          </div>
          <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
        </div>
      </div>
    </div>
  );
}

// ── Economic Performance Tab ───────────────────────────────────────────────
const ECON_SECTIONS = [
  "Economic Performance Indicators",
  "Financial Performance Indicators",
  "Investment & Business Indicators",
  "Social Performance Indicators",
  "Environmental Indicators",
  "Key Performance Indicators",
] as const;
type EconSection = typeof ECON_SECTIONS[number];

const ECON_DATA: Record<EconSection, { indicator: string; measure: string; performance: number; status: "green" | "yellow" | "red"; alarmThreshold: string; interpretation: string }[]> = {
  "Economic Performance Indicators": [
    { indicator: "Real GDP Growth",           measure: "5% annually",       performance: 5.0,  status: "green",  alarmThreshold: "Below 2% for 2 consecutive quarters", interpretation: "Economy performing strongly" },
    { indicator: "GDP per Capita",            measure: "Continuous increase",performance: 72,   status: "green",  alarmThreshold: "Declines for 2 years",                interpretation: "Living standards improving" },
    { indicator: "Labour Productivity",       measure: "Increasing annually",performance: 65,   status: "yellow", alarmThreshold: "Declines >5%",                        interpretation: "Moderate growth" },
    { indicator: "Manufacturing Output",      measure: "Increasing",         performance: 58,   status: "yellow", alarmThreshold: "3 months decline",                    interpretation: "Slight industry pressure" },
    { indicator: "Agricultural Output",       measure: "Increasing",         performance: 78,   status: "green",  alarmThreshold: "Major decline",                       interpretation: "Food production stable" },
    { indicator: "Mining Output",             measure: "Stable growth",      performance: 82,   status: "green",  alarmThreshold: "Significant decline",                 interpretation: "Mineral production solid" },
    { indicator: "Export Growth",             measure: "Positive growth",    performance: 45,   status: "yellow", alarmThreshold: "Decline >10%",                        interpretation: "Export pressure building" },
    { indicator: "Foreign Direct Investment", measure: "Increasing",         performance: 38,   status: "red",    alarmThreshold: "Decline >20%",                        interpretation: "Investor confidence weakening" },
    { indicator: "Business Confidence Index", measure: "Above long-term avg",performance: 52,   status: "yellow", alarmThreshold: "Sharp decline",                       interpretation: "Reduced private investment risk" },
    { indicator: "Consumer Confidence",       measure: "Increasing",         performance: 41,   status: "red",    alarmThreshold: "Falls below historical norm",         interpretation: "Consumer spending likely to weaken" },
    { indicator: "Tourism Arrivals",          measure: "Increasing",         performance: 63,   status: "yellow", alarmThreshold: "Sustained decline",                   interpretation: "Tourism sector under stress" },
    { indicator: "Electricity Generation",    measure: "Meets demand",       performance: 54,   status: "yellow", alarmThreshold: "Supply shortages",                    interpretation: "Production constraints possible" },
    { indicator: "Infrastructure Delivery",   measure: ">90% on time",       performance: 68,   status: "yellow", alarmThreshold: "Below 70%",                           interpretation: "Service delivery concerns" },
    { indicator: "Tax Revenue Growth",        measure: "Growing with GDP",   performance: 71,   status: "green",  alarmThreshold: "Revenue shortfall >10%",              interpretation: "Fiscal pressure manageable" },
    { indicator: "Budget Execution Rate",     measure: "90–100%",            performance: 87,   status: "yellow", alarmThreshold: "Below 80%",                           interpretation: "Programme delivery slightly delayed" },
    { indicator: "Inflation Rate",            measure: "3–6%",               performance: 21,   status: "red",    alarmThreshold: "Above 8–10%",                         interpretation: "Cost of living crisis" },
    { indicator: "Unemployment Rate",         measure: "Below 6–8%",         performance: 28,   status: "red",    alarmThreshold: "Above 12%",                           interpretation: "Social instability risk" },
    { indicator: "Youth Unemployment",        measure: "Below 15%",          performance: 42,   status: "red",    alarmThreshold: "Above 25%",                           interpretation: "Long-term economic risk" },
    { indicator: "Poverty Rate",              measure: "Declining",          performance: 35,   status: "red",    alarmThreshold: "Rising for 2 years",                  interpretation: "Increased inequality" },
    { indicator: "Public Debt-to-GDP",        measure: "<60%",               performance: 52,   status: "yellow", alarmThreshold: "Above 70–80%",                        interpretation: "Debt sustainability watchpoint" },
    { indicator: "Fiscal Deficit",            measure: "<3% of GDP",         performance: 44,   status: "yellow", alarmThreshold: "Above 5%",                            interpretation: "Fiscal imbalance" },
    { indicator: "Trade Deficit",             measure: "Sustainable",        performance: 30,   status: "red",    alarmThreshold: "Persistent widening",                 interpretation: "External vulnerability" },
    { indicator: "Currency Depreciation",     measure: "Stable",             performance: 22,   status: "red",    alarmThreshold: ">10% fall in short period",           interpretation: "Imported inflation" },
    { indicator: "Interest Rates",            measure: "Stable",             performance: 55,   status: "yellow", alarmThreshold: "Sharp increases",                     interpretation: "Investment slowdown risk" },
    { indicator: "Non-Performing Loans",      measure: "<5%",                performance: 38,   status: "red",    alarmThreshold: "Above 10%",                           interpretation: "Financial sector stress" },
    { indicator: "Government Arrears",        measure: "Low",                performance: 25,   status: "red",    alarmThreshold: "Rapid increase",                      interpretation: "Liquidity constraints" },
    { indicator: "Food Inflation",            measure: "Stable",             performance: 18,   status: "red",    alarmThreshold: "Above headline inflation",            interpretation: "Food insecurity" },
    { indicator: "Fuel Inflation",            measure: "Stable",             performance: 28,   status: "red",    alarmThreshold: "Sustained rapid increases",           interpretation: "Economy-wide cost pressures" },
    { indicator: "Corruption Index",          measure: "Improving",          performance: 42,   status: "yellow", alarmThreshold: "Significant deterioration",           interpretation: "Reduced investor confidence risk" },
  ],
  "Financial Performance Indicators": [
    { indicator: "Budget Utilisation",      measure: "95–100%",   performance: 87, status: "yellow", alarmThreshold: "Below 80%",        interpretation: "Near target" },
    { indicator: "Capital Project Completion",measure: ">90%",    performance: 68, status: "yellow", alarmThreshold: "Below 70%",        interpretation: "Slight underperformance" },
    { indicator: "Procurement Cycle Time",  measure: "Declining", performance: 55, status: "yellow", alarmThreshold: "Increasing",       interpretation: "Efficiency improving" },
    { indicator: "Tender Completion Rate",  measure: ">95%",      performance: 82, status: "yellow", alarmThreshold: "Below 80%",        interpretation: "Near target" },
    { indicator: "Service Delivery Index",  measure: "Improving", performance: 74, status: "green",  alarmThreshold: "Declining",        interpretation: "Improving trend" },
    { indicator: "Citizen Satisfaction",    measure: ">85%",      performance: 72, status: "yellow", alarmThreshold: "Below 70%",        interpretation: "Close monitoring needed" },
    { indicator: "Audit Findings",          measure: "Declining", performance: 30, status: "red",    alarmThreshold: "Increasing",       interpretation: "Governance concerns" },
    { indicator: "Fraud Cases",             measure: "Zero/declining",performance:20,status: "red",  alarmThreshold: "Increasing",       interpretation: "Anti-corruption urgency" },
    { indicator: "Corruption Investigations",measure:"Declining", performance: 25, status: "red",    alarmThreshold: "Increasing",       interpretation: "Governance intervention needed" },
    { indicator: "Litigation Costs",        measure: "Declining", performance: 35, status: "red",    alarmThreshold: "Increasing",       interpretation: "Legal exposure growing" },
  ],
  "Investment & Business Indicators": [
    { indicator: "New Business Registrations",measure: "Increasing", performance: 65, status: "green",  alarmThreshold: "Declining",    interpretation: "Business environment improving" },
    { indicator: "Company Closures",          measure: "Low",         performance: 40, status: "yellow", alarmThreshold: "Increasing",   interpretation: "Monitor closely" },
    { indicator: "SME Growth",                measure: "Positive",    performance: 58, status: "yellow", alarmThreshold: "Negative",     interpretation: "Moderate SME expansion" },
    { indicator: "Industrial Capacity Util",  measure: ">80%",        performance: 62, status: "yellow", alarmThreshold: "Below 60%",    interpretation: "Nearing target" },
    { indicator: "Stock Market Index",        measure: "Stable/rising",performance: 48, status: "yellow", alarmThreshold: "Sustained decline", interpretation: "Market volatility" },
    { indicator: "Bank Lending",              measure: "Increasing",  performance: 55, status: "yellow", alarmThreshold: "Contracting",  interpretation: "Moderate credit growth" },
    { indicator: "Venture Capital Investment",measure: "Growing",     performance: 30, status: "red",    alarmThreshold: "Declining",    interpretation: "Innovation ecosystem weak" },
  ],
  "Social Performance Indicators": [
    { indicator: "Life Expectancy",         measure: "Increasing",  performance: 72, status: "green",  alarmThreshold: "Declining",    interpretation: "Health outcomes improving" },
    { indicator: "School Completion Rate",  measure: ">90%",        performance: 85, status: "yellow", alarmThreshold: "Declining",    interpretation: "Near target" },
    { indicator: "Literacy Rate",           measure: "Increasing",  performance: 88, status: "green",  alarmThreshold: "Declining",    interpretation: "Strong literacy" },
    { indicator: "Hospital Waiting Time",   measure: "Declining",   performance: 38, status: "red",    alarmThreshold: "Increasing",   interpretation: "Healthcare access crisis" },
    { indicator: "Crime Rate",              measure: "Declining",   performance: 40, status: "red",    alarmThreshold: "Increasing",   interpretation: "Safety concerns" },
    { indicator: "Road Fatalities",         measure: "Declining",   performance: 35, status: "red",    alarmThreshold: "Increasing",   interpretation: "Road safety intervention needed" },
    { indicator: "Water Access",            measure: ">95%",        performance: 82, status: "yellow", alarmThreshold: "Declining",    interpretation: "Close to target" },
    { indicator: "Electricity Access",      measure: ">95%",        performance: 68, status: "yellow", alarmThreshold: "Declining",    interpretation: "Rural electrification lag" },
    { indicator: "Internet Penetration",    measure: "Increasing",  performance: 55, status: "yellow", alarmThreshold: "Declining",    interpretation: "Digital connectivity growing" },
  ],
  "Environmental Indicators": [
    { indicator: "Air Quality Index",        measure: "Good",             performance: 72, status: "green",  alarmThreshold: "Hazardous",           interpretation: "Air quality acceptable" },
    { indicator: "Water Reservoir Levels",   measure: "Above seasonal norms",performance:48,status: "yellow", alarmThreshold: "Critically low",      interpretation: "Seasonal variation" },
    { indicator: "Carbon Emissions",         measure: "Declining intensity",performance:35, status: "red",    alarmThreshold: "Rapid increase",      interpretation: "Climate commitments at risk" },
    { indicator: "Deforestation",            measure: "Declining",        performance: 30, status: "red",    alarmThreshold: "Increasing",          interpretation: "Forest cover declining" },
    { indicator: "Renewable Energy Share",   measure: "Increasing",       performance: 62, status: "yellow", alarmThreshold: "Stagnating",          interpretation: "Energy transition progressing" },
  ],
  "Key Performance Indicators": [
    { indicator: "Budget utilisation (%)",             measure: "Financial Management",  performance: 87, status: "yellow", alarmThreshold: "Below 80%",    interpretation: "Near target" },
    { indicator: "Expenditure variance",               measure: "Financial Management",  performance: 72, status: "green",  alarmThreshold: ">10% variance",interpretation: "Within tolerance" },
    { indicator: "Procurement cycle time",             measure: "Procurement",           performance: 55, status: "yellow", alarmThreshold: "Increasing",   interpretation: "Improvement needed" },
    { indicator: "Contracts delivered on time",        measure: "Procurement",           performance: 68, status: "yellow", alarmThreshold: "Below 80%",    interpretation: "Moderate performance" },
    { indicator: "Projects completed on schedule",     measure: "Projects",              performance: 62, status: "yellow", alarmThreshold: "Below 70%",    interpretation: "Slight delay trend" },
    { indicator: "Projects within budget",             measure: "Projects",              performance: 71, status: "green",  alarmThreshold: "Below 70%",    interpretation: "On track" },
    { indicator: "Vacancy rate",                       measure: "Human Resources",       performance: 78, status: "green",  alarmThreshold: "Above 20%",    interpretation: "Acceptable staffing" },
    { indicator: "Citizen satisfaction index",         measure: "Service Delivery",      performance: 72, status: "yellow", alarmThreshold: "Below 70%",    interpretation: "Close monitoring" },
    { indicator: "Internal audit findings",            measure: "Governance",            performance: 30, status: "red",    alarmThreshold: "Increasing",   interpretation: "Governance concerns" },
    { indicator: "Compliance score",                   measure: "Governance",            performance: 94, status: "green",  alarmThreshold: "Below 80%",    interpretation: "Strong compliance" },
    { indicator: "High-risk issues unresolved",        measure: "Risk",                  performance: 25, status: "red",    alarmThreshold: "Increasing",   interpretation: "Risk escalation needed" },
    { indicator: "Digital service adoption",           measure: "Digital Transformation",performance: 58, status: "yellow", alarmThreshold: "Declining",    interpretation: "Moderate digital uptake" },
    { indicator: "Annual Performance Plan achievement",measure: "Strategy",              performance: 74, status: "green",  alarmThreshold: "Below 60%",    interpretation: "On track" },
    { indicator: "NDP alignment (%)",                  measure: "National Development",  performance: 68, status: "yellow", alarmThreshold: "Below 50%",    interpretation: "Alignment improving" },
    { indicator: "Vision 2036 contribution",           measure: "National Development",  performance: 55, status: "yellow", alarmThreshold: "Below 40%",    interpretation: "Progress noted" },
    { indicator: "SDG implementation score",           measure: "Sustainability",        performance: 48, status: "yellow", alarmThreshold: "Below 30%",    interpretation: "SDG progress ongoing" },
    { indicator: "Ministerial performance score",      measure: "Executive Performance", performance: 72, status: "green",  alarmThreshold: "Below 60%",    interpretation: "Acceptable performance" },
    { indicator: "Permanent Secretary performance",    measure: "Executive Performance", performance: 78, status: "green",  alarmThreshold: "Below 60%",    interpretation: "Strong leadership" },
  ],
};

function StatusBadge({ status }: { status: "green" | "yellow" | "red" }) {
  if (status === "green")  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-bold rounded-full">🟢 Good</span>;
  if (status === "yellow") return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-bold rounded-full">🟡 Monitor</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">🔴 Danger</span>;
}

function EconIndicatorTable({ data }: { data: typeof ECON_DATA["Economic Performance Indicators"] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#0f172a] text-white">
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">Economic Indicator</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider w-32">Measure</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider w-40">Performance</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider w-24">Status</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">Alarm Threshold</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider">Executive Interpretation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {data.map((row, i) => (
            <tr key={i} className={`hover:bg-gray-50 ${row.status === "red" ? "bg-red-50/40" : row.status === "yellow" ? "bg-slate-50/20" : ""}`}>
              <td className="px-3 py-2.5 font-semibold text-black/80">{row.indicator}</td>
              <td className="px-3 py-2.5 text-black/55">{row.measure}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-black/8 h-1.5 rounded-full overflow-hidden flex-shrink-0">
                    <div className={`h-full rounded-full ${row.status === "green" ? "bg-[#0F172A]" : row.status === "yellow" ? "bg-slate-400" : "bg-red-500"}`}
                      style={{ width: `${row.performance}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${row.status === "green" ? "text-[#0F172A]" : row.status === "yellow" ? "text-[#0F172A]" : "text-red-600"}`}>{row.performance}%</span>
                </div>
              </td>
              <td className="px-3 py-2.5"><StatusBadge status={row.status} /></td>
              <td className="px-3 py-2.5 text-black/50 text-[10px]">{row.alarmThreshold}</td>
              <td className="px-3 py-2.5 text-black/65">{row.interpretation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EconomicPerformanceTab() {
  const [activeSection, setActiveSection] = useState<EconSection>("Economic Performance Indicators");
  const [scrollMode, setScrollMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute overall risk matrix
  const allIndicators = Object.values(ECON_DATA).flat();
  const green  = allIndicators.filter(d => d.status === "green").length;
  const yellow = allIndicators.filter(d => d.status === "yellow").length;
  const red    = allIndicators.filter(d => d.status === "red").length;
  const total  = allIndicators.length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#f5f7fb]">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-3 border-b-2 border-slate-200">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">MODULE 11 — BRIEFING MODULE</p>
            <h1 className="text-lg font-bold">Economic Performance Dashboard</h1>
            <p className="text-xs text-white/60 mt-0.5">Government of Zimbabwe · {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          {/* Risk Matrix summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <span className="text-[10px] text-white/60 uppercase tracking-wider">Risk Matrix</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">🟢 {green}</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">🟡 {yellow}</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-400">🔴 {red}</span>
              <span className="text-[10px] text-white/40">/ {total}</span>
            </div>
            <button onClick={() => setScrollMode(v => !v)}
              className={`h-8 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${scrollMode ? "bg-[#0F172A] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              style={{ borderRadius: 6 }}>
              {scrollMode ? "⏹ Stop Scroll" : "▶ Slow Scroll"}
            </button>
          </div>
        </div>
      </div>

      {/* Section selector */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex px-4 gap-0 pt-1">
          {ECON_SECTIONS.map(section => (
            <button key={section} onClick={() => setActiveSection(section)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${activeSection === section ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Section title + legend */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-5 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-bold text-gray-900">{activeSection}</div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1 text-[#0F172A] font-semibold">🟢 Green — Economy performing strongly; continue monitoring</span>
          <span className="flex items-center gap-1 text-[#0F172A] font-semibold">🟡 Yellow — Emerging issues; review trends</span>
          <span className="flex items-center gap-1 text-red-600 font-semibold">🔴 Red — Critical; immediate executive attention required</span>
        </div>
      </div>

      {/* Table — scroll-up mode or static */}
      <div className="flex-1 overflow-hidden relative bg-white" ref={scrollRef}>
        {scrollMode ? (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-8 bg-white z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-white z-10 pointer-events-none" />
            <div className="tender-scroll-track" style={{ animationDuration: "40s" }}>
              <EconIndicatorTable data={ECON_DATA[activeSection]} />
              <EconIndicatorTable data={ECON_DATA[activeSection]} />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <EconIndicatorTable data={ECON_DATA[activeSection]} />
          </div>
        )}
      </div>

      {/* Bottom AI commentary */}
      <div className="flex-shrink-0 bg-[#0f172a] border-t border-white/10 px-5 py-3 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">AI Executive Interpretation — {activeSection}</div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            {red > yellow + green
              ? "⚠️ Critical situation across multiple indicators. Immediate coordinated executive response required. Priority areas: inflation, unemployment, poverty rate and currency depreciation."
              : yellow > green
              ? "⚡ Emerging issues detected. Review trends across flagged indicators and prepare contingency plans. Focus on export growth, budget execution and investment climate."
              : "✅ Economy performing strongly across key indicators. Continue monitoring and sustain current policy direction."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab 11: Projects GIS — full interactive map (no borders) ─────────────
function ProjectsGISTab() {
  const navigate = useNavigate();
  const mapRef      = useRefGis<L.Map | null>(null);
  const containerRef= useRefGis<HTMLDivElement>(null);
  const layersRef   = useRefGis<L.Layer[]>([]);
  const tileRef     = useRefGis<L.TileLayer | null>(null);
  const [basemap, setBasemap] = useStateGis<"street"|"satellite">("satellite");
  const [filterType, setFilterType] = useStateGis<"all"|"tender"|"project">("all");
  const [selected, setSelected]     = useStateGis<GisPin | null>(null);

  // Fix Leaflet icon paths
  useEffectGis(() => {
    // @ts-expect-error leaflet internal
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2xGis, iconUrl: markerIconGis, shadowUrl: markerShadowGis });
  }, []);

  // Init map
  useEffectGis(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { center: [-19.0, 29.8], zoom: 6, zoomControl: true });
    mapRef.current = map;
    tileRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 19 }
    ).addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Swap basemap
  useEffectGis(() => {
    if (!mapRef.current || !tileRef.current) return;
    tileRef.current.remove();
    tileRef.current = L.tileLayer(
      basemap === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: basemap === "satellite" ? "© Esri" : "© OpenStreetMap", maxZoom: 19 }
    ).addTo(mapRef.current);
  }, [basemap]);

  // Render pins
  const clearLayers = useCallbackGis(() => {
    if (!mapRef.current) return;
    layersRef.current.forEach(l => { try { mapRef.current!.removeLayer(l); } catch {} });
    layersRef.current = [];
  }, []);

  useEffectGis(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    clearLayers();
    const TONE_HEX: Record<string, string> = { green:"#475569", amber:"#64748B", red:"#dc2626", blue:"#0F172A", violet:"#334155" };
    const visible = ALL_GIS_PINS.filter(p => filterType === "all" || p.type === filterType);
    visible.forEach(pin => {
      const color = TONE_HEX[pin.tone] ?? "#0F172A";
      const isProject = pin.type === "project";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="36">
        ${isProject
          ? `<rect x="7" y="3" width="10" height="10" rx="2" fill="${color}" stroke="white" stroke-width="1.5"/>`
          : `<circle cx="12" cy="8" r="5.5" fill="${color}" stroke="white" stroke-width="1.5"/>`}
        <path d="M12 22 L12 ${isProject?13:14}" stroke="${color}" stroke-width="2"/>
      </svg>`;
      const icon = L.divIcon({ html: svg, className: "", iconSize: [28, 36], iconAnchor: [14, 36] });
      const marker = L.marker([pin.lat, pin.lng], { icon });
      const popupHtml = `<div style="font-family:system-ui;min-width:200px;font-size:13px;padding:4px;">
        <div style="font-weight:800;font-size:14px;margin-bottom:6px;color:#0f172a;">${pin.id}</div>
        <div style="color:#374151;margin-bottom:4px;">${pin.title}</div>
        <div style="color:#6b7280;font-size:11px;">${pin.entity}</div>
        ${pin.value ? `<div style="color:#2563eb;font-weight:700;margin-top:4px;">${pin.value}</div>` : ""}
        <div style="display:inline-block;margin-top:6px;padding:2px 8px;background:${color}22;color:${color};border-radius:9999px;font-size:11px;font-weight:600;">${pin.status}</div>
      </div>`;
      marker.bindPopup(popupHtml, { maxWidth: 260, className: "gis-popup" });
      marker.on("click", () => setSelected(pin));
      marker.addTo(map);
      layersRef.current.push(marker);
    });
  }, [filterType, clearLayers]);

  // Fly to selected
  useEffectGis(() => {
    if (selected && mapRef.current) {
      mapRef.current.flyTo([selected.lat, selected.lng], 13, { duration: 1 });
    }
  }, [selected]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Slim toolbar — no border, just floating controls */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-[#0f172a] z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Projects GIS — Zimbabwe</span>

        {/* Basemap */}
        <div className="flex rounded overflow-hidden border border-white/15">
          {(["satellite","street"] as const).map(b => (
            <button key={b} onClick={() => setBasemap(b)}
              className={`px-2.5 py-1 text-[10px] font-semibold capitalize transition-colors ${basemap===b?"bg-[#0F172A] text-white":"text-white/55 hover:text-white"}`}>
              {b}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex rounded overflow-hidden border border-white/15">
          {(["all","tender","project"] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 text-[10px] font-semibold capitalize transition-colors ${filterType===f?"bg-[#0F172A] text-white":"text-white/55 hover:text-white"}`}>
              {f==="all"?"All Pins":f==="tender"?"Tenders":"Projects"}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto text-[10px] text-white/50">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0F172A]"/><span>Tender</span></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded inline-block bg-[#0F172A]"/><span>Project</span></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0F172A]"/><span>On Track</span></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-[#0F172A]"/><span>At Risk</span></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block bg-red-500"/><span>Troubled</span></span>
          <span className="ml-2 text-white/30">{ALL_GIS_PINS.filter(p=>filterType==="all"||p.type===filterType).length} pins</span>
        </div>

        {selected && (
          <button onClick={() => setSelected(null)} className="h-6 w-6 grid place-items-center text-white/40 hover:text-white ml-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* Map + optional detail panel */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Leaflet container — fills all space, no border */}
        <div ref={containerRef} className="flex-1 z-0" style={{ minHeight:0 }}/>

        {/* Detail panel slides in when pin selected */}
        {selected && (
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f172a]/95 border-l border-slate-200/40 z-10 flex flex-col overflow-y-auto backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-bold text-white">{selected.type === "tender" ? "Tender Details" : "Project Details"}</span>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] font-mono text-slate-400">{selected.id}</div>
              <div className="text-sm font-bold text-white leading-snug">{selected.title}</div>
              <div className="text-xs text-white/60">{selected.entity}</div>
              {selected.value && <div className="text-sm font-bold text-slate-400">{selected.value}</div>}
              {selected.phase && <div className="text-xs text-white/50">Phase: {selected.phase}</div>}
              {selected.officer && <div className="text-xs text-white/50">Officer: {selected.officer}</div>}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selected.tone==="green"?"bg-[#0F172A]/50 text-slate-400":
                  selected.tone==="amber"?"bg-[#0F172A]/50 text-slate-400":
                  selected.tone==="red"  ?"bg-red-900/50 text-red-300":
                  selected.tone==="violet"?"bg-[#0F172A]/50 text-slate-400":
                  "bg-[#0F172A]/50 text-slate-400"
                }`}>{selected.status}</span>
                {selected.priority && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">{selected.priority}</span>
                )}
              </div>
              {(selected.startDate || selected.endDate) && (
                <div className="text-[10px] text-white/40 space-y-0.5">
                  {selected.startDate && <div>Start: {selected.startDate}</div>}
                  {selected.endDate   && <div>End: {selected.endDate}</div>}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    navigate(selected.type==="tender" ? `/tenders/${selected.id}` : "/projects");
                    pushNotification(`Opening ${selected.id}`, "info");
                  }}
                  className="flex-1 h-8 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                  Open Details →
                </button>
                <button
                  onClick={() => mapRef.current?.flyTo([selected.lat, selected.lng], 15, { duration: 1 })}
                  className="h-8 px-3 border border-white/15 text-xs text-white/70 rounded-lg hover:bg-white/10 transition-colors">
                  Zoom
                </button>
              </div>
            </div>

            {/* Province stats for reference */}
            <div className="border-t border-white/10 p-4">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">National Summary</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tenders", val: ALL_GIS_PINS.filter(p=>p.type==="tender").length },
                  { label: "Projects", val: ALL_GIS_PINS.filter(p=>p.type==="project").length },
                  { label: "On Track", val: ALL_GIS_PINS.filter(p=>p.tone==="green").length },
                  { label: "At Risk",  val: ALL_GIS_PINS.filter(p=>p.tone==="amber"||p.tone==="red").length },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-lg p-2">
                    <div className="text-[8px] text-white/40">{s.label}</div>
                    <div className="text-sm font-bold text-slate-400">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main BriefingPage component ───────────────────────────────────────────
export default function BriefingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // ── Page-level filters (visible on all tabs) ──────────────────────────
  const [filterMinistry, setFilterMinistry] = useState("All Ministries");
  const [filterYear, setFilterYear] = useState("FY 2026");
  const [audioEnabled, setAudioEnabled] = useState(false);

  const PAGE_MINISTRIES = [
    "All Ministries","Finance & Economic Development","Health & Child Care",
    "Education, Sport & Culture","Transport & Infrastructural Development",
    "Energy & Power Development","Water Resources & Sanitation",
    "Agriculture & Rural Resettlement","Home Affairs & Cultural Heritage",
    "Justice, Legal & Parliamentary Affairs",
  ];
  const PAGE_YEARS = ["All Years","FY 2026","FY 2025","FY 2024","FY 2023"];

  const tabLabel = TABS[activeTab]?.label ?? "Briefing";
  const aiBriefingText = `AI Analysis: ${tabLabel} · ${filterMinistry !== "All Ministries" ? filterMinistry.split(" ")[0] : "All Ministries"} · ${filterYear} — National procurement intelligence active. 3 items require immediate executive action.`;

  const name = user?.name ?? user?.email ?? "Minister";
  const greeting = getTimeGreeting(name);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  function renderTab() {
    switch (activeTab) {
      case 0: return <NotesAlertsTab greeting={greeting} today={today} />;
      case 1: return <VisualDashboardTab />;
      case 2: return <VideoTab name={name} />;
      case 3: return <ExecutiveBITab />;
      case 4: return <ProjectsTendersTab />;
      case 5: return <MyBriefingTab />;
      case 6: return <MeetingBoardPackTab />;
      case 7: return <BriefingNotesDeckTab />;
      case 8: return <TradingBoardTab />;
      case 9: return <ProcurementOverviewTab />;
      case 10: return <EconomicPerformanceTab />;
      case 11: return <ProjectsGISTab />;
      case 12: return <HODBriefingTab />;
      case 13: return <PriorityBriefTab />;
      case 14: return <PerformanceOversightTab />;
      case 15: return <BudgetIntelligenceCentre />;
      default: return <NotesAlertsTab greeting={greeting} today={today} />;
    }
  }

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Briefing"
        process="Senior Management Briefing"
        financialYear="2026/2027"
        pageType="dashboard"
        briefingMode={true}
      />
      <div className="flex flex-col h-full min-h-0 bg-white">
        {/* ── Tab strip — light, clean, attractive ── */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 overflow-x-auto shadow-sm">
          <div className="flex px-2 gap-0.5 pt-1">
            {TABS.map(({ id, label, Icon }, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-xl border border-b-0 transition-all duration-150 ${
                    isActive
                      ? "bg-white border-gray-200 text-[#0F172A] shadow-sm -mb-px pb-3 z-10 relative"
                      : "bg-gray-50 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 mb-0"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#0F172A]" : "text-gray-400"}`} />
                  <span>{i + 1}. {label}</span>
                  {isActive && (
                    <span className="h-1 w-1 rounded-full bg-[#0F172A] ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {activeTab === 0 && <NewFeaturesBanner />}

          {/* ── Page-level filter bar — shown on all tabs except tabs that have their own (HOD=12, Priority=13, My Briefing=5) ── */}
          {![5, 12, 13].includes(activeTab) && (
            <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Filters:</span>

              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Ministry</label>
                <select value={filterMinistry} onChange={e => setFilterMinistry(e.target.value)}
                  className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[190px]">
                  {PAGE_MINISTRIES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Financial Year</label>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                  className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20">
                  {PAGE_YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>

              {/* Active chips */}
              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                {filterMinistry !== "All Ministries" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
                    {filterMinistry.split(" ")[0]}…
                    <button onClick={() => setFilterMinistry("All Ministries")} className="hover:text-red-600 ml-0.5">×</button>
                  </span>
                )}
                {filterYear !== "FY 2026" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
                    {filterYear}
                    <button onClick={() => setFilterYear("FY 2026")} className="hover:text-red-600 ml-0.5">×</button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── AI briefing information bar with audio toggle — all tabs except tabs with their own (12,13) ── */}
          {![12, 13].includes(activeTab) && (
            <div className="flex-shrink-0 bg-[#0f172a] border-b border-slate-200/20 px-4 py-2 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white italic truncate">{aiBriefingText}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-[#0F172A] text-white text-[9px] font-bold rounded uppercase tracking-wide">{tabLabel}</span>
                  <span className="text-[10px] text-slate-400">Live · Updated just now</span>
                </div>
              </div>
              <button
                onClick={() => setAudioEnabled(a => !a)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                  audioEnabled ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
                title={audioEnabled ? "Disable AI Audio" : "Enable AI Audio briefing"}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          )}

          {renderTab()}
        </div>

        {/* ── AI Assistant Panel (right side, all tabs) ── */}
        <AIAssistantPanel
          agentName="Executive Briefing AI"
          agentRole="National procurement & governance intelligence"
          context={`${tabLabel} — ${filterMinistry !== "All Ministries" ? filterMinistry : "All Ministries"} · ${filterYear}`}
          suggestedPrompts={[
            "Summarize today's critical alerts",
            "Which ministries are over budget?",
            "Generate executive briefing report",
            "Show top 5 fraud risk cases",
            "What tenders close this week?",
            "Compare revenue vs target for this year",
          ]}
          color="blue"
        />
      </div>
    </AppShell>
  );
}


