/**
 * ReportServiceDeliveryPage — Section 9.7
 * Citizens / guest users report maintenance / service-delivery issues for
 * public infrastructure: buildings, roads, railway, ports, machinery, vehicles,
 * equipment, plant, aviation.
 *
 * Features:
 * - Guest access (no full registration needed)
 * - GIS/GPS pin location (map picker, auto-detect + manual)
 * - Photo, voice note, document upload
 * - Free-text description + issue category
 * - Chat/comment thread with admin
 * - Admin CRM ticket auto-routing by category
 * - HOD ticket-aging dashboard + SMS/Email/WhatsApp push
 */
import { useState } from "react";
import {
  AlertTriangle, MapPin, Camera, Upload, Send, CheckCircle2,
  Clock, Building2, Phone, Mail, MessageSquare, FileText,
  Search, ChevronRight, ChevronDown, Mic, Loader2,
  BarChart3, Bell, Users, Wrench, Truck, Plane,
  Navigation, Plus, X, Eye, ArrowLeft, RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Issue categories per Section 9.7 ────────────────────────────────────────
const ISSUE_CATEGORIES = [
  { id: "roads",     label: "Roads & Highways",          icon: Truck,       dept: "Ministry of Transport",             color: "bg-amber-500"   },
  { id: "buildings", label: "Government Buildings",      icon: Building2,   dept: "Ministry of Public Works",          color: "bg-slate-600"   },
  { id: "water",     label: "Water & Sanitation",        icon: RefreshCw,   dept: "Zimbabwe National Water Authority", color: "bg-blue-600"    },
  { id: "power",     label: "Electricity / Power",       icon: Bell,        dept: "ZESA Holdings",                     color: "bg-yellow-600"  },
  { id: "railway",   label: "Railway Infrastructure",    icon: Navigation,  dept: "National Railways of Zimbabwe",     color: "bg-[#0f172a]"   },
  { id: "ports",     label: "Ports of Entry / Dry Ports",icon: MapPin,      dept: "Zimbabwe Revenue Authority",        color: "bg-teal-700"    },
  { id: "vehicles",  label: "Government Vehicles",       icon: Truck,       dept: "Ministry of Finance — Fleet",       color: "bg-orange-600"  },
  { id: "equipment", label: "Machinery & Equipment",     icon: Wrench,      dept: "Ministry of Industry",              color: "bg-purple-700"  },
  { id: "aviation",  label: "Aviation Infrastructure",   icon: Plane,       dept: "Civil Aviation Authority (CAAZ)",   color: "bg-sky-700"     },
  { id: "other",     label: "Other Public Infrastructure",icon: Wrench,     dept: "Ministry of Local Governance",      color: "bg-gray-600"    },
];

// ── Mock existing reports ────────────────────────────────────────────────────
const MOCK_REPORTS = [
  { id: "RSP-2026-0918", category: "roads",     title: "Large pothole on Samora Machel Ave",   location: "Samora Machel Avenue, Harare",  status: "in-progress", submitted: "20 Jul 2026", dept: "Ministry of Transport",         priority: "High"   },
  { id: "RSP-2026-0917", category: "water",     title: "No water supply — 3 days",             location: "Mabelreign, Harare",            status: "pending",     submitted: "21 Jul 2026", dept: "Zimbabwe National Water Authority",priority: "High"   },
  { id: "RSP-2026-0916", category: "power",     title: "Frequent power cuts — CBD",            location: "CBD, Harare",                   status: "resolved",    submitted: "18 Jul 2026", dept: "ZESA Holdings",                  priority: "Medium" },
  { id: "RSP-2026-0915", category: "buildings", title: "Roof collapse risk — Govt Offices",   location: "Baker Avenue, Harare",          status: "pending",     submitted: "19 Jul 2026", dept: "Ministry of Public Works",        priority: "Critical" },
  { id: "RSP-2026-0914", category: "railway",   title: "Damaged railway sleepers — Gweru",   location: "Gweru Station, Midlands",       status: "in-progress", submitted: "17 Jul 2026", dept: "National Railways of Zimbabwe",  priority: "High"   },
];

const STATUS_STYLE: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-800",
  "in-progress":"bg-blue-100 text-blue-800",
  resolved:    "bg-emerald-100 text-emerald-700",
};
const PRIORITY_STYLE: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-slate-100 text-slate-600",
};

