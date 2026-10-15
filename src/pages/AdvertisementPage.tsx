import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Plus, Search, Sparkles, FileText, Upload, Download, Send, Eye, X,
  CheckCircle2, Clock, Building2, Bell, MessageSquare, Users, Globe,
  Newspaper, Radio, AlertTriangle, ChevronRight, RefreshCcw, Check, Filter,
} from "lucide-react";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import LifecycleTower from "@/components/LifecycleTower";
import { ADVERTISEMENT_STAGES } from "@/lib/lifecycle-stages";
import {
  type Advertisement, type ClarificationRequest, type SupplierEngagement,
  type PublicationChannel, SEED_ADVERTISEMENTS, ADVERTISEMENT_WORKFLOW_STAGES,
} from "@/lib/procurement-workbench-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  "Advertisement Active": "green",
  Published: "green",
  Closed: "muted",
  Draft: "muted",
  "Internal Review": "amber",
  Approval: "blue",
};

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  "Procurement Portal": <Globe className="h-3.5 w-3.5 text-[#0F172A]" />,
  Newspaper: <Newspaper className="h-3.5 w-3.5 text-[#0F172A]" />,
  "Government Gazette": <FileText className="h-3.5 w-3.5 text-[#0F172A]" />,
  Website: <Globe className="h-3.5 w-3.5 text-[#0F172A]" />,
  Radio: <Radio className="h-3.5 w-3.5 text-rose-600" />,
  "Notice Board": <FileText className="h-3.5 w-3.5 text-[#0F172A]" />,
};

function WorkflowBadges({ status }: { status: string }) {
  const stages = ADVERTISEMENT_WORKFLOW_STAGES;
  const idx = stages.indexOf(status as typeof stages[number]);
  return (
    <div className="flex gap-0.5 flex-wrap">
      {stages.map((s, i) => (
        <div key={s} className={`flex-1 h-1.5 rounded-full min-w-[16px] ${i <= idx ? "bg-black" : "bg-black/10"}`} />
      ))}
    </div>
  );
}

// ─── Advertisement Detail Panel ───────────────────────────────────────────────
type AdvTab = "Overview" | "Publication" | "Clarifications" | "Suppliers" | "Documents";

