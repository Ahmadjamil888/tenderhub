/**
 * AssetDeclarationsPage — Section 9.6
 * Public officer asset & interest declaration filing portal.
 * Features: working sign-in (fixed), multi-step declaration form,
 * submission tracking, notifications.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft,
  FileText, Bell, Clock, Eye, Download, Printer, Share2,
  Home, Building2, Car, Briefcase, DollarSign, Users,
  AlertTriangle, Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";

// ── Declaration steps ─────────────────────────────────────────────────────────
const DECLARE_STEPS = [
  "Personal Details",
  "Immovable Properties",
  "Movable Assets",
  "Financial Interests",
  "Business Interests",
  "Liabilities & Debts",
  "Declaration & Submit",
];

// ── Mock previous declarations ────────────────────────────────────────────────
const MOCK_DECLARATIONS = [
  { id: "AD-2026-00082", year: "2025/2026", status: "Submitted",  submitted: "15 Jan 2026", review: "Approved"  },
  { id: "AD-2025-00071", year: "2024/2025", status: "Approved",   submitted: "12 Jan 2025", review: "Approved"  },
  { id: "AD-2024-00058", year: "2023/2024", status: "Approved",   submitted: "18 Jan 2024", review: "Approved"  },
];

const STATUS_STYLE: Record<string, string> = {
  Submitted: "bg-amber-100 text-amber-800",
  Approved:  "bg-emerald-100 text-emerald-700",
  Pending:   "bg-slate-100 text-slate-600",
  Rejected:  "bg-red-100 text-red-700",
};

// ── Field section component ───────────────────────────────────────────────────
function FieldBox({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  const [val, setVal] = useState("");
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder={placeholder ?? "—"}
        className="w-full text-sm text-slate-800 border-none outline-none bg-transparent placeholder-slate-300"
      />
    </div>
  );
}

export default function AssetDeclarationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [view, setView] = useState<"home" | "declare" | "track">("home");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // ── Step content per declaration step ──────────────────────────────────────
  const STEP_CONTENT: Record<number, React.ReactNode> = {
    0: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldBox label="FULL NAME" placeholder="e.g. Dr. Tendai Moyo" />
        <FieldBox label="NATIONAL ID / PASSPORT NO" placeholder="63-123456 A 72" />
        <FieldBox label="WORK EMAIL" placeholder="name@ministry.gov.zw" />
        <FieldBox label="PHONE NUMBER" placeholder="+263 7X XXX XXXX" />
        <FieldBox label="MINISTRY / ENTITY" placeholder="e.g. Ministry of Finance" />
        <FieldBox label="DESIGNATION / GRADE" placeholder="e.g. Permanent Secretary, Grade A" />
        <FieldBox label="DECLARATION YEAR" placeholder="e.g. 2025/2026" />
        <FieldBox label="DATE OF FILING" type="date" />
      </div>
    ),
    1: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
          <Home className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          Declare all immovable properties including stands, houses, farms, and any property registered in your name or held in trust.
        </div>
        {[1, 2].map(n => (
          <div key={n} className="border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-700 mb-3">Property {n}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldBox label="PROPERTY TYPE" placeholder="e.g. Residential Stand" />
              <FieldBox label="STAND / ERF NO" placeholder="e.g. Stand 4821, Borrowdale" />
              <FieldBox label="LOCATION / PROVINCE" placeholder="e.g. Harare" />
              <FieldBox label="APPROXIMATE VALUE (USD)" placeholder="e.g. 85,000" />
              <FieldBox label="HOW ACQUIRED" placeholder="e.g. Purchase / Inheritance" />
              <FieldBox label="DATE ACQUIRED" type="date" />
            </div>
          </div>
        ))}
      </div>
    ),
    2: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
          <Car className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          Declare all movable assets: vehicles, livestock, equipment, and items of significant value (over USD 1,000).
        </div>
        {[1, 2].map(n => (
          <div key={n} className="border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-700 mb-3">Asset {n}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldBox label="ASSET TYPE" placeholder="e.g. Motor Vehicle" />
              <FieldBox label="MAKE / MODEL / YEAR" placeholder="e.g. Toyota Hilux 2022" />
              <FieldBox label="REGISTRATION NO" placeholder="e.g. ABZ 1234" />
              <FieldBox label="APPROXIMATE VALUE (USD)" placeholder="e.g. 32,000" />
            </div>
          </div>
        ))}
      </div>
    ),
    3: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldBox label="BANK NAME" placeholder="e.g. CBZ Bank" />
        <FieldBox label="ACCOUNT TYPE" placeholder="e.g. Current / Savings" />
        <FieldBox label="APPROXIMATE BALANCE (USD)" placeholder="e.g. 12,000" />
        <FieldBox label="SHARES / SECURITIES" placeholder="e.g. ZSE-listed shares — approx. value" />
        <FieldBox label="PENSION FUND / GRATUITY" placeholder="e.g. NSSA / PSMAS" />
        <FieldBox label="OTHER FINANCIAL INTERESTS" placeholder="e.g. Unit trusts, bonds" />
      </div>
    ),
    4: (
      <div className="space-y-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2">
          <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          Declare any business interests, directorships, partnerships or shareholdings — including interests held by spouse or dependent relatives.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldBox label="COMPANY / ENTITY NAME" placeholder="e.g. Moyo Trading (Pvt) Ltd" />
          <FieldBox label="REGISTRATION NO" placeholder="e.g. 1234/2020" />
          <FieldBox label="NATURE OF INTEREST" placeholder="e.g. Director / Shareholder" />
          <FieldBox label="SHAREHOLDING %" placeholder="e.g. 40%" />
          <FieldBox label="NATURE OF BUSINESS" placeholder="e.g. General Trading" />
          <FieldBox label="ANY CONFLICT OF INTEREST?" placeholder="Yes / No — explain if Yes" />
        </div>
      </div>
    ),
    5: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldBox label="MORTGAGE / HOME LOAN" placeholder="e.g. CABS — USD 25,000 outstanding" />
        <FieldBox label="VEHICLE FINANCE" placeholder="e.g. FBC — USD 8,000 outstanding" />
        <FieldBox label="PERSONAL LOANS" placeholder="e.g. Nil / or details" />
        <FieldBox label="CREDIT CARDS" placeholder="e.g. Nil / or details" />
        <FieldBox label="OTHER LIABILITIES" placeholder="e.g. Business loans, guarantees" />
        <FieldBox label="TOTAL ESTIMATED LIABILITIES (USD)" placeholder="e.g. 33,000" />
      </div>
    ),
    6: (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
          Review your declaration summary below, sign and submit. Your declaration will be reviewed by the Anti-Corruption Commission and relevant oversight authority.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { l: "DECLARANT",        v: user?.name ?? "—"              },
            { l: "MINISTRY",         v: user?.entity ?? "—"            },
            { l: "DESIGNATION",      v: user?.department ?? "—"        },
            { l: "DECLARATION YEAR", v: "2025/2026"                    },
            { l: "DATE FILED",       v: new Date().toLocaleDateString() },
            { l: "STATUS",           v: "DRAFT — Awaiting Submission"  },
          ].map(f => (
            <div key={f.l} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.l}</div>
              <div className="text-sm text-slate-800 mt-0.5">{f.v}</div>
            </div>
          ))}
        </div>
        <label className="flex items-start gap-3 cursor-pointer bg-white border border-slate-200 rounded-xl p-4">
          <input type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="text-xs text-slate-700">
            I, the undersigned, hereby declare that the information provided in this declaration is true, accurate and complete to the best of my knowledge. I am aware that providing false or misleading information is an offence under the Public Service Act and the Anti-Corruption Act of Zimbabwe.
          </span>
        </label>
        <ApprovalSignatureBlock
          createdBy={{ name: user?.name ?? "Current User", date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }}
          showComments={true}
        />
      </div>
    ),
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-0 h-full">
        {/* Gov Header */}
        <div className="bg-[#0f172a] text-white px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                GOVERNMENT OF THE REPUBLIC OF ZIMBABWE — PUBLIC SERVICE COMMISSION
              </div>
              <div className="text-base font-black uppercase tracking-wide mt-0.5 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Asset &amp; Interest Declarations Portal
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Public Officer Annual Declaration · Anti-Corruption Commission Integrated
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 shrink-0">
          <div className="flex gap-0">
            {([
              { k: "home",    label: "🏠 My Declarations" },
              { k: "declare", label: "📝 File New Declaration" },
              { k: "track",   label: "📊 Track Status" },
            ] as { k: typeof view; label: string }[]).map(t => (
              <button key={t.k} onClick={() => { setView(t.k); setSubmitted(false); setStep(0); }}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${view === t.k ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-6 py-6">

          {/* HOME — previous declarations */}
          {view === "home" && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-lg font-black text-slate-900">My Declarations</div>
                  <div className="text-xs text-slate-500">Annual asset and interest declarations filed by {user?.name ?? "you"}</div>
                </div>
                <button onClick={() => { setView("declare"); setStep(0); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-slate-800">
                  <FileText className="h-4 w-4" /> File New Declaration
                </button>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { l: "Total Filed",     v: MOCK_DECLARATIONS.length,                                   c: "text-slate-800" },
                  { l: "Approved",        v: MOCK_DECLARATIONS.filter(d => d.review === "Approved").length, c: "text-emerald-600" },
                  { l: "Current Year",    v: "2025/2026",                                                 c: "text-[#0f172a]" },
                ].map(k => (
                  <div key={k.l} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-black ${k.c}`}>{k.v}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">{k.l}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {MOCK_DECLARATIONS.map(d => (
                  <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-400">{d.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[d.review] ?? "bg-slate-100"}`}>{d.review}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">Declaration — FY {d.year}</div>
                      <div className="text-xs text-slate-500">Submitted: {d.submitted}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Bell className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-800">2025/2026 Declaration Due</div>
                  <div className="text-xs text-amber-700 mt-0.5">All public officers must file their annual declaration by 31 January 2026. Late declarations attract a penalty under Section 21 of the Public Service Act.</div>
                </div>
              </div>
            </div>
          )}

          {/* DECLARE — multi-step form */}
          {view === "declare" && !submitted && (
            <div className="max-w-2xl mx-auto">
              {/* AI Control Banner */}
              <div className="bg-[#0f172a] text-white rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">AI Declaration Assistant</div>
                  <div className="text-[10px] text-slate-400">I will guide you through the declaration process. All fields are mandatory unless marked optional.</div>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-5">
                {DECLARE_STEPS.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => i <= step && setStep(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        i < step  ? "bg-emerald-600 text-white" :
                        i === step ? "bg-[#0f172a] text-white" :
                        "border border-slate-300 text-slate-400"}`}>
                      {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      <span className="hidden sm:inline">{s}</span>
                    </button>
                    {i < DECLARE_STEPS.length - 1 && <div className="h-px w-2 bg-slate-200 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Step {step + 1} of {DECLARE_STEPS.length}</div>
                <h2 className="text-base font-bold text-slate-900 mb-4">{DECLARE_STEPS[step]}</h2>
                {STEP_CONTENT[step]}
              </div>

              <div className="flex items-center justify-between mt-4">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {step < DECLARE_STEPS.length - 1 ? (
                  <button onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={() => setSubmitted(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                    <Shield className="h-4 w-4" /> Submit Declaration
                  </button>
                )}
              </div>

              <div className="mt-4">
                <WorkflowActionBar
                  visibleButtons={step === DECLARE_STEPS.length - 1
                    ? ["back", "saveDraft", "approve", "authorize", "submit"]
                    : ["back", "saveDraft"]}
                  onBack={() => step > 0 ? setStep(s => s - 1) : setView("home")}
                />
              </div>
            </div>
          )}

          {/* SUBMITTED confirmation */}
          {view === "declare" && submitted && (
            <div className="max-w-xl mx-auto text-center py-12">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Declaration Submitted</h2>
              <p className="text-sm text-slate-500 mb-6">Your asset and interest declaration for FY 2025/2026 has been submitted to the Anti-Corruption Commission and the Public Service Commission for review.</p>
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference Number</div>
                <div className="text-2xl font-black text-[#0f172a] mt-1">AD-2026-{Math.floor(Math.random() * 90000 + 10000)}</div>
                <div className="text-xs text-slate-400 mt-1">Keep this reference number for your records</div>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setView("home"); setSubmitted(false); }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to Home</button>
                <button onClick={() => setView("track")} className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold">Track Status</button>
              </div>
            </div>
          )}

          {/* TRACK */}
          {view === "track" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-sm font-bold text-slate-800 mb-4">Declaration Status Tracker</div>
              <div className="space-y-4">
                {MOCK_DECLARATIONS.map(d => (
                  <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs font-mono text-slate-400">{d.id}</div>
                        <div className="text-sm font-bold text-slate-900">FY {d.year} — Annual Declaration</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${STATUS_STYLE[d.review] ?? "bg-slate-100"}`}>{d.review}</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { s: "Filed",               done: true,  date: d.submitted     },
                        { s: "ACC Receipt",          done: true,  date: d.submitted     },
                        { s: "Under Review",         done: d.review !== "Pending", date: "—" },
                        { s: "Approved / Finalised", done: d.review === "Approved", date: d.review === "Approved" ? "Confirmed" : "—" },
                      ].map((stage, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${stage.done ? "bg-emerald-600" : "border-2 border-slate-200"}`}>
                            {stage.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div className="flex-1 text-xs text-slate-700">{stage.s}</div>
                          <div className="text-[10px] text-slate-400">{stage.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
