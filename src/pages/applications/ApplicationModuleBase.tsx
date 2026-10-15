/**
 * ApplicationModuleBase — Shared base for all 6 application portal modules.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Sparkles, AlertTriangle,
  Upload, Bell, MessageSquare, Clock, FileText, X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
export type ModuleConfig = {
  key: string;
  label: string;
  color: string;       // Tailwind bg class e.g. "bg-[#0F172A]"
  textAccent: string;  // e.g. "text-[#0F172A]"
  borderAccent: string;
  icon: React.ElementType;
  desc: string;
  steps: string[];
  formFields: FieldDef[];
  extraSections?: React.ReactNode;
};

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: string[];
  half?: boolean;
};

// ── Progress tracker ─────────────────────────────────────────────────────────
const STAGES = ["Submitted", "Registry", "Department", "Review", "Decision"];

function ProgressBar({ label }: { label: string }) {
  const idx = 1; // demo: at Registry stage
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-black/50 uppercase tracking-wider">Application Progress</div>
      <div className="flex gap-1.5">
        {STAGES.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className={`h-2 rounded-full mb-1 ${i <= idx ? "bg-[#0f172a]" : "bg-black/10"}`} />
            <div className={`text-[9px] truncate ${i <= idx ? "text-black font-semibold" : "text-black/35"}`}>{s}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-black/50">Currently at: <strong className="text-black">{STAGES[idx]}</strong> — {label}</div>
    </div>
  );
}

// ── Alert / notification item ─────────────────────────────────────────────────
type AlertItem = { icon: string; title: string; body: string; time: string; type: "warning"|"success"|"info"|"error" };
const DEMO_ALERTS: AlertItem[] = [
  { icon: "🔔", title: "Document Required", body: "Please upload your latest ID or registration document within 7 days.", time: "2 hours ago", type: "warning" },
  { icon: "✅", title: "Stage Completed", body: "Your application has moved to the Department Review stage.", time: "Yesterday", type: "success" },
  { icon: "💬", title: "Message from Admin", body: "Thank you for your submission. Your case has been assigned to the relevant office.", time: "2 days ago", type: "info" },
];

// ── Field renderer ────────────────────────────────────────────────────────────
function Field({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  const base = "w-full border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/10 px-3 rounded-none";
  return (
    <div className={def.half ? "" : ""}>
      <label className="text-[10px] font-bold text-black/50 uppercase tracking-wider block mb-1">
        {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {def.type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={def.placeholder}
          rows={3} className={`${base} py-2 resize-none`} />
      ) : def.type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={`${base} h-9 bg-white`}>
          <option value="">Select…</option>
          {def.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={def.type || "text"} value={value} onChange={e => onChange(e.target.value)}
          placeholder={def.placeholder} className={`${base} h-9`} />
      )}
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export default function ApplicationModuleBase({
  config,
  extraRegistrationContent,
}: {
  config: ModuleConfig;
  extraRegistrationContent?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const Icon = config.icon;
  const [tab, setTab] = useState<"register" | "track" | "alerts" | "chat">("register");
  const [currentStep, setCurrentStep] = useState(0); // Changed to 0-indexed
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatLog, setChatLog] = useState<{ from: "user"|"admin"; msg: string; time: string }[]>([
    { from: "admin", msg: "Hello! How can we help you today? Please describe your query.", time: "09:00" },
  ]);

  // Form state — all fields keyed by def.key
  const [formData, setFormData] = useState<Record<string, string>>({});
  const setField = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const refNum = `APP-${config.key.toUpperCase().slice(0, 3)}-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`;

  // Map form fields to steps (0 = base fields, 1+ = module-specific distributed across steps)
  const getFieldsForStep = (stepIndex: number): FieldDef[] => {
    if (stepIndex === 0) {
      // Step 0: Base registration fields
      return [
        { key:"fullName", label:"Full Name", required:true, placeholder:"e.g. John Banda" },
        { key:"idNumber", label:"National ID / Passport No.", required:true, placeholder:"63-123456 A78" },
        { key:"phone", label:"Phone Number", type:"tel", required:true, placeholder:"+263 77 000 0000" },
        { key:"email", label:"Email Address", type:"email", placeholder:"you@example.com" },
        { key:"address", label:"Physical Address", required:true, placeholder:"Full physical address" },
        { key:"province", label:"Province", type:"select", options:["Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands"] },
      ];
    }
    // Distribute module-specific fields across remaining steps
    const perStep = Math.ceil(config.formFields.length / Math.max(1, config.steps.length - 1));
    const start = (stepIndex - 1) * perStep;
    const end = start + perStep;
    return config.formFields.slice(start, end);
  };

  const currentFields = getFieldsForStep(currentStep);
  const isLastStep = currentStep === config.steps.length - 1;
  const canGoNext = currentFields.filter(f => f.required).every(f => formData[f.key]?.trim());

  const handleSubmit = () => {
    const required = config.formFields.filter(f => f.required);
    const missing = required.filter(f => !formData[f.key]?.trim());
    if (missing.length > 0) return;
    setSubmitted(true);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleNext = () => {
    if (isLastStep) { handleSubmit(); } else { setCurrentStep(s => s + 1); }
  };
  const handleBack = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setChatLog(p => [...p, { from: "user", msg: chatMsg, time: now }]);
    const reply = chatMsg;
    setTimeout(() => {
      setChatLog(p => [...p, { from: "admin", msg: `Thank you for your message. Your query regarding "${reply}" has been received and will be reviewed shortly.`, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
    setChatMsg("");
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-standalone bg-[#EAF1F8] flex flex-col h-screen overflow-hidden">
        <div className={`${config.color} text-white px-4 py-3 flex items-center gap-3`}>
          <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="font-bold text-sm flex-1">{config.label}</div>
          <Link to="/applications" className="text-white/70 hover:text-white text-sm">← Back</Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div className="bg-white border border-black/10 w-full max-w-md p-8 text-center">
            <div className="h-16 w-16 bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
            </div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">Application Submitted!</h2>
            <p className="text-sm text-black/60 mb-4">Your application has been submitted successfully and is now in the queue for review.</p>
            <div className="bg-[#EAF1F8] p-3 text-left text-xs mb-4 space-y-1.5">
              <div><span className="text-black/50">Reference: </span><strong className="font-mono">{refNum}</strong></div>
              <div><span className="text-black/50">Module: </span><strong>{config.label}</strong></div>
              <div><span className="text-black/50">Status: </span><span className="text-[#0F172A] font-semibold">Pending Review</span></div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A] text-left mb-5">
              <strong>What happens next?</strong> Your application will be reviewed within 5–10 business days. You will receive notifications at each stage. Track progress from the Track Application tab.
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSubmitted(false); setTab("track"); }}
                className="flex-1 h-10 bg-[#0f172a] text-white text-sm font-semibold hover:bg-black/80">
                Track Application
              </button>
              <button onClick={() => { setSubmitted(false); setCurrentStep(0); setFormData({}); }}
                className="h-10 px-4 border border-black/20 text-sm hover:bg-gray-50">
                New Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TABS = [
    { k: "register" as const, l: "📝 Apply" },
    { k: "track" as const,    l: "🔍 Track" },
    { k: "alerts" as const,   l: "🔔 Alerts" },
    { k: "chat" as const,     l: "💬 Chat Admin" },
  ];

  return (
    <div className="page-standalone bg-[#EAF1F8] flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Top header */}
      <div className={`${config.color} text-white px-4 py-3 flex items-center gap-3 flex-shrink-0`}>
        <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate">{config.label}</div>
          <div className="text-white/70 text-xs truncate">Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System</div>
        </div>
        <button onClick={() => navigate("/applications")} className="text-white/70 hover:text-white text-sm flex-shrink-0 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Tab strip */}
      <div className="bg-white border-b border-black/10 flex overflow-x-auto flex-shrink-0">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
              ${tab === t.k ? "border-[#0f172a] text-black" : "border-transparent text-black/45 hover:text-black"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── APPLY TAB — fixed height, no outer scroll ── */}
      {tab === "register" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stepper */}
          <div className="bg-white border-b border-black/10 px-4 py-2 flex-shrink-0">
            <div className="flex items-center overflow-x-auto max-w-3xl mx-auto">
              {config.steps.map((label, idx) => {
                const state = idx < currentStep ? "completed" : idx === currentStep ? "active" : "upcoming";
                return (
                  <div key={label} className="flex items-center min-w-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${state === "completed" ? "bg-[#0F172A] text-white" : state === "active" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-400 bg-white"}`}>
                        {state === "completed" ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <span className={`text-[9px] mt-0.5 font-semibold uppercase tracking-wide whitespace-nowrap
                        ${state === "completed" ? "text-[#0F172A]" : state === "active" ? "text-gray-900" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                    {idx < config.steps.length - 1 && (
                      <div className={`h-px w-6 mx-1 flex-shrink-0 mb-3 ${idx < currentStep ? "bg-[#0F172A]" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
              {saved && (
                <div className="bg-slate-50 border border-slate-200 p-3 text-sm text-[#0F172A] font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Draft saved — you can continue later.
                </div>
              )}
              {currentStep === 0 && (
                <div className="bg-white border border-black/10 p-4">
                  <h2 className="text-base font-bold text-[#0f172a] mb-1">{config.label}</h2>
                  <p className="text-sm text-black/55">{config.desc}</p>
                </div>
              )}
              <div className="bg-white border border-black/10 p-4">
                <h3 className="text-xs font-bold text-black/40 uppercase tracking-wider border-b border-black/8 pb-2 mb-3">
                  Step {currentStep + 1}: {config.steps[currentStep]}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentFields.map(def => (
                    <div key={def.key} className={def.type === "textarea" ? "sm:col-span-2" : ""}>
                      <Field def={def} value={formData[def.key] || ""} onChange={v => setField(def.key, v)} />
                    </div>
                  ))}
                </div>
              </div>
              {currentStep === 1 && extraRegistrationContent && (
                <div>{extraRegistrationContent}</div>
              )}
              {isLastStep && (
                <div className="bg-white border border-black/10 p-4">
                  <h3 className="text-xs font-bold text-black/40 uppercase tracking-wider border-b border-black/8 pb-2 mb-3">Supporting Documents</h3>
                  <div className="border-2 border-dashed border-black/15 p-5 text-center bg-[#fafafa]">
                    <FileText className="h-8 w-8 text-black/20 mx-auto mb-2" />
                    <p className="text-sm text-black/50 mb-1">Drag &amp; drop files here or click to browse</p>
                    <p className="text-xs text-black/35">PDF, DOCX, JPG — max 10 MB per file</p>
                    <button className="mt-3 h-8 px-4 border border-black/20 text-xs text-black/60 hover:bg-gray-50 transition-colors flex items-center gap-1.5 mx-auto">
                      <Upload className="h-3.5 w-3.5" /> Browse Files
                    </button>
                  </div>
                  <div className="mt-3 flex items-start gap-2 text-xs text-[#0F172A] bg-slate-50 border border-slate-200 p-3">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    Incomplete submissions will be flagged and returned. Ensure all required fields are completed before submitting.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed footer: Back | Save & Continue Later | Next/Submit */}
          <div className="bg-white border-t border-black/10 px-4 py-3 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="h-10 px-5 border border-black/20 text-sm font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleSave}
                className="h-10 px-5 border border-slate-200 text-[#0F172A] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Save &amp; Continue Later
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`h-10 px-6 text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                  ${isLastStep ? "bg-[#0F172A] hover:bg-[#0F172A]" : "bg-[#0f172a] hover:bg-black/80"}`}
              >
                {isLastStep ? "Submit Application" : "Next →"}
              </button>
            </div>
            <div className="max-w-3xl mx-auto mt-1.5 text-center text-[10px] text-black/35">
              Step {currentStep + 1} of {config.steps.length}
            </div>
          </div>
        </div>
      )}

      {/* ── OTHER TABS — scrollable ── */}
      {tab !== "register" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

          {/* ── TRACK TAB ── */}
          {tab === "track" && (
            <div className="space-y-4">
              <div className="bg-white border border-black/10 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <input placeholder="Enter reference number e.g. APP-GOV-2026-00184…"
                    className="flex-1 h-10 px-3 border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 rounded-none" />
                  <button className="h-10 px-5 bg-[#0f172a] text-white text-sm font-semibold">Search</button>
                </div>
                <ProgressBar label="Awaiting departmental review" />
              </div>
              {[
                { ref:"APP-GOV-2026-00184", subject:"Business Licence Application", status:"In Review", stage:"Ministry Registry", days:3, priority:"Normal" },
                { ref:"APP-EMP-2026-00183", subject:"Transfer Request — Bulawayo Office", status:"Approved", stage:"HR Director", days:1, priority:"High" },
                { ref:"APP-ARC-2026-00182", subject:"Annual Returns Filing 2026", status:"Pending Docs", stage:"ZIMRA", days:7, priority:"Normal" },
              ].map(c => (
                <div key={c.ref} className="bg-white border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-black/40">{c.ref}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${c.status==="Approved"?"bg-slate-100 text-[#0F172A]":c.status==="Pending Docs"?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>{c.status}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${c.priority==="High"?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>{c.priority}</span>
                      </div>
                      <div className="text-sm font-semibold text-black">{c.subject}</div>
                      <div className="text-xs text-black/50 mt-1">Currently with: <strong>{c.stage}</strong> · {c.days} day(s) at this stage</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={()=>setTab("chat")} className="h-8 px-3 bg-[#0f172a] text-white text-xs font-medium">Chat Admin</button>
                      <button className="h-8 px-3 border border-black/15 text-xs">View</button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {["Submitted","Registry","Department","Director","Final"].map((s,i)=>(
                      <div key={s} className="flex-1 text-center">
                        <div className={`h-1.5 mb-1 ${i<=1?"bg-[#0f172a]":"bg-black/10"}`} />
                        <div className="text-[9px] text-black/40 truncate">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ALERTS TAB ── */}
          {tab === "alerts" && (
            <div className="space-y-3">
              {DEMO_ALERTS.map((n,i) => (
                <div key={i} className={`border p-4 flex gap-3 ${n.type==="warning"?"bg-slate-50 border-slate-200":n.type==="success"?"bg-slate-50 border-slate-200":n.type==="error"?"bg-red-50 border-red-200":"bg-slate-50 border-slate-200"}`}>
                  <span className="text-xl flex-shrink-0">{n.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-black">{n.title}</div>
                    <div className="text-xs text-black/60 mt-0.5">{n.body}</div>
                    <div className="text-[10px] text-black/35 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{n.time}</div>
                  </div>
                  <button className="h-8 px-3 bg-[#0f172a] text-white text-xs self-start flex-shrink-0">Reply</button>
                </div>
              ))}
              <div className="bg-white border border-black/10 p-4 text-center">
                <Bell className="h-8 w-8 text-black/15 mx-auto mb-2" />
                <p className="text-sm text-black/40">You will receive alerts here at every stage of your application.</p>
              </div>
            </div>
          )}

          {/* ── CHAT TAB ── */}
          {tab === "chat" && (
            <div className="bg-white border border-black/10 flex flex-col" style={{height:"520px"}}>
              <div className="px-4 py-3 border-b border-black/8 bg-[#0f172a] text-white flex items-center gap-2 flex-shrink-0">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-semibold">Chat with Admin — {config.label}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />Online</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLog.map((m,i) => (
                  <div key={i} className={`flex ${m.from==="user"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 text-sm ${m.from==="user"?"bg-[#0f172a] text-white":"bg-[#EAF1F8] text-black border border-black/8"}`}>
                      <p>{m.msg}</p>
                      <p className={`text-[10px] mt-1 ${m.from==="user"?"text-white/50":"text-black/35"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-black/8 p-3 flex gap-2 flex-shrink-0">
                <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                  placeholder="Type your message…"
                  className="flex-1 h-10 px-3 border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 rounded-none" />
                <button onClick={sendChat} disabled={!chatMsg.trim()}
                  className="h-10 px-5 bg-[#0f172a] text-white text-sm font-semibold disabled:opacity-40">Send</button>
              </div>
            </div>
          )}

          </div>
        </div>
      )}
    </div>
  );
}