function AdvertisementDetailPanel({ adv, onClose, onAction }: {
  adv: Advertisement;
  onClose: () => void;
  onAction: (id: string, action: string, data?: unknown) => void;
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdvTab>("Overview");
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleReply = (cqId: string) => {
    const text = replyText[cqId];
    if (!text?.trim()) return;
    onAction(adv.id, "reply", { cqId, response: text });
    setReplyText(prev => ({ ...prev, [cqId]: "" }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-black/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={STATUS_TONE[adv.status] ?? "muted"}>{adv.status}</Badge>
              <span className="text-[10px] text-black/40 font-mono">{adv.advertisementNumber}</span>
            </div>
            <div className="text-sm font-bold">{adv.tenderTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{adv.ministry} · {adv.department}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex gap-1 px-6 border-b border-black/8 overflow-x-auto scrollbar-none flex-shrink-0">
          {(["Overview","Publication","Clarifications","Suppliers","Documents"] as AdvTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors relative
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t}
              {t === "Clarifications" && adv.clarificationRequests.filter(c => c.status === "Pending").length > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                  {adv.clarificationRequests.filter(c => c.status === "Pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Tender No.", value: adv.tenderNumber },
                  { label: "Publication Date", value: adv.publicationDate },
                  { label: "Closing Date", value: adv.closingDate },
                  { label: "Document Fee", value: adv.documentFee },
                  { label: "Pre-Bid Meeting", value: adv.preBidMeetingDate?.split("T")[0] || "N/A" },
                  { label: "Suppliers Engaged", value: String(adv.supplierEngagements.length) },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-[#F9F9F9] rounded-xl">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide">{f.label}</div>
                    <div className="text-xs font-semibold mt-0.5">{f.value || "—"}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-semibold mb-1.5">Workflow Progress</div>
                <WorkflowBadges status={adv.status} />
                <div className="text-[10px] text-black/40 mt-1 text-right">{adv.status} · {adv.workflowProgress}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1">Pre-Bid Meeting</div>
                <p className="text-xs text-black/60">{adv.preBidMeetingLocation || "Not set"} — {adv.preBidMeetingDate?.replace("T", " ") || "TBD"}</p>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1">Contact Information</div>
                <p className="text-xs text-black/60">{adv.contactEmail} · {adv.contactPhone}</p>
              </div>
              {adv.additionalNotes && (
                <div>
                  <div className="text-xs font-semibold mb-1">Additional Notes</div>
                  <p className="text-xs text-black/60 leading-relaxed">{adv.additionalNotes}</p>
                </div>
              )}
            </div>
          )}

          {tab === "Publication" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Publication Channels ({adv.publicationChannels.length})</div>
                <button className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add Channel
                </button>
              </div>
              <div className="space-y-3">
                {adv.publicationChannels.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-xl border border-black/8">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-black/8 flex items-center justify-center">
                        {CHANNEL_ICON[ch.channel]}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{ch.channel}</div>
                        <div className="text-[10px] text-black/40 mt-0.5">Ref: {ch.reference}</div>
                        <div className="text-[10px] text-black/40">Published: {ch.publicationDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-medium">{ch.cost}</div>
                        <div className="text-[10px] text-black/40">Cost</div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${ch.status === "Published" ? "bg-slate-50 text-[#0F172A]" : ch.status === "Confirmed" ? "bg-slate-50 text-[#0F172A]" : "bg-slate-50 text-[#0F172A]"}`}>
                        {ch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-[#0F172A] mb-2">Publication History</div>
                <div className="space-y-1">
                  {adv.publicationChannels.filter(c => c.status === "Published").map(c => (
                    <div key={c.id} className="text-[11px] text-[#0F172A]">• {c.channel} — published {c.publicationDate}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Clarifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Clarification Requests ({adv.clarificationRequests.length})</div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${adv.clarificationRequests.filter(c => c.status === "Pending").length > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-[#0F172A]"}`}>
                  {adv.clarificationRequests.filter(c => c.status === "Pending").length} pending
                </span>
              </div>
              {adv.clarificationRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-black/30">No clarification requests yet.</div>
              ) : (
                <div className="space-y-4">
                  {adv.clarificationRequests.map(cq => (
                    <div key={cq.id} className={`p-4 rounded-xl border ${cq.status === "Pending" ? "border-slate-200 bg-slate-50" : "border-black/8 bg-[#F9F9F9]"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-xs font-semibold">{cq.supplierName}</div>
                          <div className="text-[10px] text-black/40">{cq.supplierEmail} · {cq.submittedAt}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${cq.status === "Answered" ? "bg-slate-50 text-[#0F172A]" : cq.status === "Pending" ? "bg-slate-50 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>
                          {cq.status}
                        </span>
                      </div>
                      <div className="text-xs text-black/70 mb-3 p-2 bg-white rounded-lg border border-black/5">{cq.question}</div>
                      {cq.status === "Answered" ? (
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-[10px] text-[#0F172A] font-medium mb-1">Response — {cq.respondedAt}</div>
                          <div className="text-xs text-[#0F172A]">{cq.response}</div>
                          {cq.isPublic && <div className="text-[10px] text-slate-600 mt-1">✓ Published as addendum</div>}
                        </div>
                      ) : (
                        <div>
                          <textarea value={replyText[cq.id] ?? ""} onChange={e => setReplyText(p => ({ ...p, [cq.id]: e.target.value }))}
                            rows={2} placeholder="Type your response…"
                            className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none resize-none mb-2" />
                          <div className="flex gap-2">
                            <button onClick={() => handleReply(cq.id)} className="h-7 px-3 bg-black text-white rounded-lg text-xs hover:bg-gray-800 flex items-center gap-1">
                              <Send className="h-3 w-3" /> Respond
                            </button>
                            <button className="h-7 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8]">Dismiss</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Suppliers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Supplier Engagement ({adv.supplierEngagements.length})</div>
                <button onClick={() => onAction(adv.id, "notify")} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Send Notifications
                </button>
              </div>
              <div className="space-y-3">
                {adv.supplierEngagements.map(se => (
                  <div key={se.id} className="p-4 bg-[#F9F9F9] rounded-xl border border-black/8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs font-semibold">{se.supplierName}</div>
                        <div className="text-[10px] text-black/40">{se.supplierEmail} · {se.supplierPhone}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${se.registrationStatus === "Verified" ? "bg-slate-50 text-[#0F172A]" : se.registrationStatus === "Pending" ? "bg-slate-50 text-[#0F172A]" : "bg-red-50 text-red-700"}`}>
                        {se.registrationStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div><span className="text-black/40">Documents:</span> <span className={`font-medium ${se.documentsDownloaded ? "text-[#0F172A]" : "text-red-500"}`}>{se.documentsDownloaded ? "Downloaded" : "Not downloaded"}</span></div>
                      <div><span className="text-black/40">Notified:</span> <span className={`font-medium ${se.notificationSent ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{se.notificationSent ? "Yes" : "No"}</span></div>
                      <div><span className="text-black/40">Last activity:</span> <span className="font-medium">{se.lastActivity}</span></div>
                    </div>
                    {se.activityLog.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {se.activityLog.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-black/40">
                            <span className="h-1 w-1 rounded-full bg-black/20 flex-shrink-0" />
                            {a.action} — {a.timestamp}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Advertisement Documents ({adv.attachments.length})</div>
                <button className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                  <Upload className="h-3 w-3" /> Upload
                </button>
              </div>
              {adv.attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-xl border border-black/8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-[#0F172A]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{att.name}</div>
                      <div className="text-[10px] text-black/40">{att.category} · {att.size} · {att.uploadedAt}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Eye className="h-3.5 w-3.5 text-black/50" /></button>
                    <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Download className="h-3.5 w-3.5 text-black/50" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={() => { onAction(adv.id, "publish"); onClose(); }}
              className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
              <Send className="h-3 w-3" /> Publish
            </button>
            <button onClick={() => onAction(adv.id, "close")}
              className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
              <X className="h-3 w-3" /> Close Advertisement
            </button>
          </div>
          <button onClick={() => onAction(adv.id, "download")}
            className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type PageTab = "Advertisements" | "Supplier Engagement" | "Lifecycle Tower" | "Capabilities";

export default function AdvertisementPage() {
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(SEED_ADVERTISEMENTS);
  const [tab, setTab] = useState<PageTab>("Advertisements");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<Advertisement | null>(null);

  const filtered = advertisements.filter(a => {
    const matchSearch = a.tenderTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.advertisementNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const allEngagements = advertisements.flatMap(a => a.supplierEngagements);
  const allClarifications = advertisements.flatMap(a => a.clarificationRequests);
  const pendingClarifications = allClarifications.filter(c => c.status === "Pending");

  const handleAction = (id: string, action: string, data?: unknown) => {
    const adv = advertisements.find(a => a.id === id);
    if (!adv) return;
    if (action === "publish") {
      setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: "Published" as const, workflowProgress: 75 } : a));
      pushSeniorAlert(`Advertisement published: ${adv.tenderTitle}`, "success", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
      pushNotification(`Advertisement ${adv.advertisementNumber} published`, "success");
      toast(`${adv.tenderTitle} published to all channels.`, "success");
    } else if (action === "close") {
      setAdvertisements(prev => prev.map(a => a.id === id ? { ...a, status: "Closed" as const, workflowProgress: 100 } : a));
      pushNotification(`Advertisement ${adv.advertisementNumber} closed`, "info");
      toast(`Advertisement closed. Bid submission period has ended.`, "info");
    } else if (action === "notify") {
      pushNotification(`Supplier notifications sent for ${adv.advertisementNumber}`, "success");
      toast(`Notifications sent to ${adv.supplierEngagements.length} registered suppliers.`, "success");
    } else if (action === "reply" && data && typeof data === "object") {
      const { cqId, response } = data as { cqId: string; response: string };
      setAdvertisements(prev => prev.map(a => a.id === id ? {
        ...a,
        clarificationRequests: a.clarificationRequests.map(cq => cq.id === cqId ? {
          ...cq, response, respondedAt: new Date().toLocaleString(),
          respondedBy: user?.name ?? "Officer", status: "Answered" as const, isPublic: true,
        } : cq),
      } : a));
      pushNotification(`Clarification response sent for ${adv.advertisementNumber}`, "success");
      toast("Clarification response sent and published as addendum.", "success");
    } else if (action === "download") {
      const content = [`ADVERTISEMENT NOTICE\n`, `Ref: ${adv.advertisementNumber}`, `Tender: ${adv.tenderTitle}`, `Tender No: ${adv.tenderNumber}`, `Ministry: ${adv.ministry}`, `Publication Date: ${adv.publicationDate}`, `Closing Date: ${adv.closingDate}`, `Status: ${adv.status}`, `Channels: ${adv.publicationChannels.map(c => c.channel).join(", ")}`, `Contact: ${adv.contactEmail}`, `\nGenerated: ${new Date().toLocaleString()}`].join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${adv.advertisementNumber}.txt`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Advertisement & Publishing"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Stage 5 — Advertisement</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Advertisement Workbench"
          description="Manage tender advertisements across all publication channels. Track supplier engagement, handle clarification requests, and monitor the advertisement lifecycle."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Advertisements" value={String(advertisements.filter(a => a.status === "Advertisement Active" || a.status === "Published").length)} delta="Currently live" />
          <KpiCard label="Suppliers Engaged" value={String(allEngagements.length)} delta={`${allEngagements.filter(s => s.documentsDownloaded).length} downloaded docs`} />
          <KpiCard label="Clarifications Pending" value={String(pendingClarifications.length)} delta={pendingClarifications.length > 0 ? "Requires response" : "All answered"} positive={pendingClarifications.length === 0} />
          <KpiCard label="Publication Channels" value={String(advertisements.reduce((s, a) => s + a.publicationChannels.length, 0))} delta="Across all ads" />
        </div>

        <div className="flex gap-1 mb-5 border-b border-black/8 overflow-x-auto scrollbar-none">
          {(["Advertisements", "Supplier Engagement", "Lifecycle Tower", "Capabilities"] as PageTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors relative
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t}
              {t === "Supplier Engagement" && pendingClarifications.length > 0 && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{pendingClarifications.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Advertisement Lifecycle — 6 Stages"
            subtitle="From advertisement drafting through multi-channel publication, pre-bid meeting, clarifications, and portal closure. Click any stage for full toolset."
            stages={ADVERTISEMENT_STAGES}
            context="Advertisement"
            badgeLabel="6 Stages · Stage 5 of Procurement Lifecycle"
          />
        )}

        {tab === "Capabilities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Multi-Channel Publication", desc: "Publish to Procurement Portal, newspapers, Government Gazette, ministry website, radio, and notice boards simultaneously." },
              { title: "Advertisement Workflow", desc: "Full workflow: Draft → Internal Review → Approval → Published → Active → Closed with real-time status tracking." },
              { title: "Clarification Management", desc: "Receive, manage and respond to supplier clarification requests. Publish responses as official addenda to all registered bidders." },
              { title: "Supplier Registration Verification", desc: "Verify supplier registration status before allowing document download. Track all supplier interactions and document distributions." },
              { title: "Publication History", desc: "Complete record of all publication channels with dates, references, costs, and confirmation status." },
              { title: "Vendor Activity Log", desc: "Detailed log of all supplier interactions: document downloads, clarification requests, pre-bid meeting attendance." },
              { title: "Automatic Notifications", desc: "System notifications for tender publication, clarification responses, addenda, pre-bid meetings, and deadline reminders." },
              { title: "Supplier Communication", desc: "Broadcast messages, individual supplier correspondence, addendum distribution to all registered bidders." },
              { title: "Compliance Verification", desc: "Automatic verification of advertisement requirements: minimum publication periods, mandatory channels, regulatory compliance." },
            ].map(c => (
              <div key={c.title} className="p-4 rounded-2xl border border-black/8 bg-white hover:border-black/20 transition-colors">
                <div className="text-xs font-bold mb-1.5">{c.title}</div>
                <div className="text-xs text-black/50 leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "Supplier Engagement" && (
          <div className="space-y-6">
            {pendingClarifications.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-[#0F172A]" />
                  <div className="text-xs font-bold text-[#0F172A]">{pendingClarifications.length} Pending Clarification Request{pendingClarifications.length > 1 ? "s" : ""}</div>
                </div>
                <div className="space-y-2">
                  {pendingClarifications.map(cq => (
                    <div key={cq.id} className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-xs font-semibold">{cq.supplierName}</div>
                      <div className="text-xs text-black/60 mt-0.5">{cq.question}</div>
                      <div className="text-[10px] text-black/40 mt-1">{cq.submittedAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold mb-3">All Registered Suppliers ({allEngagements.length})</div>
              <div className="overflow-x-auto rounded-2xl border border-black/8">
                <table className="w-full text-xs">
                  <thead className="bg-[#EAF1F8]">
                    <tr>{["Supplier","Tender","Status","Documents","Notified","Last Activity"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-black/60">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {allEngagements.map(se => (
                      <tr key={se.id} className="hover:bg-[#F9F9F9]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{se.supplierName}</div>
                          <div className="text-[10px] text-black/40">{se.supplierEmail}</div>
                        </td>
                        <td className="px-4 py-2.5 text-black/60">
                          {advertisements.find(a => a.supplierEngagements.some(s => s.id === se.id))?.tenderNumber ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${se.registrationStatus === "Verified" ? "bg-slate-50 text-[#0F172A]" : "bg-slate-50 text-[#0F172A]"}`}>{se.registrationStatus}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={se.documentsDownloaded ? "text-[#0F172A]" : "text-red-500"}>{se.documentsDownloaded ? "✓ Downloaded" : "Not downloaded"}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={se.notificationSent ? "text-[#0F172A]" : "text-[#0F172A]"}>{se.notificationSent ? "✓ Sent" : "Pending"}</span>
                        </td>
                        <td className="px-4 py-2.5 text-black/40">{se.lastActivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "Advertisements" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search advertisements…"
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-black/10 text-xs focus:outline-none">
                <option>All</option>
                {ADVERTISEMENT_WORKFLOW_STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-xs text-black/30">No advertisements match your search.</div>
            )}
            {filtered.map(adv => (
              <Card key={adv.id}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge tone={STATUS_TONE[adv.status] ?? "muted"}>{adv.status}</Badge>
                        <span className="text-[10px] font-mono text-black/40">{adv.advertisementNumber}</span>
                      </div>
                      <div className="text-sm font-bold">{adv.tenderTitle}</div>
                      <div className="text-xs text-black/50 mt-0.5">{adv.ministry} · {adv.tenderNumber}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs font-medium text-black/60">Closes</div>
                      <div className="text-sm font-bold">{adv.closingDate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                    <div><span className="text-black/40">Published:</span> <span className="font-medium">{adv.publicationDate}</span></div>
                    <div><span className="text-black/40">Channels:</span> <span className="font-medium">{adv.publicationChannels.filter(c => c.status === "Published").length}/{adv.publicationChannels.length}</span></div>
                    <div><span className="text-black/40">Suppliers:</span> <span className="font-medium">{adv.supplierEngagements.length} engaged</span></div>
                    <div>
                      <span className="text-black/40">Clarifications:</span>{" "}
                      <span className={`font-medium ${adv.clarificationRequests.filter(c => c.status === "Pending").length > 0 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                        {adv.clarificationRequests.filter(c => c.status === "Pending").length} pending / {adv.clarificationRequests.length} total
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <WorkflowBadges status={adv.status} />
                    <div className="text-[10px] text-black/40 mt-1 text-right">{adv.status} · {adv.workflowProgress}%</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {adv.publicationChannels.map(ch => (
                      <div key={ch.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] ${ch.status === "Published" ? "bg-slate-50 border-slate-200 text-[#0F172A]" : "bg-[#EAF1F8] border-black/8 text-black/50"}`}>
                        {CHANNEL_ICON[ch.channel]}
                        <span>{ch.channel}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button onClick={() => setSelected(adv)}
                      className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Open
                    </button>
                    <button onClick={() => handleAction(adv.id, "publish")}
                      className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                      <Send className="h-3 w-3" /> Publish
                    </button>
                    <button onClick={() => handleAction(adv.id, "notify")}
                      className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
                      <Bell className="h-3 w-3" /> Notify Suppliers
                    </button>
                    <button onClick={() => handleAction(adv.id, "download")}
                      className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                      <Download className="h-3 w-3" /> Export
                    </button>
                    <button onClick={() => handleAction(adv.id, "close")}
                      className="h-8 px-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 flex items-center gap-1">
                      <X className="h-3 w-3" /> Close
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <AdvertisementDetailPanel adv={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}
    </AppShell>
  );
}
