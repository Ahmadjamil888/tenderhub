import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge , PageContextBar } from "@/components/AppShell";
import { roles } from "@/lib/mock-data";
import { GripVertical, Copy, Share2, ArrowRightLeft, Shield } from "lucide-react";

const FEATURES = [
  "View Tenders", "Create Tender", "Approve Tender", "Publish Tender",
  "View Bids", "Open Bids", "Score Technical", "Score Financial",
  "Award Recommendation", "Approve Award", "Manage Contracts", "Approve Variations",
  "Approve Payments", "View Reports", "Export Data", "Manage Users",
  "Configure Workflows", "View Audit Trail", "Manage Vendors", "Blacklist Vendor",
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState(0);
  const [assigned, setAssigned] = useState(FEATURES.slice(0, 12));
  const available = FEATURES.filter((f) => !assigned.includes(f));

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System Administration"
        process="Roles & Permissions"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Governance</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Role Management Center"
          description="Visual control for all 32 system roles. Build, clone, share, migrate, and audit roles without writing code."
        />

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"><Copy className="h-4 w-4" /> Clone Role</button>
          <button className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary"><Share2 className="h-4 w-4" /> Share Feature</button>
          <button className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary"><ArrowRightLeft className="h-4 w-4" /> Migrate Role</button>
          <button className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary"><Shield className="h-4 w-4" /> Delegate</button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 lg:col-span-4">
            <CardHeader title="All Roles" subtitle={`${roles.length} system roles`} />
            <div className="max-h-[560px] overflow-y-auto divide-y divide-border">
              {roles.map((r, i) => (
                <div
                  key={r}
                  onClick={() => setSelectedRole(i)}
                  className={`px-5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors ${selectedRole === i ? "bg-primary/5 border-l-2 border-primary" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm ${selectedRole === i ? "font-semibold text-primary" : "text-foreground"}`}>{r}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{Math.floor(i % 5 * 3 + 8)} features</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="col-span-12 lg:col-span-8">
            <CardHeader
              title={roles[selectedRole]}
              subtitle="Drag features in or out · changes are versioned and audited"
              action={<Badge tone="blue">Editing</Badge>}
            />
            <div className="p-5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Assigned features ({assigned.length})</div>
              <div className="flex flex-wrap gap-2 mb-6 min-h-[80px] p-3 rounded-md bg-slate-50 border border-dashed border-primary/40">
                {assigned.map((f) => (
                  <button
                    key={f}
                    onClick={() => setAssigned((prev) => prev.filter((x) => x !== f))}
                    className="bg-card border border-border rounded-md px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-sm hover:border-red-300 hover:bg-red-50 transition-colors group"
                    title="Click to remove"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    {f}
                    <span className="text-red-400 opacity-0 group-hover:opacity-100">×</span>
                  </button>
                ))}
              </div>

              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Available features ({available.length})</div>
              <div className="flex flex-wrap gap-2 p-3 rounded-md bg-secondary/40 border border-dashed border-border">
                {available.map((f) => (
                  <button
                    key={f}
                    onClick={() => setAssigned((prev) => [...prev, f])}
                    className="bg-card border border-border rounded-md px-3 py-1.5 text-xs flex items-center gap-1.5 hover:border-primary/40 hover:bg-slate-50 transition-colors"
                    title="Click to assign"
                  >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    {f}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: "Approval Authority", v: "Up to USD 5M" },
                  { l: "Workflow Inbox", v: "Enabled" },
                  { l: "AI Copilot Access", v: "Full" },
                  { l: "Audit Trail", v: "Immutable" },
                ].map((s) => (
                  <div key={s.l} className="rounded-md border border-border bg-card p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{s.l}</div>
                    <div className="text-sm font-semibold mt-1">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
