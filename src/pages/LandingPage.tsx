import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, Mail, Map, Search, FileText, MapPin, Building2, Tag,
  Archive, CheckCircle2, XCircle, Download, ListChecks,
  LogIn, UserPlus, KeyRound, UserSearch, HelpCircle, BookOpen, Info,
  Bell, ShieldCheck, Globe2, ChevronRight, Calendar, Phone, Sparkles, Send, X,
  Bot, TrendingUp, AlertOctagon,
} from "lucide-react";

const SYSTEM_SHORT = "AI-Powered Electronic Government Procurement and Automated Oversight Intelligence System";
const SYSTEM_FULL  = "AI-Powered Electronic Government Procurement and Automated Oversight Intelligence System";
const SYSTEM_SUB   = "Integrity · Public Trust · Transparency · Clean Procurement";

function CoatOfArms({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-white border-2 border-white shadow ${className}`}>
      <ShieldCheck className="w-8 h-8 text-[#0f172a]" />
    </div>
  );
}

function TopBar() {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="bg-[#0f172a] text-white text-xs">
      <div className="max-w-[1280px] mx-auto px-4 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{today}</span>
          <span className="hidden md:flex items-center gap-1.5"><Phone className="w-3 h-3" />Help Desk: +263 242 700 000</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:underline">Skip to main content</button>
          <span className="hover:underline cursor-default">Screen Reader</span>
          <div className="flex items-center gap-1">
            <button onClick={() => { document.documentElement.style.fontSize = "13px"; }} className="hover:underline px-0.5">A-</button>
            <button onClick={() => { document.documentElement.style.removeProperty("font-size"); }} className="hover:underline px-0.5">A</button>
            <button onClick={() => { document.documentElement.style.fontSize = "19px"; }} className="hover:underline px-0.5">A+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const navLinks = [
    { label: "Search",                  icon: Search,       to: "/portal"  },
    { label: "Active Tenders",          icon: FileText,     to: "/portal"  },
    { label: "Tenders by Closing Date", icon: Calendar,     to: "/portal"  },
    { label: "Corrigendum",             icon: Bell,         to: "/portal"  },
    { label: "Bid Awards",              icon: CheckCircle2, to: "/portal"  },
    { label: "Portal Home",             icon: Home,         to: "/"        },
  ];

  const handleAiAsk = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiResponse(`Based on your query "${aiQuery}", there are currently 1,287 active tenders on the portal. You can search by ministry, category, closing date, or value. Visit the portal for full details.`);
      setAiLoading(false);
    }, 900);
  };

  return (
    <header className="appois-header">
      <div className="max-w-[1280px] mx-auto px-4 py-4 flex items-center gap-4">
        <CoatOfArms className="w-14 h-14 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
          <div className="text-2xl md:text-3xl font-bold leading-tight text-white">
            {SYSTEM_SHORT}
          </div>
          <div className="text-sm text-white/80 mt-1">Central Public Procurement Portal · {SYSTEM_SUB}</div>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-xs flex-shrink-0">
          <span className="px-2 py-1 border border-slate-200/40 text-slate-400 appois-glow-on-hover cursor-default">Integrity</span>
          <span className="px-2 py-1 border border-slate-200/40 text-slate-400 appois-glow-on-hover cursor-default">Transparency</span>
          <span className="px-2 py-1 border border-slate-200/40 text-slate-400 appois-glow-on-hover cursor-default">Public Trust</span>
        </div>
        {/* AI Ask Me Anything */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setAiOpen(v => !v)}
            className="flex flex-col items-center gap-0.5 group cursor-pointer">
            <div className="h-10 w-10 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Ask Me</span>
          </button>
          {aiOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e293b] border border-slate-200/40 shadow-2xl z-50"
              style={{ boxShadow: "0 0 24px 4px rgba(59,130,246,0.25)" }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200/20">
                <div className="h-6 w-6 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-bold text-white">Ask AI Assistant</span>
                <button onClick={() => setAiOpen(false)} className="ml-auto text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-3 space-y-2">
                {aiResponse && (
                  <div className="bg-[#0F172A]/40 border border-slate-200/20 rounded p-2 text-xs text-slate-200 leading-relaxed">{aiResponse}</div>
                )}
                {aiLoading && <div className="text-xs text-slate-400 animate-pulse">Thinking…</div>}
                <div className="flex gap-2">
                  <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiAsk()}
                    placeholder="Ask anything about tenders, bids…"
                    className="flex-1 h-8 px-2 text-xs bg-[#0f172a] border border-slate-200/30 text-white placeholder-white/30 focus:outline-none focus:border-slate-200" />
                  <button onClick={handleAiAsk} disabled={!aiQuery.trim() || aiLoading}
                    className="h-8 px-3 bg-[#0F172A] text-white text-xs flex items-center gap-1 hover:bg-[#0F172A] disabled:opacity-40 appois-glow-on-hover">
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#1e293b]/80">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-0 text-sm">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to}
                className="flex items-center gap-1.5 px-3 py-2.5 text-white/80 hover:text-white appois-nav-link border-r border-white/10 last:border-r-0 whitespace-nowrap text-xs font-medium">
                <l.icon className="w-3.5 h-3.5" />{l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-0 text-xs">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-2.5 text-white/80 hover:text-white appois-nav-link border-r border-white/10"><Home className="w-3.5 h-3.5" /> Home</Link>
            <a href="mailto:support@govtender.gov.zw" className="flex items-center gap-1.5 px-3 py-2.5 text-white/80 hover:text-white appois-nav-link border-r border-white/10"><Mail className="w-3.5 h-3.5" /> Contact Us</a>
            <Link to="/portal" className="flex items-center gap-1.5 px-3 py-2.5 text-white/80 hover:text-white appois-nav-link"><Map className="w-3.5 h-3.5" /> Site Map</Link>
          </div>
        </div>
      </div>
      <div className="bg-[#0f172a] border-t border-slate-200/50">
        <div className="max-w-[1280px] mx-auto px-4 py-1.5 text-sm font-semibold text-slate-400">
          {SYSTEM_SUB}
        </div>
      </div>
    </header>
  );
}

function RailButton({ icon: Icon, label, to }: { icon: any; label: string; to: string }) {
  return (
    <Link to={to}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#0f172a] bg-white border border-[#1e3a5f]/30 appois-glow-on-hover transition-all"
      style={{ borderRadius: 0 }}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
    </Link>
  );
}

function LoginCard() {
  return (
    <div className="border border-[#1e3a5f]/30 bg-white" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] text-white text-sm font-semibold px-3 py-2">
        Bidder / Officer Access
      </div>
      <div className="p-4 space-y-2">
        <Link to="/signin"
          className="block w-full text-center bg-[#0f172a] text-white font-semibold py-3 appois-glow-on-hover transition-all"
          style={{ borderRadius: 0 }}>
          <span className="inline-flex items-center gap-2"><LogIn className="w-4 h-4" /> Click here to Login</span>
        </Link>
        <Link to="/supplier-registration" className="flex items-center gap-2 text-sm text-[#0f172a] hover:underline py-1.5">
          <UserPlus className="w-4 h-4" /> Online Bidder Enrolment
        </Link>
        <Link to="/signin" className="flex items-center gap-2 text-sm text-[#0f172a] hover:underline py-1.5">
          <KeyRound className="w-4 h-4" /> Generate / Forgot Password?
        </Link>
        <Link to="/portal" className="flex items-center gap-2 text-sm text-[#0f172a] hover:underline py-1.5">
          <UserSearch className="w-4 h-4" /> Find My Nodal Officer
        </Link>
      </div>
    </div>
  );
}

function SearchCard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) navigate(`/portal?q=${encodeURIComponent(query.trim())}`);
    else navigate("/portal");
  };
  return (
    <div className="border border-[#1e3a5f]/30 bg-white" style={{ borderRadius: 0 }}>
      <div className="p-3">
        <div className="text-sm font-semibold text-[#0f172a] mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" /> Tender Search
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Title / Ref No…"
            className="flex-1 h-9 px-2 text-sm border border-[#1e3a5f]/30 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30" style={{ borderRadius: 0 }} />
          <button onClick={handleSearch} className="px-4 h-9 bg-[#0f172a] text-white text-sm font-medium appois-glow-on-hover" style={{ borderRadius: 0 }}>Go</button>
        </div>
        <Link to="/portal" className="text-xs text-[#0f172a] hover:underline mt-2 inline-block">Advanced Search</Link>
      </div>
    </div>
  );
}

function HelpCard() {
  const items = [
    { icon: HelpCircle, label: "Help For Contractors",                      to: "/portal" },
    { icon: BookOpen,   label: "Guidelines for Hassle-Free Bid Submission", to: "/portal" },
    { icon: Info,       label: "Information About DSC",                     to: "/portal" },
  ];
  return (
    <div className="space-y-1">
      {items.map((it) => (
        <Link key={it.label} to={it.to}
          className="flex items-center gap-2 px-3 py-2.5 bg-white border border-[#1e3a5f]/30 text-sm font-medium text-[#0f172a] hover:bg-[#0f172a] hover:text-white appois-glow-on-hover transition-all"
          style={{ borderRadius: 0 }}>
          <it.icon className="w-4 h-4 flex-shrink-0" /> {it.label}
        </Link>
      ))}
    </div>
  );
}

/* Auto-scrolling tender table — rows scroll up, pause on hover */
function ScrollingTenderTable({ title, rows }: {
  title: string;
  rows: { t: string; ref: string; close: string; open: string }[];
}) {
  const navigate = useNavigate();
  const doubled = [...rows, ...rows]; // duplicate for seamless loop
  return (
    <div className="border border-[#1e3a5f]/30 bg-white" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] text-white font-semibold text-sm px-3 py-2 border-b border-white/10 flex items-center gap-2">
        <FileText className="w-4 h-4" /> {title}
      </div>
      {/* Fixed header */}
      <div className="overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <colgroup><col className="w-[55%]" /><col className="w-[20%]" /><col className="w-[12.5%]" /><col className="w-[12.5%]" /></colgroup>
          <thead className="bg-[#1e293b] text-white text-left">
            <tr>
              <th className="px-3 py-2 font-semibold text-xs">Title</th>
              <th className="px-3 py-2 font-semibold text-xs">Reference No</th>
              <th className="px-3 py-2 font-semibold text-xs whitespace-nowrap">Closing</th>
              <th className="px-3 py-2 font-semibold text-xs whitespace-nowrap">Bid Opening</th>
            </tr>
          </thead>
        </table>
      </div>
      {/* Scrolling rows container */}
      <div className="overflow-hidden" style={{ height: "120px" }}>
        <div className="tender-scroll-track">
          <table className="w-full text-sm table-fixed">
            <colgroup><col className="w-[55%]" /><col className="w-[20%]" /><col className="w-[12.5%]" /><col className="w-[12.5%]" /></colgroup>
            <tbody className="divide-y divide-[#1e3a5f]/10">
              {doubled.map((r, i) => {
                const to = `/public/tenders/${encodeURIComponent(r.ref)}`;
                return (
                  <tr key={i} className="hover:bg-slate-50 cursor-pointer align-top tender-card-hover" onClick={() => navigate(to)}>
                    <td className="px-3 py-2 text-[#0f172a]">
                      <span className="text-[#0F172A] font-medium mr-1">{(i % rows.length) + 1}.</span>
                      <button onClick={e => { e.stopPropagation(); navigate(to); }} className="text-[#0f172a] hover:text-[#0F172A] hover:underline text-left text-xs">{r.t}</button>
                    </td>
                    <td className="px-3 py-2 text-[#0f172a]/70 truncate text-xs">{r.ref}</td>
                    <td className="px-3 py-2 text-[#0f172a]/70 whitespace-nowrap text-xs">{r.close}</td>
                    <td className="px-3 py-2 text-[#0f172a]/70 whitespace-nowrap text-xs">{r.open}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="px-3 py-2 text-xs text-[#0f172a]/50 border-t border-[#1e3a5f]/10 flex items-center justify-between">
        <span>Updates every 15 mins.</span>
        <Link to="/portal" className="text-[#0F172A] hover:underline flex items-center gap-0.5 font-medium">More <ChevronRight className="w-3 h-3" /></Link>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="bg-white border border-[#1e3a5f]/20" id="main-content" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] px-5 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">{SYSTEM_SHORT}</div>
          <div className="text-slate-400 text-xs">{SYSTEM_SUB}</div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-[#0f172a]/80 leading-relaxed mb-3">
          The <strong>AI-Powered</strong> portal enables Tenderers to download tender schedules free of cost and submit bids online.
        </p>
        <p className="text-xs text-[#0f172a]/50">{SYSTEM_SUB}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const railLeft = [
    { icon: AlertOctagon,label: "Reports & Complaints",     to: "/reports-complaints" },
    { icon: FileText,    label: "MIS Reports",               to: "/portal" },
    { icon: MapPin,      label: "Tenders by Location",       to: "/gis"    },
    { icon: Building2,   label: "Tenders by Organisation",   to: "/portal" },
    { icon: Tag,         label: "Tenders by Classification", to: "/portal" },
    { icon: Archive,     label: "Tenders in Archive",        to: "/portal" },
    { icon: ListChecks,  label: "Tenders Status",            to: "/portal" },
    { icon: XCircle,     label: "Cancelled / Retendered",    to: "/portal" },
    { icon: Download,    label: "Downloads",                 to: "/portal" },
    { icon: ShieldCheck, label: "Debarment List",            to: "/portal" },
  ];

  const latest = [
    { t: "Repair and Maintenance — Civil & Electrical Works (16 Nos) and Bathroom (15 Nos) of SOS Mess at Sector HQ Harare", ref: "ZW(WB Sector HQr) 2026-27-CZ-C CellNIT-31", close: "01-Jul-2026 09:30 AM", open: "02-Jul-2026 09:30 AM" },
    { t: "Repair and Maintenance — 48 Nos (out of 96) Type II Government Family Quarters", ref: "B V106 RAF Bn 2026-27-CZ-C Cell NIT-29", close: "01-Jul-2026 09:30 AM", open: "02-Jul-2026 09:30 AM" },
    { t: "Supply of Medical Imaging Equipment — Parirenyatwa Group of Hospitals", ref: "MOH/PARI/2026-27/MED-IMG-04", close: "03-Jul-2026 10:00 AM", open: "04-Jul-2026 10:30 AM" },
    { t: "Construction of Rural Feeder Roads — Mashonaland East Phase II", ref: "MOTID/RDC/2026-MASH-E/PH2", close: "05-Jul-2026 11:00 AM", open: "06-Jul-2026 11:30 AM" },
    { t: "Solar Mini-Grid Installation — Binga District (24 Schools, 8 Clinics)", ref: "MOE-NRG/RURAL-SOL/2026-BG/05", close: "07-Jul-2026 09:00 AM", open: "08-Jul-2026 10:00 AM" },
    { t: "Supply of ARV Medicines — 2-Year Framework Agreement", ref: "MOH/ARV/2026-27/FW-001", close: "15-Jul-2026 10:00 AM", open: "16-Jul-2026 10:00 AM" },
    { t: "National Tax Administration System — Phase II", ref: "ZIMRA/NTAS/2026-PH2", close: "21-Jul-2026 11:00 AM", open: "22-Jul-2026 10:00 AM" },
    { t: "School Textbooks — Primary Grades 1-7 (2026/27)", ref: "MOPSE/TXB/2026-27/01", close: "02-Jul-2026 09:00 AM", open: "03-Jul-2026 10:00 AM" },
  ];

  const corrigenda = [
    { t: "Corrigendum: Replies to Pre-Bid Queries — Highway Rehabilitation Lot 3", ref: "PKG-III/SC/01", close: "30-Jun-2026 12:00 PM", open: "01-Jul-2026 02:00 PM" },
    { t: "Corrigendum: Extension of Closing Date — Hospital Linen Supply", ref: "JD/8962-101-PM-T-7200/1028", close: "10-Jul-2026 12:00 PM", open: "12-Jul-2026 02:00 PM" },
    { t: "Corrigendum: Revised BOQ — Bulawayo Water Treatment Upgrade", ref: "ZINWA/BYO-WTP/2026-COR-02", close: "11-Jul-2026 11:00 AM", open: "12-Jul-2026 11:30 AM" },
    { t: "Corrigendum: Pre-Qualification Extension — Harare Airport Expansion", ref: "CAAZ/HARE/2026-PQ-03", close: "18-Jul-2026 09:00 AM", open: "19-Jul-2026 10:00 AM" },
  ];

  const newsItems = [
    "🔔 All bidders must register a valid Digital Signature Certificate before submitting bids",
    "📡 Tender opening sessions are live-streamed for transparency",
    "🤖 New AI-powered fraud detection module activated for all tenders above USD 100,000",
    "📋 Public procurement plans for FY 2026/27 now published",
    "✅ 1,287 active tenders currently open on Ai Powered e-Government Procurement & Automated Oversight Intelligence System portal",
    "⚠️ Alert: Debarment list updated — 3 new entities added",
    `🏛️ ${SYSTEM_SHORT} — ${SYSTEM_FULL}`,
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#EAF1F8] flex flex-col">
      <TopBar />
      <Header />

      {/* Scrolling news ticker — right to left */}
      <div className="bg-[#1e293b] text-white text-xs border-b border-slate-200/50 overflow-hidden" style={{ height: "30px", display: "flex", alignItems: "center" }}>
        <div className="flex-shrink-0 px-3 font-bold text-slate-400 border-r border-slate-200 mr-3">📢 NEWS</div>
        <div className="flex-1 overflow-hidden relative">
          <div className="news-ticker-track inline-block">
            {newsItems.join("  ·  ")}  ·  {newsItems.join("  ·  ")}
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 py-6 grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-1">
            {railLeft.map((b) => <RailButton key={b.label} icon={b.icon} label={b.label} to={b.to} />)}
            {/* Quick stats panel — fills remaining left sidebar space */}
            <div className="bg-white border border-[#1e3a5f]/30 mt-2" style={{ borderRadius: 0 }}>
              <div className="bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest">
                Portal Stats
              </div>
              <div className="divide-y divide-[#1e3a5f]/10">
                {[
                  { label: "Active Tenders",    value: "1,287" },
                  { label: "Registered Bidders",value: "12,847" },
                  { label: "Awards This Month", value: "249" },
                  { label: "Open Corrigendums", value: "38" },
                  { label: "Blacklisted Firms",  value: "14" },
                  { label: "Total Contracts",   value: "964" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] text-[#0f172a]/60">{s.label}</span>
                    <span className="text-xs font-bold text-[#0f172a]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#1e3a5f]/30" style={{ borderRadius: 0 }}>
              <div className="bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest">
                Upcoming Closings
              </div>
              <div className="divide-y divide-[#1e3a5f]/10">
                {[
                  { date: "01 Jul", label: "Civil Works Harare" },
                  { date: "03 Jul", label: "Medical Equipment" },
                  { date: "07 Jul", label: "Solar Mini-Grids" },
                  { date: "15 Jul", label: "ARV Framework" },
                  { date: "18 Jul", label: "Airport Expansion" },
                  { date: "21 Jul", label: "Tax Admin System" },
                ].map(d => (
                  <div key={d.label} className="flex items-start gap-2 px-3 py-2">
                    <span className="text-[10px] font-bold text-[#0F172A] whitespace-nowrap mt-0.5 w-12 shrink-0">{d.date}</span>
                    <span className="text-[10px] text-[#0f172a]/70 leading-tight">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <section className="col-span-12 md:col-span-9 lg:col-span-7 space-y-4">
            <Welcome />

            {/* ── What's New — 4 new platform features ── */}
            <div className="bg-[#0f172a] border border-slate-200/60" style={{ borderRadius: 0 }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">What's New — Platform Upgrades</span>
                  <span className="text-[10px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 animate-pulse" style={{ borderRadius: 0 }}>JULY 2026</span>
                </div>
                <Link to="/signin" className="text-[10px] text-slate-400 hover:underline">Sign in to access →</Link>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {[
                  { icon: Send,       color: "text-slate-400",    label: "⚡ Intake Portal",            desc: "Single front door — AI routes requests to the right workflow in 1.4s. No more manual routing confusion.",                route: "/signin" },
                  { icon: Globe2,     color: "text-slate-500", label: "🌐 Supplier Marketplace",     desc: "12,847 verified government suppliers with real-time performance scores and market pricing benchmarks.",                route: "/signin" },
                  { icon: Bot,        color: "text-slate-400",  label: "🤖 151+ Autonomous Agents",   desc: "AI agents auto-approve, auto-route, auto-escalate 24/7. 94.2% autonomous rate — no human click needed.",              route: "/signin" },
                  { icon: TrendingUp, color: "text-slate-500",   label: "💡 Spend Intelligence",       desc: "Real-time pricing vs market benchmarks. 4 anomalies detected. USD 1.85M/yr savings opportunities identified.",        route: "/signin" },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <Link key={f.label} to={f.route}
                      className="flex items-start gap-3 p-3 bg-[#0f172a] hover:bg-[#1e293b] transition-colors cursor-pointer group">
                      <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center flex-shrink-0 mt-0.5 group-hover:bg-white/15">
                        <Icon className={`h-4 w-4 ${f.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white">{f.label}</div>
                        <div className="text-[10px] text-white/50 leading-relaxed mt-0.5">{f.desc}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <ScrollingTenderTable title="Latest Tenders" rows={latest} />
            <ScrollingTenderTable title="Latest Corrigendums" rows={corrigenda} />
          </section>
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <LoginCard />
            <Link to="/reports-complaints"
              className="block border-2 border-red-600/70 bg-white hover:bg-red-50 transition-colors" style={{ borderRadius: 0 }}>
              <div className="bg-red-700 text-white text-sm font-bold px-3 py-2 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Reports & Complaints
              </div>
              <div className="p-3 text-xs text-[#0f172a]/80 leading-relaxed">
                Report procurement misconduct, bid-rigging or corruption. Access public reports and track your case. <strong>Anonymous submissions accepted.</strong>
              </div>
            </Link>
            <SearchCard />
            <HelpCard />
            {/* Procurement notices — fills remaining right sidebar space */}
            <div className="bg-white border border-[#1e3a5f]/30" style={{ borderRadius: 0 }}>
              <div className="bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5">
                <Bell className="w-3 h-3" /> Procurement Notices
              </div>
              <div className="divide-y divide-[#1e3a5f]/10">
                {[
                  { tag: "NEW",   color: "bg-[#0F172A]", text: "FY 2026/27 Procurement Plans Published" },
                  { tag: "ALERT", color: "bg-red-600",     text: "3 firms added to Debarment List — July 2026" },
                  { tag: "INFO",  color: "bg-[#0F172A]",    text: "Digital Signature Certificate (DSC) now mandatory" },
                  { tag: "INFO",  color: "bg-[#0F172A]",    text: "Bid opening sessions streamed live on portal" },
                  { tag: "NEW",   color: "bg-[#0F172A]", text: "e-Payment module activated for all ministries" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2">
                    <span className={`text-[9px] font-black text-white px-1.5 py-0.5 shrink-0 mt-0.5 ${n.color}`}>{n.tag}</span>
                    <span className="text-[11px] text-[#0f172a]/75 leading-snug">{n.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#1e3a5f]/30" style={{ borderRadius: 0 }}>
              <div className="bg-[#0f172a] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Integrity Contacts
              </div>
              <div className="p-3 space-y-2 text-[11px] text-[#0f172a]/70">
                <div className="flex items-center gap-2"><Phone className="w-3 h-3 shrink-0 text-[#0F172A]" /><span>PRAZ Hotline: +263 242 700 001</span></div>
                <div className="flex items-center gap-2"><Mail className="w-3 h-3 shrink-0 text-[#0F172A]" /><span>integrity@praz.gov.zw</span></div>
                <div className="flex items-center gap-2"><Globe2 className="w-3 h-3 shrink-0 text-[#0F172A]" /><span>www.praz.gov.zw</span></div>
                <Link to="/reports-complaints" className="block mt-2 text-center bg-[#0f172a] text-white text-[10px] font-bold py-2 hover:bg-[#1e293b] transition-colors appois-glow-on-hover" style={{ borderRadius: 0 }}>
                  Report Misconduct →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-white text-sm mt-2">
        <div className="max-w-[1280px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <CoatOfArms className="w-10 h-10" />
              <div className="font-bold text-base leading-tight">
                {SYSTEM_SHORT}<br />
                <span className="text-white/70 text-xs font-normal">{SYSTEM_FULL}</span>
              </div>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">{SYSTEM_SUB}.<br />Powered by the Procurement Regulatory Authority (PRAZ).</p>
          </div>
          <div>
            <div className="font-semibold mb-2 text-slate-400">Quick Links</div>
            <ul className="space-y-1 text-white/70 text-xs">
              <li><Link to="/signin" className="hover:underline">Bidder Login</Link></li>
              <li><Link to="/portal" className="hover:underline">Public Portal</Link></li>
              <li><Link to="/signin" className="hover:underline">Officer Login</Link></li>
              <li><Link to="/portal" className="hover:underline">Active Tenders</Link></li>
              <li><Link to="/portal" className="hover:underline">Bid Awards</Link></li>
              <li><Link to="/portal" className="hover:underline">Debarment List</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2 text-slate-400">Contact</div>
            <ul className="space-y-1 text-white/70 text-xs">
              <li className="flex items-center gap-2"><Phone className="w-3 h-3" /> +263 242 700 000</li>
              <li><a href="mailto:support@govtender.gov.zw" className="flex items-center gap-2 hover:underline"><Mail className="w-3 h-3" /> support@govtender.gov.zw</a></li>
              <li><a href="https://www.govtender.gov.zw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Globe2 className="w-3 h-3" /> www.govtender.gov.zw</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1280px] mx-auto px-4 py-3 text-xs text-white/50 flex items-center justify-between flex-wrap gap-2">
            <span>© {new Date().getFullYear()} {SYSTEM_SHORT} — {SYSTEM_FULL}. All rights reserved.</span>
            <span>Best viewed in Chrome / Edge / Firefox at 1280×768</span>
          </div>
        </div>
      </footer>
    </div>
  );
}



