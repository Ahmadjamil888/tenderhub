import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { BookOpen, Search, FileText, ExternalLink, Tag, ChevronRight, Sparkles, Download, Plus, Filter, Star } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

type KBCategory = "Policies" | "SOPs" | "Templates" | "Guidelines" | "AI Recommendations" | "Best Practices" | "FAQ" | "Training";

type KBArticle = {
  id: string; title: string; category: KBCategory; summary: string;
  content: string; tags: string[]; author: string; lastUpdated: string;
  views: number; helpful: number; version: string; featured: boolean;
};

const SEED_ARTICLES: KBArticle[] = [
  { id: "KB-001", title: "Zimbabwe Public Procurement and Disposal of Public Assets Act [Chapter 22:23]", category: "Policies", summary: "Comprehensive guide to PPDPA — the primary legislative framework governing all government procurement.", content: "The PPDPA establishes the legal framework for government procurement in Zimbabwe...", tags: ["Legal", "PPDPA", "Regulations"], author: "Legal Division", lastUpdated: "2026-01-15", views: 1842, helpful: 298, version: "2.0", featured: true },
  { id: "KB-002", title: "Standard Operating Procedure — Open Tender Process", category: "SOPs", summary: "Step-by-step guide to conducting an open tender from planning to award.", content: "This SOP covers all steps required for an open tender procurement...", tags: ["Tender", "Open Tender", "Process"], author: "PRAZ", lastUpdated: "2026-03-01", views: 2410, helpful: 412, version: "3.1", featured: true },
  { id: "KB-003", title: "Contract Management Template Library", category: "Templates", summary: "Standard contract templates including works, goods, services, and framework agreements.", content: "This library contains 18 approved contract templates...", tags: ["Contract", "Templates", "Legal"], author: "Legal Division", lastUpdated: "2026-02-20", views: 3102, helpful: 521, version: "1.4", featured: false },
  { id: "KB-004", title: "AI-Powered Bid Evaluation Guide", category: "AI Recommendations", summary: "How to use the AI evaluation tools for technical and financial bid assessment.", content: "The platform AI engine can evaluate bids across multiple dimensions...", tags: ["AI", "Evaluation", "Bids", "Technology"], author: "AI Division", lastUpdated: "2026-04-10", views: 987, helpful: 156, version: "1.0", featured: true },
  { id: "KB-005", title: "SME Procurement Guide — Supporting Local Businesses", category: "Guidelines", summary: "Guidelines for procurement officers to maximise SME participation in government tenders.", content: "SME participation enhances competition and economic development...", tags: ["SME", "Local Business", "Inclusion"], author: "PRAZ", lastUpdated: "2025-11-30", views: 1203, helpful: 234, version: "2.2", featured: false },
  { id: "KB-006", title: "Frequently Asked Questions — Supplier Registration", category: "FAQ", summary: "Answers to the most common questions from suppliers about the registration process.", content: "Q: How do I register as a government supplier?...", tags: ["FAQ", "Supplier", "Registration"], author: "Vendor Relations", lastUpdated: "2026-05-01", views: 5621, helpful: 892, version: "1.6", featured: false },
  { id: "KB-007", title: "Procurement Officer Training Module 1 — Fundamentals", category: "Training", summary: "Introduction to procurement principles, ethics, and the regulatory framework.", content: "Module 1 covers the fundamentals of public procurement...", tags: ["Training", "Fundamentals", "Ethics"], author: "Training Division", lastUpdated: "2026-01-20", views: 2814, helpful: 445, version: "4.0", featured: false },
  { id: "KB-008", title: "Best Practices in Contract Closure — Zimbabwe Government Experience", category: "Best Practices", summary: "Lessons from 200+ completed contracts. Essential reading before closing any contract.", content: "Based on analysis of 200+ government contracts...", tags: ["Contract Closure", "Best Practice", "Management"], author: "CPO Division", lastUpdated: "2026-02-28", views: 1456, helpful: 287, version: "1.1", featured: true },
];

const CATEGORY_CONFIG: Record<KBCategory, { color: string; icon: string }> = {
  "Policies": { color: "bg-slate-100 text-[#0F172A]", icon: "📋" },
  "SOPs": { color: "bg-slate-100 text-[#0F172A]", icon: "📝" },
  "Templates": { color: "bg-slate-100 text-[#0F172A]", icon: "📄" },
  "Guidelines": { color: "bg-slate-100 text-[#0F172A]", icon: "📌" },
  "AI Recommendations": { color: "bg-slate-100 text-[#0F172A]", icon: "🤖" },
  "Best Practices": { color: "bg-slate-100 text-[#0F172A]", icon: "⭐" },
  "FAQ": { color: "bg-slate-100 text-[#0F172A]", icon: "❓" },
  "Training": { color: "bg-slate-100 text-[#0F172A]", icon: "🎓" },
};

