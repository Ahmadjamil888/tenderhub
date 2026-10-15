import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, Badge , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { pushNotification } from "@/lib/local-store";
import {
  ArrowLeft, ChevronRight, FileText, Shield, Globe, Info,
  Users, Unlock, Eye, Award, CheckCircle2, Upload, Plus,
  Download, Send, AlertTriangle, Clock, Edit2, Save, X,
} from "lucide-react";

const STAGE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  fields: { label: string; key: string; type: "text" | "textarea" | "date" | "select" | "file"; options?: string[] }[];
  actions: { label: string; color: string; action: "save" | "submit" | "approve" | "reject" | "publish" | "notify" }[];
  checklist: string[];
}> = {
  preparation: {
    label: "Preparation", icon: FileText, description: "Draft tender specifications, scope of work, evaluation criteria and bidding documents.", color: "blue",
    fields: [
      { label: "Tender Title", key: "title", type: "text" },
      { label: "Category", key: "category", type: "select", options: ["Infrastructure", "Health", "ICT", "Agriculture", "Education", "Energy"] },
      { label: "Estimated Value (USD)", key: "value", type: "text" },
      { label: "Scope of Work", key: "scope", type: "textarea" },
      { label: "Technical Specifications", key: "specs", type: "textarea" },
      { label: "Evaluation Criteria", key: "evalCriteria", type: "textarea" },
      { label: "Draft Document", key: "document", type: "file" },
    ],
    actions: [{ label: "Save Draft", color: "secondary", action: "save" }, { label: "Submit for Approval", color: "primary", action: "submit" }],
    checklist: ["Specifications drafted", "BOQ prepared", "Evaluation criteria set", "Approval authority identified", "Legal review done"],
  },
  approval: {
    label: "Approval", icon: Shield, description: "Review and approve tender before publication. Authority checks are mandatory.", color: "amber",
    fields: [
      { label: "Review Comments", key: "comments", type: "textarea" },
      { label: "Approval Authority", key: "authority", type: "select", options: ["CPO", "Director General", "Minister", "Board"] },
      { label: "Approval Date", key: "approvalDate", type: "date" },
      { label: "Approval Notes", key: "notes", type: "textarea" },
    ],
    actions: [{ label: "Approve", color: "emerald", action: "approve" }, { label: "Request Revisions", color: "amber", action: "reject" }],
    checklist: ["Budget confirmation received", "Legal clearance obtained", "Specifications reviewed", "Approval authority signed off", "Anti-corruption check done"],
  },
  publication: {
    label: "Publication", icon: Globe, description: "Publish the approved tender to the portal, government gazette and supplier notifications.", color: "violet",
    fields: [
      { label: "Publication Date", key: "pubDate", type: "date" },
      { label: "Tender Gazette Reference", key: "gazetteRef", type: "text" },
      { label: "Portal Publication Date", key: "portalDate", type: "date" },
      { label: "Newspaper Name(s)", key: "newspaper", type: "text" },
      { label: "Publication Notes", key: "pubNotes", type: "textarea" },
    ],
    actions: [{ label: "Publish Now", color: "primary", action: "publish" }, { label: "Notify Suppliers", color: "secondary", action: "notify" }],
    checklist: ["Portal listing live", "Gazette submitted", "Supplier notifications sent", "Pre-bid meeting scheduled", "Documents uploaded"],
  },
  clarifications: {
    label: "Clarifications", icon: Info, description: "Manage pre-bid meeting, questions from bidders, and official addenda.", color: "indigo",
    fields: [
      { label: "Pre-Bid Meeting Date", key: "prebidDate", type: "date" },
      { label: "Pre-Bid Meeting Location", key: "prebidLoc", type: "text" },
      { label: "Question Received (summarise)", key: "question", type: "textarea" },
      { label: "Official Answer / Addendum", key: "answer", type: "textarea" },
      { label: "Addendum Number", key: "addendumNo", type: "text" },
    ],
    actions: [{ label: "Post Official Addendum", color: "primary", action: "publish" }, { label: "Notify All Bidders", color: "secondary", action: "notify" }],
    checklist: ["Pre-bid meeting held", "Minutes circulated", "All questions answered", "Addenda issued", "Closing date confirmed"],
  },
  bidding: {
    label: "Bidding", icon: Users, description: "Monitor bid submissions, track registered bidders, and manage the submission portal.", color: "green",
    fields: [
      { label: "Bid Submission Deadline", key: "deadline", type: "date" },
      { label: "Relaxation Time (minutes)", key: "relaxation", type: "text" },
      { label: "Bidder Company Name (manual)", key: "bidderName", type: "text" },
      { label: "Bidder Registration No.", key: "bidderReg", type: "text" },
      { label: "Bid Submission Notes", key: "notes", type: "textarea" },
    ],
    actions: [{ label: "Register Bidder", color: "primary", action: "save" }, { label: "Close Bidding", color: "amber", action: "submit" }],
    checklist: ["Submission portal open", "EMD/bid bonds tracked", "Bidder queries resolved", "Deadline reminder sent", "Bid box sealed"],
  },
  opening: {
    label: "Bid Opening", icon: Unlock, description: "Official public opening of submitted bids in presence of evaluation committee.", color: "purple",
    fields: [
      { label: "Opening Date & Time", key: "openingDate", type: "date" },
      { label: "Opening Venue", key: "venue", type: "text" },
      { label: "Committee Members Present", key: "committee", type: "textarea" },
      { label: "Bids Opened (list)", key: "bidsOpened", type: "textarea" },
      { label: "Opening Minutes Reference", key: "minutesRef", type: "text" },
    ],
    actions: [{ label: "Record Opening Minutes", color: "primary", action: "save" }, { label: "Advance to Evaluation", color: "emerald", action: "submit" }],
    checklist: ["Opening committee assembled", "All bids accounted for", "Bid prices read publicly", "Minutes signed", "Bid opening report filed"],
  },
  evaluation: {
    label: "Evaluation", icon: Eye, description: "Technical and financial evaluation of bids against pre-set criteria.", color: "orange",
    fields: [
      { label: "Evaluation Committee Ref", key: "evalRef", type: "text" },
      { label: "Technical Score (lead bidder)", key: "techScore", type: "text" },
      { label: "Financial Score (lead bidder)", key: "finScore", type: "text" },
      { label: "Recommended Bidder", key: "recommended", type: "text" },
      { label: "Evaluation Report Summary", key: "evalSummary", type: "textarea" },
      { label: "Adjudication Notes", key: "adjNotes", type: "textarea" },
    ],
    actions: [{ label: "Save Scores", color: "secondary", action: "save" }, { label: "Submit for Award Recommendation", color: "primary", action: "submit" }],
    checklist: ["COI declarations signed", "Technical evaluation complete", "Financial evaluation complete", "Reference checks done", "Evaluation report signed", "Adjudication committee reviewed"],
  },
  award: {
    label: "Award", icon: Award, description: "Issue formal contract award, notify all bidders, and initiate contract execution.", color: "teal",
    fields: [
      { label: "Awarded Bidder Name", key: "awardedTo", type: "text" },
      { label: "Contract Value (USD)", key: "contractValue", type: "text" },
      { label: "Award Date", key: "awardDate", type: "date" },
      { label: "Contract Start Date", key: "contractStart", type: "date" },
      { label: "Contract End Date", key: "contractEnd", type: "date" },
      { label: "Award Notice Reference", key: "awardRef", type: "text" },
      { label: "Award Notes", key: "awardNotes", type: "textarea" },
    ],
    actions: [{ label: "Issue Award Notice", color: "emerald", action: "publish" }, { label: "Notify All Bidders", color: "secondary", action: "notify" }],
    checklist: ["Award authority signed", "Unsuccessful bidder notifications sent", "Appeal period confirmed", "Letter of Award issued", "Contract execution initiated"],
  },
};

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-slate-100 text-[#0F172A] border-slate-200",
  amber:  "bg-slate-100 text-[#0F172A] border-slate-200",
  violet: "bg-slate-100 text-[#0F172A] border-slate-200",
  indigo: "bg-slate-100 text-[#0F172A] border-slate-200",
  green:  "bg-slate-100 text-[#0F172A] border-slate-200",
  purple: "bg-slate-100 text-[#0F172A] border-slate-200",
  orange: "bg-slate-100 text-[#0F172A] border-slate-200",
  teal:   "bg-slate-100 text-slate-500 border-slate-200",
};

