import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { Landmark, Building2, FileText, Users } from "lucide-react";
import { toast } from "@/lib/toast";
import InlineWorkbench from "@/components/InlineWorkbench";

const orgs = [
  { name: "Ministry of Finance", type: "Ministry", units: 12, users: 284, status: "Active" },
  { name: "Ministry of Health & Child Care", type: "Ministry", units: 28, users: 412, status: "Active" },
  { name: "ZIMRA", type: "Revenue Authority", units: 8, users: 156, status: "Active" },
  { name: "Ministry of Transport", type: "Ministry", units: 14, users: 198, status: "Active" },
  { name: "City of Harare", type: "Local Authority", units: 22, users: 340, status: "Active" },
  { name: "ZINARA", type: "State Enterprise", units: 5, users: 78, status: "Active" },
];

export default function GovernancePage() {
  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Corporate Governance"
        process="Governance Framework"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Phase 0</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Governance & Master Data"
          description="Foundational configuration: organizations, departments, projects, funding sources, cost centres, approval matrices, committees, and the national policy repository."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Entities On Platform" value="184" delta="+12 this year" icon={Building2} />
          <KpiCard label="Policy Documents" value="2,841" delta="All version-controlled" icon={FileText} />
          <KpiCard label="Active Committees" value="142" delta="38 evaluation active" icon={Users} />
          <KpiCard label="Approval Workflows" value="624" delta="Configured" icon={Landmark} />
        </div>

        <Card className="mb-6">
          <CardHeader title="Organization Hierarchy" subtitle="Registered government entities" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  {["Organization", "Type", "Business Units", "Users", "Status"].map((h) => (
                    <th key={h} className="text-left font-medium px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orgs.map((o) => (
                  <tr key={o.name} className="hover:bg-secondary/40 cursor-pointer" onClick={() => toast(`${o.name} — ${o.type} | ${o.units} business units | ${o.users} users | Status: ${o.status}`, "info")}>
                    <td className="px-5 py-3 font-medium text-foreground">{o.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.type}</td>
                    <td className="px-5 py-3 text-foreground">{o.units}</td>
                    <td className="px-5 py-3 text-foreground">{o.users.toLocaleString()}</td>
                    <td className="px-5 py-3"><Badge tone="green">{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <FeatureGrid features={[
          { title: "Organization Setup", desc: "Ministries, departments, agencies, state enterprises, local authorities — full national hierarchy." },
          { title: "Projects & Funding Sources", desc: "Capital projects, donor-funded projects, treasury, grants, loans — linked to budget lines." },
          { title: "Cost Centres & Business Units", desc: "Granular financial structure for spend control and reporting." },
          { title: "Approval Matrix", desc: "Threshold-based approvals by value, category, and method — configurable per entity." },
          { title: "Delegation Matrix", desc: "Acting roles, delegation of authority, leave coverage, temporary assignments." },
          { title: "Policy Repository", desc: "PPDPA Act, regulations, treasury instructions, entity SOPs — version-controlled and searchable." },
          { title: "Committee Management", desc: "Evaluation, adjudication, and special committees with conflict of interest tracking." },
          { title: "AI Policy Advisor", desc: "Natural-language Q&A across all procurement law and policy with cited sources." },
          { title: "Master Data Governance", desc: "Vendor master, item catalog, UNSPSC categories, units of measure with stewardship workflows." },
        ]} />
      </div>
      <InlineWorkbench context="Governance" />
    </AppShell>
  );
}
