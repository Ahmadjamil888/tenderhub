import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader , PageContextBar } from "@/components/AppShell";
import {
  Search, FileText, Building2, DollarSign, Package, Users, ShieldCheck,
  BarChart3, Filter, X, ChevronRight, Clock, Sparkles, Layers,
} from "lucide-react";
import { useTenders, useVendors, useContracts, useAssets } from "@/hooks/use-store";
import { pushNotification } from "@/lib/local-store";

type SearchCategory = "All" | "Tenders" | "Contracts" | "Suppliers" | "Payments" | "Assets" | "Projects" | "Audit Logs" | "Reports" | "Users";

const CATEGORY_ICON: Record<SearchCategory, React.ElementType> = {
  All: Search, Tenders: FileText, Contracts: FileText, Suppliers: Building2,
  Payments: DollarSign, Assets: Package, Projects: Layers,
  "Audit Logs": ShieldCheck, Reports: BarChart3, Users: Users,
};

const STATIC_DATA: { id: string; type: SearchCategory; title: string; subtitle: string; route: string; tags: string[] }[] = [
  { id: "ZW-PRA-2026-00184", type: "Tenders", title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics", subtitle: "Ministry of Energy · Open Tender · USD 14,800,000 · Bidding", route: "/tenders", tags: ["Energy", "Infrastructure", "Open"] },
  { id: "ZW-PRA-2026-00183", type: "Tenders", title: "Procurement of Antiretroviral Medicines (2-Year Framework)", subtitle: "Ministry of Health · Framework · USD 42,500,000 · Evaluation", route: "/tenders", tags: ["Health", "Pharma", "Framework"] },
  { id: "CN-2026-0411", type: "Contracts", title: "Beitbridge Highway Section 3 — Highveld Engineering", subtitle: "Contract · On Track · 64% complete · USD 71.0M", route: "/contracts", tags: ["Infrastructure", "Roads", "Active"] },
  { id: "CN-2026-0418", type: "Contracts", title: "ARV Medicines Framework — Zimbabwe Pharma Holdings", subtitle: "Contract · On Track · 38% complete · USD 42.5M", route: "/contracts", tags: ["Health", "Framework", "Active"] },
  { id: "VEN-00482", type: "Suppliers", title: "Highveld Engineering (Pvt) Ltd", subtitle: "Approved Supplier · Infrastructure · Rating 4.7/5 · Low Risk", route: "/vendors", tags: ["Infrastructure", "Approved", "Grade A"] },
  { id: "VEN-00481", type: "Suppliers", title: "Zimbabwe Pharma Holdings", subtitle: "Approved Supplier · Health & Pharma · Rating 4.5/5 · Low Risk", route: "/vendors", tags: ["Health", "Approved", "Grade A"] },
  { id: "INV-2026-4821", type: "Payments", title: "Invoice INV-2026-4821 — Highveld Engineering", subtitle: "Approved · USD 2,840,000 · PO-2026-0411", route: "/finance", tags: ["Invoice", "Approved", "Payment"] },
  { id: "AST-2026-00001", type: "Assets", title: "Toyota Land Cruiser VDJ200 — ZW 4821 AH", subtitle: "Active · Ministry of Transport · Good Condition", route: "/assets", tags: ["Vehicle", "Active", "Transport"] },
  { id: "PROJ-2026-00041", type: "Projects", title: "Beitbridge–Harare Highway Rehabilitation (Section 4)", subtitle: "In Progress · 37% complete · USD 88M · Ministry of Transport", route: "/projects", tags: ["Infrastructure", "Roads", "In Progress"] },
  { id: "AUD-2026-FA-041", type: "Audit Logs", title: "Audit Finding FA-2026-041 — Ghost Vendor Pattern", subtitle: "High Risk · Transport Dept · Referred to ZACC", route: "/audit", tags: ["Fraud", "High Risk", "ZACC"] },
  { id: "RPT-EXEC-JUN26", type: "Reports", title: "Executive Dashboard Report — June 2026", subtitle: "Ready · 421 downloads · 1.4 MB · PDF", route: "/reports", tags: ["Executive", "June 2026", "Ready"] },
  { id: "USR-001", type: "Users", title: "T. Moyo — Chief Procurement Officer", subtitle: "Active · PRAZ · MFA Enabled", route: "/system-admin", tags: ["CPO", "Active", "PRAZ"] },
];

const RECENT_SEARCHES = ["Beitbridge Highway", "ARV Medicines", "Highveld Engineering", "INV-2026-4821", "Solar Mini-Grids"];

export default function GlobalSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("All");
  const [results, setResults] = useState(STATIC_DATA);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { tenders } = useTenders();
  const { vendors } = useVendors();
  const { contracts } = useContracts();
  const { assets } = useAssets();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) { setResults(STATIC_DATA); setAiSuggestion(""); return; }

    // Merge static + live data
    const liveResults: typeof STATIC_DATA = [
      ...tenders.map(t => ({ id: t.id, type: "Tenders" as SearchCategory, title: t.title, subtitle: `${t.entity} · ${t.method} · ${t.value} · ${t.status}`, route: "/tenders", tags: [t.category, t.status] })),
      ...vendors.map(v => ({ id: v.id, type: "Suppliers" as SearchCategory, title: v.name, subtitle: `${v.status} Supplier · ${v.category} · Rating ${v.rating}/5`, route: "/vendors", tags: [v.category, v.status] })),
      ...contracts.map(c => ({ id: c.id, type: "Contracts" as SearchCategory, title: `${c.title} — ${c.vendor}`, subtitle: `Contract · ${c.status} · ${c.value}`, route: "/contracts", tags: [c.status] })),
      ...assets.map(a => ({ id: a.id, type: "Assets" as SearchCategory, title: a.name, subtitle: `${a.status} · ${a.department} · ${a.condition} Condition`, route: "/assets", tags: [a.assetClass, a.status] })),
    ];

    const all = [...STATIC_DATA, ...liveResults];
    const filtered = all.filter(item =>
      (category === "All" || item.type === category) &&
      (item.title.toLowerCase().includes(q) ||
       item.subtitle.toLowerCase().includes(q) ||
       item.id.toLowerCase().includes(q) ||
       item.tags.some(t => t.toLowerCase().includes(q)))
    );

    // Deduplicate by id
    const seen = new Set<string>();
    const deduped = filtered.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
    setResults(deduped);

    // AI suggestion
    if (q.length > 3) {
      const suggestions: Record<string, string> = {
        beitbridge: "Showing results for Beitbridge Highway project. Related: Contract CN-2026-0411, Project PROJ-2026-00041, Supplier Highveld Engineering.",
        arv: "ARV Medicines Framework tender and contract found. Related: Zimbabwe Pharma Holdings supplier, evaluation records.",
        solar: "Solar Mini-Grids tender found. Related: Ministry of Energy project, evaluation in progress.",
        default: `Found ${deduped.length} results across ${new Set(deduped.map(r => r.type)).size} categories.`,
      };
      setAiSuggestion(
        q.includes("beit") ? suggestions.beitbridge
          : q.includes("arv") ? suggestions.arv
          : q.includes("solar") ? suggestions.solar
          : suggestions.default
      );
    }
  }, [query, category, tenders, vendors, contracts, assets]);

  const categories: SearchCategory[] = ["All", "Tenders", "Contracts", "Suppliers", "Payments", "Assets", "Projects", "Audit Logs", "Reports", "Users"];

  const grouped = categories.slice(1).reduce((acc, cat) => {
    const items = results.filter(r => r.type === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof STATIC_DATA>);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System"
        process="Global Search"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Global Search"
          description="Search across tenders, contracts, suppliers, payments, assets, projects, audit logs, reports, and users."
        />

        {/* Main search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search everything — tenders, contracts, suppliers, payments, assets…"
            className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-black/10 text-sm focus:outline-none focus:border-black/30 bg-white shadow-sm transition-all"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded-full hover:bg-black/5">
              <X className="h-4 w-4 text-black/40" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map(cat => {
            const Icon = CATEGORY_ICON[cat];
            const count = cat === "All" ? results.length : results.filter(r => r.type === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${category === cat ? "bg-black text-white" : "border border-black/10 bg-white text-black/60 hover:bg-[#EAF1F8]"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat}
                {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${category === cat ? "bg-white/20 text-white" : "bg-black/5 text-black/50"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* AI suggestion */}
        {aiSuggestion && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
            <span className="text-xs text-[#0F172A]">{aiSuggestion}</span>
          </div>
        )}

        {/* No query — show recent + suggestions */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader title="Recent Searches" />
              <div className="p-4 space-y-2">
                {RECENT_SEARCHES.map(s => (
                  <button key={s} onClick={() => setQuery(s)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#EAF1F8] text-left transition-colors">
                    <Clock className="h-3.5 w-3.5 text-black/30 flex-shrink-0" />
                    <span className="text-sm text-black/70">{s}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-black/30 ml-auto" />
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Quick Access" subtitle="Most accessed records" />
              <div className="p-4 space-y-2">
                {STATIC_DATA.slice(0, 5).map(item => {
                  const Icon = CATEGORY_ICON[item.type];
                  return (
                    <button key={item.id} onClick={() => navigate(item.route)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#EAF1F8] text-left transition-colors">
                      <Icon className="h-3.5 w-3.5 text-black/30 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-black truncate">{item.title}</div>
                        <div className="text-[10px] text-black/40 truncate">{item.type} · {item.id}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-black/30 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="h-12 w-12 text-black/10 mx-auto mb-3" />
                <div className="text-sm font-semibold text-black/40">No results found for "{query}"</div>
                <div className="text-xs text-black/30 mt-1">Try a different keyword or remove filters</div>
              </div>
            ) : category === "All" ? (
              Object.entries(grouped).map(([cat, items]) => {
                const Icon = CATEGORY_ICON[cat as SearchCategory];
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-4 w-4 text-black/40" />
                      <span className="text-sm font-semibold text-black">{cat}</span>
                      <span className="text-xs text-black/40">{items.length} result{items.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="space-y-2">
                      {items.slice(0, 4).map(item => (
                        <ResultRow key={item.id} item={item} query={query} onNavigate={() => navigate(item.route)} />
                      ))}
                      {items.length > 4 && (
                        <button onClick={() => setCategory(cat as SearchCategory)} className="text-xs text-black/50 hover:text-black flex items-center gap-1 ml-2">
                          View all {items.length} {cat} results <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-2">
                {results.map(item => (
                  <ResultRow key={item.id} item={item} query={query} onNavigate={() => navigate(item.route)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ResultRow({ item, query, onNavigate }: {
  item: { id: string; type: SearchCategory; title: string; subtitle: string; route: string; tags: string[] };
  query: string;
  onNavigate: () => void;
}) {
  const Icon = CATEGORY_ICON[item.type];
  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-slate-200 text-black rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
  };

  return (
    <button onClick={onNavigate} className="w-full flex items-start gap-3 p-3 border border-black/8 rounded-xl hover:border-black/20 hover:bg-[#F8F8F8]/40 text-left transition-all">
      <div className="h-8 w-8 bg-black/5 rounded-lg grid place-items-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-black/40" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-black leading-tight">{highlight(item.title)}</div>
        <div className="text-xs text-black/50 mt-0.5 truncate">{highlight(item.subtitle)}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-full">{item.type}</span>
          {item.tags.slice(0, 2).map(t => <span key={t} className="text-[9px] bg-black/5 text-black/50 px-1.5 py-0.5 rounded-full">{t}</span>)}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 text-[10px] text-black/30">
        <span>{item.id}</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}
