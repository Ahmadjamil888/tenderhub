import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { tenders, contracts, kpis } from "@/lib/mock-data";
import { Search, Download, Globe2, FileText, Users, Star } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

export default function PortalPage() {
  const [search, setSearch] = useState("");
  const published = tenders.filter((t) => ["Published", "Bidding", "Evaluation", "Awarded"].includes(t.status));
  const awarded = tenders.filter((t) => t.status === "Awarded");

  const filtered = published.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.entity.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Public Portal"
        process="Tender Portal"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Public Transparency Portal"
          description="Citizens, journalists, civil society, and businesses can browse every published tender, award, contract, and supplier statistic of the Government of Zimbabwe."
        />

        {/* Open Data Banner */}
        <div className="rounded-lg bg-primary p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-300">Open Data · Updated live</div>
            <div className="text-xl font-semibold text-white mt-1">{kpis.totalSpend.value} total national procurement spend disclosed YTD</div>
            <div className="text-sm text-slate-300 mt-1">All government procurement published under Zimbabwe Open Data Initiative</div>
          </div>
          <button
            onClick={() => {
              const rows = ["ID,Title,Entity,Category,Value,Method,Status,Closing", ...tenders.map(t => `${t.id},"${t.title}","${t.entity}","${t.category}","${t.value}","${t.method}","${t.status}","${t.closing}"`)].join("\n");
              const blob = new Blob([rows], { type: "text/csv" });
              const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "zimbabwe-procurement-open-data.csv"; a.click(); URL.revokeObjectURL(url);
              pushNotification("Open Dataset downloaded — zimbabwe-procurement-open-data.csv ready.", "success");
            }}
            className="h-9 px-4 rounded-md bg-white text-primary text-sm font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Download Open Dataset
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { l: "Published Tenders", v: published.length.toString(), icon: FileText },
            { l: "Awards Issued YTD", v: "1,842", icon: Star },
            { l: "Active Contracts", v: kpis.contractsInProgress.value, icon: Globe2 },
            { l: "Registered Suppliers", v: "12,847", icon: Users },
            { l: "Citizen Feedback", v: "3,128", icon: Star },
          ].map((s) => (
            <KpiCard key={s.l} label={s.l} value={s.v} icon={s.icon} />
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader title="Search Published Tenders" subtitle="Open to public · no login required" />
          <div className="p-5">
            <div className="relative max-w-xl mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by entity, category, or reference…"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No tenders match your search.</div>
              ) : filtered.map((t) => (
                <div key={t.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{t.entity} · {t.id} · closes {t.closing}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-foreground">{t.value}</div>
                    <Badge tone={t.status === "Awarded" ? "green" : t.status === "Evaluation" ? "amber" : "blue"}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Award Notices" subtitle="Publicly available" />
          <div className="divide-y divide-border">
            {awarded.concat(
              contracts.slice(0, 3).map((c) => ({
                id: c.id, title: c.title, entity: c.vendor, category: "", value: c.value, method: "Open" as const,
                status: "Awarded" as const, closing: c.end, bids: 0,
              }))
            ).map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground">{t.entity} · {t.value}</div>
                </div>
                <Badge tone="green">Awarded</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