function ArticleModal({ article, onClose }: { article: KBArticle; onClose: () => void }) {
  const { color, icon } = CATEGORY_CONFIG[article.category];
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-black/10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{icon} {article.category}</span>
              <span className="text-[10px] text-black/40">v{article.version}</span>
              {article.featured && <span className="text-[10px] font-semibold text-[#0F172A]">★ Featured</span>}
            </div>
            <div className="text-sm font-bold text-black leading-tight">{article.title}</div>
            <div className="text-xs text-black/40 mt-1">{article.author} · Updated {article.lastUpdated} · {article.views} views</div>
          </div>
          <button onClick={onClose} className="ml-4 flex-shrink-0"><X className="h-4 w-4 text-black/40" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-black/70 leading-relaxed bg-[#F8F8F8] rounded-xl p-4 mb-4">{article.summary}</p>
            <p className="text-sm text-black/60 leading-relaxed">{article.content}</p>
            <p className="text-sm text-black/60 mt-4">This document is part of the Zimbabwe Government Procurement Knowledge Base. For full details, download the complete document using the button below.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {article.tags.map(tag => <span key={tag} className="text-[10px] bg-black/5 text-black/50 px-2 py-0.5 rounded-full">{tag}</span>)}
          </div>
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex items-center justify-between bg-[#fafafa]">
          <span className="text-xs text-black/40">{article.helpful} people found this helpful</span>
          <div className="flex gap-2">
            <button onClick={() => pushNotification("Article marked as helpful.", "success")} className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">👍 Helpful</button>
            <button onClick={() => pushNotification("Article downloaded.", "success")} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5"><Download className="h-3 w-3" />Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { X } from "lucide-react";

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState(SEED_ARTICLES);
  const [selected, setSelected] = useState<KBArticle | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [aiQ, setAiQ] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [tab, setTab] = useState<"Browse" | "AI Search" | "Featured">("Browse");

  const categories = Array.from(new Set(articles.map(a => a.category)));
  const filtered = articles.filter(a =>
    (catFilter === "All" || a.category === catFilter) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  const askAI = () => {
    if (!aiQ.trim()) return;
    const answers: Record<string, string> = {
      default: "Based on the Zimbabwe PPDPA and current procurement guidelines, I recommend following the standard open tender process for contracts above USD 500,000. Consult the SOP library for step-by-step guidance.",
      sme: "For SME participation, the guidelines require a minimum 30% SME set-aside for contracts below USD 1M. Review the SME Procurement Guide (KB-005) for full details.",
      framework: "Framework agreements are governed by Chapter 4 of the PPDPA. They allow multiple call-offs without repeating the full tender process. Maximum duration is 3 years.",
      evaluation: "The AI Evaluation module uses weighted scoring across technical (70%) and financial (30%) criteria by default. Weights can be customised per tender. See KB-004 for the full guide.",
    };
    const q = aiQ.toLowerCase();
    const answer = q.includes("sme") ? answers.sme : q.includes("framework") ? answers.framework : q.includes("evaluat") ? answers.evaluation : answers.default;
    setAiAnswer(answer);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Knowledge Management"
        process="Knowledge Base"
        financialYear="FY2026"
        pageType="dashboard"
      />
      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Procurement Knowledge Base"
          description="Centralized repository of policies, SOPs, templates, guidelines, AI recommendations, and training materials."
          actions={
            <button onClick={() => pushNotification("Knowledge base article created.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4" />Add Article
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Articles" value={String(articles.length)} delta="Published resources" />
          <KpiCard label="Total Views" value={articles.reduce((s, a) => s + a.views, 0).toLocaleString()} delta="Knowledge accessed" positive />
          <KpiCard label="Featured Articles" value={String(articles.filter(a => a.featured).length)} delta="Top resources" positive />
          <KpiCard label="Categories" value={String(categories.length)} delta="Knowledge domains" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["Browse", "AI Search", "Featured"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Browse" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search knowledge base…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(article => {
                const { color, icon } = CATEGORY_CONFIG[article.category];
                return (
                  <div key={article.id} onClick={() => setSelected(article)} className="border border-black/8 rounded-xl p-4 hover:border-black/20 hover:bg-[#F8F8F8]/40 cursor-pointer transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}>{icon} {article.category}</span>
                          {article.featured && <Star className="h-3 w-3 text-slate-500 fill-amber-400" />}
                        </div>
                        <div className="text-sm font-semibold text-black leading-tight">{article.title}</div>
                        <div className="text-xs text-black/50 mt-1 line-clamp-2">{article.summary}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1">{article.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] bg-black/5 text-black/50 px-1.5 py-0.5 rounded">{t}</span>)}</div>
                      <div className="flex items-center gap-2 text-[10px] text-black/40">
                        <span>{article.views} views</span>
                        <span>v{article.version}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "AI Search" && (
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-[#0F172A]" />
                <div>
                  <div className="text-sm font-bold text-black">AI Knowledge Assistant</div>
                  <div className="text-xs text-black/50">Ask any procurement question — powered by the Zimbabwe PPDPA and government guidelines</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input value={aiQ} onChange={e => setAiQ(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} placeholder="e.g. How do I handle SME procurement? What are framework agreement rules?" className="flex-1 h-10 px-4 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                <button onClick={askAI} className="h-10 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800">Ask AI</button>
              </div>
              {aiAnswer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-[10px] font-semibold text-[#0F172A] uppercase mb-2">AI Response</div>
                  <div className="text-sm text-black/80 leading-relaxed">{aiAnswer}</div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {["How to run an open tender?", "SME procurement requirements", "Framework agreement rules", "Contract closure checklist"].map(q => (
                  <button key={q} onClick={() => { setAiQ(q); }} className="text-left p-3 border border-black/8 rounded-xl text-xs text-black/60 hover:bg-[#F8F8F8] hover:text-black transition-colors">
                    <span className="text-[#0F172A] mr-1.5">→</span>{q}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tab === "Featured" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.filter(a => a.featured).map(article => {
              const { color, icon } = CATEGORY_CONFIG[article.category];
              return (
                <div key={article.id} onClick={() => setSelected(article)} className="border-2 border-slate-200 rounded-xl p-5 hover:border-slate-200 cursor-pointer transition-all bg-slate-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-slate-500 fill-amber-400" />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}>{icon} {article.category}</span>
                  </div>
                  <div className="text-sm font-bold text-black mb-1">{article.title}</div>
                  <div className="text-xs text-black/60 line-clamp-2">{article.summary}</div>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-black/40">
                    <span>{article.views} views · {article.helpful} helpful</span>
                    <span>v{article.version} · {article.lastUpdated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