const BTN_MAP: Record<string, string> = {
  primary:   "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border hover:bg-secondary text-foreground",
  emerald:   "bg-[#0F172A] text-white hover:bg-[#0F172A]",
  amber:     "bg-[#0F172A] text-white hover:bg-[#0F172A]",
};

export default function TenderStagePage() {
  const { id = "", stage = "" } = useParams<{ id: string; stage: string }>();
  const navigate = useNavigate();
  const config = STAGE_CONFIG[stage] ?? STAGE_CONFIG["preparation"];
  const Icon = config.icon;
  const colorCls = COLOR_MAP[config.color] ?? COLOR_MAP.blue;

  const [form, setForm] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const toggleCheck = (item: string) => setChecklist(p => ({ ...p, [item]: !p[item] }));

  const handleAction = (action: string) => {
    switch (action) {
      case "save":
        setSaved(true);
        toast(`Stage data saved: ${config.label}`, "success");
        pushNotification(`Tender ${id} — ${config.label} stage saved`, "info");
        setTimeout(() => setSaved(false), 2000);
        break;
      case "submit":
        toast(`${config.label} submitted for next stage`, "success");
        pushNotification(`Tender ${id} advanced from ${config.label}`, "success");
        navigate(`/tenders/${id}`);
        break;
      case "approve":
        toast(`${config.label} approved`, "success");
        pushNotification(`Tender ${id} — Approval granted`, "success");
        navigate(`/tenders/${id}`);
        break;
      case "reject":
        toast(`Revisions requested for tender ${id}`, "warning");
        navigate(`/tenders/${id}`);
        break;
      case "publish":
        toast(`Tender ${id} published successfully`, "success");
        pushNotification(`Tender ${id} published to portal`, "success");
        navigate(`/tenders/${id}`);
        break;
      case "notify":
        toast(`Supplier notifications sent for tender ${id}`, "success");
        break;
    }
  };

  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Tender Stage Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1000px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <button onClick={() => navigate("/tenders")} className="hover:text-foreground flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Tenders
          </button>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <button onClick={() => navigate(`/tenders/${id}`)} className="hover:text-foreground font-mono">{id}</button>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="text-foreground font-semibold">{config.label}</span>
        </nav>

        {/* Stage Header */}
        <div className={`flex items-start gap-4 p-5 rounded-2xl border mb-6 ${colorCls}`}>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{config.label} Stage</h1>
            <p className="text-sm opacity-80 mt-0.5">{config.description}</p>
            <p className="text-xs opacity-60 mt-1 font-mono">Tender: {id}</p>
          </div>
          {saved && (
            <div className="flex items-center gap-1.5 bg-white/70 rounded-lg px-3 py-1.5 text-xs font-medium text-[#0F172A]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader title={`${config.label} — Input Form`} subtitle="Complete all required fields" />
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.fields.map(field => (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea className={`${inp} resize-none`} rows={3} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)} />
                    ) : field.type === "select" ? (
                      <select className={inp} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)}>
                        <option value="">— Select —</option>
                        {field.options?.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : field.type === "file" ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/40 transition-colors">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Click or drag file to upload</p>
                        <input type="file" className="hidden" onChange={() => toast("File selected (demo)", "info")} />
                      </div>
                    ) : field.type === "date" ? (
                      <input type="datetime-local" className={inp} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)} />
                    ) : (
                      <input type="text" className={inp} value={form[field.key] ?? ""} onChange={e => set(field.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
                <button onClick={() => navigate(`/tenders/${id}`)} className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-secondary flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                {config.actions.map(action => (
                  <button key={action.label} onClick={() => handleAction(action.action)}
                    className={`h-9 px-5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${BTN_MAP[action.color] ?? BTN_MAP.secondary}`}>
                    {action.action === "save" ? <Save className="h-3.5 w-3.5" /> :
                     action.action === "approve" ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     action.action === "publish" ? <Globe className="h-3.5 w-3.5" /> :
                     action.action === "notify" ? <Send className="h-3.5 w-3.5" /> :
                     <ChevronRight className="h-3.5 w-3.5" />}
                    {action.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Checklist */}
          <div>
            <Card>
              <CardHeader title="Stage Checklist" subtitle="Required items" />
              <div className="p-4 space-y-2">
                {config.checklist.map(item => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-secondary/40">
                    <div
                      onClick={() => toggleCheck(item)}
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${checklist[item] ? "bg-[#0F172A] border-slate-200" : "border-border group-hover:border-primary/40"}`}>
                      {checklist[item] && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${checklist[item] ? "line-through text-muted-foreground" : "text-foreground"}`}>{item}</span>
                  </label>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Object.values(checklist).filter(Boolean).length} / {config.checklist.length} completed</span>
                  <span className="font-semibold text-foreground">
                    {Math.round(Object.values(checklist).filter(Boolean).length / config.checklist.length * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0F172A] transition-all"
                    style={{ width: `${Math.round(Object.values(checklist).filter(Boolean).length / config.checklist.length * 100)}%` }} />
                </div>
              </div>
            </Card>

            <Card className="mt-4">
              <CardHeader title="Stage Navigation" subtitle="Jump to any stage" />
              <div className="p-3 space-y-1">
                {Object.entries(STAGE_CONFIG).map(([key, s]) => {
                  const SIcon = s.icon;
                  const isActive = key === stage;
                  return (
                    <button key={key} onClick={() => navigate(`/tenders/${id}/stage/${key}`)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground/70 hover:text-foreground"}`}>
                      <SIcon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
