import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import WorkflowStepper from "@/components/WorkflowStepper";
import { ShoppingCart, Plus, CheckCircle2, Clock, Sparkles, AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "@/lib/toast";

const RFQ_STAGES = [
  { id: 1,  label: "Requisition",      status: "completed" as const, aiRole: "Demand AI" },
  { id: 2,  label: "PR Approval",      status: "completed" as const, aiRole: "Policy AI" },
  { id: 3,  label: "RFQ Creation",     status: "completed" as const, aiRole: "Drafting AI" },
  { id: 4,  label: "Supplier Select",  status: "completed" as const, aiRole: "Supplier AI" },
  { id: 5,  label: "RFQ Issuance",     status: "active" as const,    aiRole: "Publication AI" },
  { id: 6,  label: "Clarifications",   status: "pending" as const,   aiRole: "Clarification AI" },
  { id: 7,  label: "Quote Submission", status: "pending" as const,   aiRole: "Compliance AI" },
  { id: 8,  label: "Bid Opening",      status: "pending" as const,   aiRole: "Opening AI" },
  { id: 9,  label: "Tech Evaluation",  status: "pending" as const,   aiRole: "Eval AI" },
  { id: 10, label: "Fin Evaluation",   status: "pending" as const,   aiRole: "Financial AI" },
  { id: 11, label: "Eval Approval",    status: "pending" as const,   aiRole: "Review AI" },
  { id: 12, label: "PO / Award",       status: "pending" as const,   aiRole: "Contract AI" },
  { id: 13, label: "Contract Mgmt",    status: "pending" as const,   aiRole: "Contract AI" },
  { id: 14, label: "GRN / Acceptance", status: "pending" as const,   aiRole: "Inspection AI" },
  { id: 15, label: "Invoice",          status: "pending" as const,   aiRole: "Invoice AI" },
  { id: 16, label: "Payment Approval", status: "pending" as const,   aiRole: "Payment AI" },
  { id: 17, label: "Vendor Payment",   status: "pending" as const,   aiRole: "Payment AI" },
  { id: 18, label: "Perf Evaluation",  status: "pending" as const,   aiRole: "Performance AI" },
];

const LIVE_RFQS = [
  { id: "RFQ-2026-0892", title: "Office Stationery — Q3 2026", dept: "Finance Dept", value: "USD 4,200", stage: 5, stageLabel: "Issued to Suppliers", suppliers: 4, status: "Active", deadline: "2026-06-28" },
  { id: "RFQ-2026-0891", title: "Printer Cartridges & Toner", dept: "IT Department", value: "USD 1,800", stage: 9, stageLabel: "Technical Evaluation", suppliers: 3, status: "Evaluating", deadline: "2026-06-25" },
  { id: "RFQ-2026-0890", title: "Security Guard Services — 2 months", dept: "Admin", value: "USD 6,500", stage: 12, stageLabel: "PO Issued", suppliers: 5, status: "Awarded", deadline: "2026-06-20" },
  { id: "RFQ-2026-0889", title: "Vehicle Tyres — Fleet Maintenance", dept: "Transport", value: "USD 3,200", stage: 14, stageLabel: "Goods Received", suppliers: 3, status: "GRN Pending", deadline: "2026-06-18" },
  { id: "RFQ-2026-0888", title: "Cleaning Supplies — Monthly", dept: "Facilities", value: "USD 890", stage: 17, stageLabel: "Payment Processing", suppliers: 2, status: "Payment", deadline: "2026-06-15" },
];

const QUOTES = [
  { supplier: "Stationery World Ltd", tech: 92, price: 3800, delivery: "5 days", aiRec: "Best Value", rank: 1 },
  { supplier: "Office Direct Zim", tech: 88, price: 4100, delivery: "3 days", aiRec: "Faster Delivery", rank: 2 },
  { supplier: "Zim Supplies Co.", tech: 85, price: 4200, delivery: "7 days", aiRec: "Acceptable", rank: 3 },
  { supplier: "Metro Office Pvt", tech: 78, price: 3950, delivery: "10 days", aiRec: "Marginal", rank: 4 },
];

export default function RFQPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "workflow" | "evaluation" | "new">("dashboard");
  const [newRFQStep, setNewRFQStep] = useState(1);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Request for Quotation"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">RFQ · Below Threshold Procurement</Badge>
          <Badge tone="muted">Max USD 10,000 · Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="RFQ Management — Request for Quotation"
          description="Streamlined procurement for small purchases under threshold. 18-stage automated workflow covering Works, Services, and Supplies."
          actions={
            <button onClick={() => setActiveTab("new")} className="h-9 px-3 rounded-md bg-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
              <Plus className="h-4 w-4" /> New RFQ
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active RFQs" value="284" delta="+28 this week" icon={ShoppingCart} />
          <KpiCard label="POs Issued Today" value="42" delta="USD 84,200 total" icon={DollarSign} />
          <KpiCard label="Avg Cycle Time" value="4.2 days" delta="-0.8 days vs target" icon={Clock} />
          <KpiCard label="AI Auto-actions" value="1,284" delta="Today" icon={Sparkles} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border flex-wrap">
          {([["dashboard","Dashboard"],["workflow","18-Stage Workflow"],["evaluation","Quote Evaluation"],["new","Create RFQ"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Live RFQ Tracker" subtitle="All active RFQs with stage progress" action={<Badge tone="green">Real-time</Badge>} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["RFQ ID","Title","Department","Value","Stage","Suppliers","Deadline","Status",""].map(h => (
                        <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {LIVE_RFQS.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{r.title}</td>
                        <td className="px-4 py-3 text-foreground">{r.dept}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{r.value}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${(r.stage / 18) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">S{r.stage}: {r.stageLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-foreground">{r.suppliers}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{r.deadline}</td>
                        <td className="px-4 py-3">
                          <Badge tone={r.status === "Awarded" ? "green" : r.status === "Evaluating" ? "amber" : r.status === "Payment" ? "blue" : "muted"}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toast(`${r.id} — ${r.title} | ${r.dept} | ${r.value} | Stage ${r.stage}/18 | Status: ${r.status}`, "info")}
                            className="h-7 px-2 rounded border border-border text-xs hover:bg-secondary transition-colors"
                          >Open</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "workflow" && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="RFQ 18-Stage Workflow" subtitle="AI assistant active at every stage" />
              <div className="p-5">
                <WorkflowStepper steps={RFQ_STAGES.slice(0,9)} orientation="horizontal" />
                <div className="my-4 border-t border-dashed border-border" />
                <WorkflowStepper steps={RFQ_STAGES.slice(9)} orientation="horizontal" />
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { stage: "Stage 1–2: Requisition & Approval", features: ["Dept submits PR via catalog", "Budget code auto-validated", "Multi-level approval routing", "Duplicate detection"], ai: ["Suggest item descriptions", "Estimate market pricing", "Detect similar open orders", "Validate completeness"] },
                { stage: "Stage 3–5: RFQ Creation & Issuance", features: ["RFQ builder with templates", "Technical specs management", "Auto-populate supplier details", "Bulk notification dispatch"], ai: ["Draft specifications", "Suggest evaluation criteria", "Recommend contractual clauses", "Generate supplier shortlist"] },
                { stage: "Stage 9–11: Evaluation & Approval", features: ["Technical scorecards", "Price comparison matrix", "Automatic ranking", "Approval workflow routing"], ai: ["Compare supplier responses", "Detect suspicious pricing", "Recommend best-value option", "Summarize evaluation findings"] },
                { stage: "Stage 12–17: PO, GRN & Payment", features: ["Auto-generate PO", "3-way match engine", "GRN confirmation portal", "EFT/bank integration"], ai: ["Extract invoice data via OCR", "Detect duplicate invoices", "Predict payment risks", "Generate remittance advice"] },
              ].map((s) => (
                <Card key={s.stage} className="p-4">
                  <div className="text-sm font-bold text-foreground mb-3">{s.stage}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Features</div>
                      <div className="space-y-1">
                        {s.features.map(f => (
                          <div key={f} className="flex items-start gap-1.5 text-xs"><CheckCircle2 className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />{f}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#0F172A]" />AI Actions</div>
                      <div className="space-y-1">
                        {s.ai.map(a => (
                          <div key={a} className="flex items-start gap-1.5 text-xs text-[#0F172A]"><span className="h-3 w-3 mt-0.5 flex-shrink-0 text-center">🤖</span>{a}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Quote Evaluation — RFQ-2026-0892: Office Stationery"
                subtitle="Stage 9–10 · Technical & Financial Evaluation"
                action={<Badge tone="blue"><Sparkles className="h-3 w-3 mr-1" />AI Scoring Active</Badge>}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["Rank","Supplier","Tech Score","Unit Price","Delivery","Total Cost","AI Rec.","Action"].map(h => (
                        <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {QUOTES.map((q) => (
                      <tr key={q.supplier} className={`hover:bg-secondary/40 ${q.rank === 1 ? "bg-slate-50/40" : ""}`}>
                        <td className="px-4 py-3">
                          <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white ${q.rank === 1 ? "bg-[#0F172A]" : q.rank === 2 ? "bg-slate-400" : "bg-secondary text-muted-foreground"}`}>{q.rank}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{q.supplier}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold ${q.tech >= 90 ? "text-[#0F172A]" : "text-foreground"}`}>{q.tech}/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">USD {q.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-foreground">{q.delivery}</td>
                        <td className="px-4 py-3 font-semibold text-primary">USD {(q.price * 1.08).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge tone={q.aiRec === "Best Value" ? "green" : q.aiRec === "Faster Delivery" ? "blue" : q.aiRec === "Acceptable" ? "muted" : "amber"}>{q.aiRec}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {q.rank === 1 && (
                            <button
                              onClick={() => {
                                toast(`Purchase Order PO-2026-0893 issued to ${q.supplier} — USD ${q.price.toLocaleString()}. Supplier notified. AI Report sent to CPO.`, "success");
                              }}
                              className="h-7 px-2 rounded-md bg-[#0F172A] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                            >Issue PO</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-sm text-[#0F172A] font-medium">
                    AI Recommendation: Award to <strong>Stationery World Ltd</strong> — Best technical score (92/100) with lowest total cost (USD 4,104). Savings vs budget: USD 96.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "new" && <NewRFQWizard step={newRFQStep} setStep={setNewRFQStep} />}
      </div>

      <AIAssistantPanel
        agentName="RFQ Procurement AI"
        agentRole="RFQ drafting, supplier selection, evaluation"
        context="RFQ management"
        color="emerald"
        suggestedPrompts={["Draft specs for office stationery", "Which suppliers can deliver in 5 days?", "Compare these 3 quotes", "Generate purchase order"]}
      />
    </AppShell>
  );
}

function NewRFQWizard({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const STEPS = ["Requisition Details", "Specifications", "Supplier Selection", "Review & Issue"];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Create New RFQ" subtitle="Step-by-step guided workflow" />
        <div className="p-5">
          <div className="flex gap-0 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold flex-shrink-0 cursor-pointer transition-colors ${i + 1 < step ? "bg-[#0F172A] text-white" : i + 1 === step ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
                  onClick={() => setStep(i + 1)}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <div className="ml-2 text-xs font-medium text-foreground hidden md:block flex-1">{s}</div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i + 1 < step ? "bg-slate-400" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requesting Department</label>
                  <select className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Finance Department</option><option>IT Department</option><option>Admin</option><option>Transport</option>
                  </select></div>
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item Description</label>
                  <input defaultValue="Office stationery supplies — Q3 2026" className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                  <select className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm"><option>Supplies</option><option>Services</option><option>Works</option></select></div>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Value (USD)</label>
                  <input type="number" defaultValue={4200} className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required By</label>
                  <input type="date" defaultValue="2026-07-15" className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-card text-sm" /></div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-[#0F172A] mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#0F172A]">AI Suggestion</div>
                      <div className="text-xs text-[#0F172A] mt-0.5">Based on similar orders, estimated market price is USD 3,800–4,400. Budget appears reasonable.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-sm font-semibold text-[#0F172A]">AI-Generated Specifications</span>
                  <Badge tone="blue">Generated</Badge>
                </div>
                <textarea className="w-full h-32 text-xs text-foreground bg-white border border-slate-200 rounded-md p-3 resize-none" defaultValue={"1. A4 Paper (80gsm) — 50 reams\n2. Blue ballpoint pens — 5 boxes (12 per box)\n3. Black ballpoint pens — 5 boxes (12 per box)\n4. Staples (standard) — 10 boxes\n5. Folders (A4, hard cover) — 50 units\n6. Sticky notes (76x76mm) — 20 packs\n7. Printer cartridges (HP 65XL black) — 6 units\n\nDelivery: Within 5 working days\nWarranty: Replacement for defective items within 7 days"} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0F172A]" />
                <span className="text-xs text-[#0F172A] font-medium">AI identified 6 qualified suppliers in Stationery category. 4 invited automatically based on performance history.</span>
              </div>
              {["Stationery World Ltd (4.8★)","Office Direct Zim (4.5★)","Zim Supplies Co. (4.2★)","Metro Office Pvt (4.0★)","Capital Stationery (3.8★)","Delta Office (3.6★)"].map((s) => (
                <label key={s} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary cursor-pointer">
                  <input type="checkbox" defaultChecked={s.includes("4.8") || s.includes("4.5") || s.includes("4.2") || s.includes("4.0")} className="rounded" />
                  <span className="text-sm text-foreground">{s}</span>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[["RFQ Number","RFQ-2026-0893 (auto)"],["Department","Finance Department"],["Category","Supplies"],["Estimated Value","USD 4,200"],["Suppliers Invited","4"],["Submission Deadline","2026-06-28 16:00"],].map(([l,v]) => (
                  <div key={l} className="rounded-lg border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
                    <div className="text-sm font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-sm text-[#0F172A] font-medium">Ready to issue. AI will auto-notify 4 suppliers and track submissions.</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary disabled:opacity-40">← Back</button>
            {step < 4
              ? <button onClick={() => setStep(step + 1)} className="h-9 px-4 rounded-md bg-primary text-white text-sm font-medium hover:opacity-90">Continue →</button>
              : <button
                  onClick={() => {
                    toast("RFQ-2026-0893 issued to 4 suppliers. Submission deadline: 2026-06-28 16:00. AI tracking enabled.", "success");
                    setStep(1);
                  }}
                  className="h-9 px-4 rounded-md bg-[#0F172A] text-white text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Issue RFQ
                </button>
            }
          </div>
        </div>
      </Card>
    </div>
  );
}