const REPORT_STEPS = ["Category", "Location", "Description", "Media Upload", "Contact Details", "Review & Submit"];

export default function ReportServiceDeliveryPage() {
  const [view, setView] = useState<"home" | "report" | "track" | "admin">("home");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [chatMsg, setChatMsg] = useState("");
  const [chatThread, setChatThread] = useState<{ from: string; msg: string; time: string }[]>([
    { from: "Admin", msg: "Your report RSP-2026-0917 has been received and assigned to the Water Authority. An officer will be dispatched within 48 hours.", time: "21 Jul 10:32" },
  ]);
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[0] | null>(null);
  const [trackId, setTrackId] = useState("");

  const cat = ISSUE_CATEGORIES.find(c => c.id === selectedCat);

  const detectGPS = () => {
    setGpsDetecting(true);
    setTimeout(() => {
      setLocationText("17°49'45\"S 31°03'27\"E — Harare CBD, Zimbabwe (auto-detected)");
      setGpsDetecting(false);
    }, 1500);
  };

  const handleSubmit = () => {
    const newReport = {
      id: `RSP-2026-${Math.floor(Math.random() * 900 + 100)}`,
      category: selectedCat,
      title: description.slice(0, 50) || "Service delivery issue",
      location: locationText || "Location not specified",
      status: "pending" as const,
      submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dept: cat?.dept ?? "Ministry of Local Governance",
      priority: "Medium",
    };
    setReports(r => [newReport, ...r]);
    setSubmitted(true);
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatThread(t => [...t, { from: "You", msg: chatMsg, time: new Date().toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatMsg("");
    setTimeout(() => {
      setChatThread(t => [...t, { from: "Admin", msg: "Thank you for your update. We have noted your comment and will escalate to the HOD.", time: new Date().toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {/* Government header */}
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
            <div className="text-base font-black uppercase tracking-wide mt-0.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Report Service Delivery
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Report public infrastructure issues · Guest access · No registration required</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="bg-white border-b border-slate-200 px-5">
        <div className="max-w-5xl mx-auto flex gap-0">
          {([
            { k: "home",   label: "🏠 Home"                },
            { k: "report", label: "📝 Submit Report"       },
            { k: "track",  label: "📊 Track My Report"     },
            { k: "admin",  label: "🔒 Admin / HOD View"    },
          ] as { k: typeof view; label: string }[]).map(t => (
            <button key={t.k} onClick={() => { setView(t.k); setSubmitted(false); setStep(0); }}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${view === t.k ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-5 py-6">

        {/* ── HOME ── */}
        {view === "home" && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Report a Service Delivery Issue</h1>
              <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">Citizens can report potholes, building damage, broken water mains, power outages and other public infrastructure problems — no account required.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {[
                { label: "Reports Today",     val: "47",  color: "text-slate-800" },
                { label: "Pending",           val: "23",  color: "text-amber-600" },
                { label: "In Progress",       val: "18",  color: "text-blue-600"  },
                { label: "Resolved This Week",val: "112", color: "text-emerald-600" },
                { label: "Avg Response Time", val: "4.2h",color: "text-slate-600" },
              ].map(k => (
                <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {ISSUE_CATEGORIES.slice(0,5).map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setView("report"); setStep(1); }}
                  className={`${cat.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}>
                  <cat.icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-xs font-bold">{cat.label}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ISSUE_CATEGORIES.slice(5).map(cat => (
                <button key={cat.id} onClick={() => { setSelectedCat(cat.id); setView("report"); setStep(1); }}
                  className={`${cat.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}>
                  <cat.icon className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-xs font-bold">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORT FORM ── */}
        {view === "report" && !submitted && (
          <div className="max-w-2xl mx-auto">
            {/* Stepper */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6">
              {REPORT_STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      i < step ? "bg-emerald-600 text-white" :
                      i === step ? "bg-[#0f172a] text-white" :
                      "border border-slate-300 text-slate-400"}`}>
                    {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                    <span className="hidden sm:inline">{s}</span>
                  </button>
                  {i < REPORT_STEPS.length - 1 && <div className="h-px w-3 bg-slate-200 flex-shrink-0" />}
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="text-sm font-bold text-slate-800 mb-4">Step {step + 1}: {REPORT_STEPS[step]}</div>

              {step === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {ISSUE_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setSelectedCat(c.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selectedCat === c.id ? "border-[#0f172a] bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <div className={`h-8 w-8 rounded-lg ${c.color} flex items-center justify-center flex-shrink-0`}>
                        <c.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                      {selectedCat === c.id && <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">GPS / AUTO-DETECT LOCATION</label>
                    <button onClick={detectGPS} disabled={gpsDetecting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f172a] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60 mb-3">
                      {gpsDetecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                      {gpsDetecting ? "Detecting…" : "Auto-Detect My Location"}
                    </button>
                    {locationText && <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {locationText}</div>}
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">OR ENTER LOCATION MANUALLY</label>
                    <input value={locationText} onChange={e => setLocationText(e.target.value)}
                      placeholder="e.g. Samora Machel Ave, near City Hall, Harare"
                      className="w-full text-sm text-slate-800 border-none outline-none bg-transparent" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">A map pin-drop interface is available in the mobile app. For web, enter your location text or use auto-detect above.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">DESCRIBE THE ISSUE *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                      placeholder="Describe the problem in detail — severity, duration, impact on residents…"
                      className="w-full text-sm text-slate-800 border-none outline-none resize-none bg-transparent" />
                  </div>
                  {cat && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-md ${cat.color} flex items-center justify-center flex-shrink-0`}>
                        <cat.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700">This report will be routed to: {cat.dept}</div>
                        <div className="text-[10px] text-slate-400">HOD will receive SMS, Email and WhatsApp notification</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: "PHOTO UPLOAD", icon: Camera, desc: "Upload photos of the issue (JPG, PNG — max 10MB each)" },
                      { label: "VOICE NOTE", icon: Mic, desc: "Record or upload an audio description (MP3, WAV — max 5MB)" },
                      { label: "DOCUMENT", icon: FileText, desc: "Attach supporting documents (PDF, DOC — max 20MB)" },
                    ].map(u => (
                      <label key={u.label} className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#0f172a] hover:bg-slate-50 transition-all">
                        <input type="file" className="hidden" />
                        <u.icon className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <div className="text-xs font-bold text-slate-600">{u.label}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{u.desc}</div>
                        <div className="mt-2 text-[10px] text-[#0f172a] font-semibold">Click to upload</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 flex items-start gap-2">
                    <Bell className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    Contact details are optional. Providing them allows us to send you status updates.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "YOUR NAME (OPTIONAL)", val: contactName, set: setContactName, ph: "e.g. Tendai Moyo" },
                      { label: "PHONE (OPTIONAL)", val: contactPhone, set: setContactPhone, ph: "+263 7X XXX XXXX" },
                    ].map(f => (
                      <div key={f.label} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{f.label}</label>
                        <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                          className="w-full text-sm text-slate-800 border-none outline-none bg-transparent" />
                      </div>
                    ))}
                    <div className="md:col-span-2 border border-slate-200 rounded-lg p-3 bg-white">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">EMAIL (OPTIONAL)</label>
                      <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="your@email.com"
                        className="w-full text-sm text-slate-800 border-none outline-none bg-transparent" />
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-600 mb-2">Review your report before submitting:</div>
                  {[
                    { label: "CATEGORY",    val: cat?.label ?? "—" },
                    { label: "LOCATION",    val: locationText || "—" },
                    { label: "DESCRIPTION", val: description || "—" },
                    { label: "ROUTED TO",   val: cat?.dept ?? "—" },
                    { label: "CONTACT",     val: contactName || contactPhone ? `${contactName} ${contactPhone}`.trim() : "Anonymous" },
                  ].map(f => (
                    <div key={f.label} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.label}</div>
                      <div className="text-sm text-slate-800 mt-0.5">{f.val}</div>
                    </div>
                  ))}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5" />
                    <span className="text-xs text-slate-600">I confirm the information provided is accurate and complete. I understand that this report will be sent to the responsible government department.</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < REPORT_STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !selectedCat}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold disabled:opacity-40">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
                  <Send className="h-4 w-4" /> Submit Report
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SUBMITTED CONFIRMATION ── */}
        {view === "report" && submitted && (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Report Submitted Successfully</h2>
            <p className="text-sm text-slate-500 mb-6">Your report has been assigned a reference number and routed to the responsible department. {cat?.dept} will be notified immediately via SMS, Email and WhatsApp.</p>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Reference Number</div>
              <div className="text-2xl font-black text-[#0f172a] mt-1">RSP-2026-{Math.floor(Math.random() * 900 + 100)}</div>
              <div className="text-xs text-slate-400 mt-1">Use this to track your report</div>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setView("track"); setSubmitted(false); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Track Report</button>
              <button onClick={() => { setSubmitted(false); setStep(0); setSelectedCat(""); setDescription(""); setLocationText(""); }} className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold">Submit Another</button>
            </div>
          </div>
        )}

        {/* ── TRACK ── */}
        {view === "track" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={trackId} onChange={e => setTrackId(e.target.value)}
                  placeholder="Enter reference number e.g. RSP-2026-0917"
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20" />
              </div>
              <span className="text-xs text-slate-500">or browse below</span>
            </div>

            {selectedReport ? (
              <div>
                <button onClick={() => setSelectedReport(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
                  <ArrowLeft className="h-4 w-4" /> Back to list
                </button>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-[#0f172a] text-white px-5 py-3">
                    <div className="text-xs font-bold">{selectedReport.title}</div>
                    <div className="text-[10px] text-slate-400">Ref: {selectedReport.id} · {selectedReport.submitted}</div>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3 mb-4">
                    {[
                      { l: "REFERENCE",   v: selectedReport.id         },
                      { l: "STATUS",      v: selectedReport.status     },
                      { l: "PRIORITY",    v: selectedReport.priority   },
                      { l: "DEPARTMENT",  v: selectedReport.dept       },
                      { l: "LOCATION",    v: selectedReport.location   },
                      { l: "SUBMITTED",   v: selectedReport.submitted  },
                    ].map(f => (
                      <div key={f.l} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.l}</div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5 capitalize">{f.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Comment / chat thread */}
                  <div className="border-t border-slate-200 p-5">
                    <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Comments & Updates</div>
                    <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
                      {chatThread.map((c, i) => (
                        <div key={i} className={`flex gap-2 ${c.from === "You" ? "justify-end" : ""}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${c.from === "You" ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-700"}`}>
                            <div className="font-bold mb-0.5">{c.from}</div>
                            {c.msg}
                            <div className={`text-[10px] mt-1 ${c.from === "You" ? "text-slate-300" : "text-slate-400"}`}>{c.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendChat()}
                        placeholder="Add a comment or update…"
                        className="flex-1 h-8 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20" />
                      <button onClick={sendChat} className="h-8 px-3 rounded-lg bg-[#0f172a] text-white text-xs flex items-center gap-1">
                        <Send className="h-3 w-3" /> Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} onClick={() => setSelectedReport(r)}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-400">{r.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${PRIORITY_STYLE[r.priority] ?? "bg-slate-100 text-slate-600"}`}>{r.priority}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{r.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.location} · {r.dept}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[r.status] ?? "bg-slate-100"}`}>{r.status.replace("-"," ")}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADMIN / HOD VIEW ── */}
        {view === "admin" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#0f172a] text-white rounded-xl px-5 py-4 mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">HOD DASHBOARD — SERVICE DELIVERY REPORTS</div>
              <div className="text-sm font-black">Ticket Aging Report · Push Notifications: SMS · Email · WhatsApp</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Open Tickets",    val: reports.filter(r => r.status !== "resolved").length, color: "text-amber-600" },
                { label: "Critical",        val: reports.filter(r => r.priority === "Critical").length, color: "text-red-600" },
                { label: "In Progress",     val: reports.filter(r => r.status === "in-progress").length, color: "text-blue-600" },
                { label: "Resolved Today",  val: "3", color: "text-emerald-600" },
              ].map(k => (
                <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#1a6b3a] text-white">
                <div className="grid grid-cols-6 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide">
                  <span>REF NO</span><span>ISSUE</span><span>LOCATION</span><span>PRIORITY</span><span>STATUS</span><span>ACTION</span>
                </div>
              </div>
              {reports.map((r, i) => (
                <div key={r.id} className={`grid grid-cols-6 px-4 py-3 text-xs border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} items-center`}>
                  <span className="font-mono text-slate-500">{r.id}</span>
                  <span className="font-medium text-slate-800 truncate pr-2">{r.title}</span>
                  <span className="text-slate-600 truncate pr-2">{r.location}</span>
                  <span><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${PRIORITY_STYLE[r.priority] ?? "bg-slate-100"}`}>{r.priority}</span></span>
                  <span><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[r.status] ?? "bg-slate-100"}`}>{r.status.replace("-"," ")}</span></span>
                  <button onClick={() => { setSelectedReport(r); setView("track"); }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0f172a] hover:underline">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
