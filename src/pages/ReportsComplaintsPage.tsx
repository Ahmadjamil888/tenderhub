import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, AlertOctagon, FileText, Send, ArrowLeft, CheckCircle2, Search, Phone, Mail, Sparkles, MessageSquare, X } from "lucide-react";

const CATEGORIES = [
  "Bid-rigging / collusion",
  "Conflict of interest",
  "Bribery / kick-back",
  "Delayed / non-payment to supplier",
  "Substandard delivery",
  "Contract manipulation",
  "Vendor debarment appeal",
  "Other procurement misconduct",
];

const PUBLIC_REPORTS = [
  { id: "RPT-2026-0142", title: "Quarterly Procurement Compliance Report — Q2 2026", org: "PRAZ", date: "12 Jul 2026", type: "Compliance", downloads: 3821 },
  { id: "RPT-2026-0141", title: "Annual Debarment List — Suppliers under investigation", org: "PRAZ", date: "05 Jul 2026", type: "Debarment", downloads: 9214 },
  { id: "RPT-2026-0138", title: "Public Spend Report — FY 2025/26 (audited)", org: "MoFED", date: "28 Jun 2026", type: "Financial", downloads: 5104 },
  { id: "RPT-2026-0133", title: "Fraud Detection Bulletin — AI-flagged anomalies", org: "PRAZ / AG", date: "21 Jun 2026", type: "Anti-Corruption", downloads: 2789 },
  { id: "RPT-2026-0128", title: "Vendor Performance Ratings — 2026 Half-Year", org: "PRAZ", date: "14 Jun 2026", type: "Performance", downloads: 4562 },
  { id: "RPT-2026-0121", title: "Auditor-General Report — Ministry procurement review", org: "OAG", date: "31 May 2026", type: "Audit", downloads: 6810 },
];

export default function ReportsComplaintsPage() {
  const [tab, setTab] = useState<"complaint" | "reports" | "track">("complaint");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);

  const [form, setForm] = useState({
    category: CATEGORIES[0],
    tenderRef: "",
    subject: "",
    description: "",
    name: "",
    email: "",
    phone: "",
    anonymous: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `CMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    setSubmitted(ref);
  };

  const filteredReports = PUBLIC_REPORTS.filter(r =>
    !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()) || r.org.toLowerCase().includes(q.toLowerCase())
  );

  const handleTrack = () => {
    if (!trackId.trim()) return;
    setTrackResult({
      id: trackId,
      status: "Under investigation",
      stage: "Assigned to PRAZ Compliance Unit",
      submitted: "08 Jul 2026",
      lastUpdate: "14 Jul 2026",
      notes: "Preliminary review complete. Awaiting supplier response.",
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#0f172a] text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-full grid place-items-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#0f172a]" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Public Accountability</div>
              <div className="text-lg font-bold leading-tight">Reports & Complaints Portal</div>
              <div className="text-xs text-white/60">File a public complaint · Access public reports · Track your case</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 08000-PRAZ</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> complaints@praz.gov.zw</span>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 flex items-center gap-0 text-sm">
          {[
            { k: "complaint" as const, label: "File a Complaint", icon: AlertOctagon },
            { k: "reports"   as const, label: "Public Reports",   icon: FileText },
            { k: "track"     as const, label: "Track a Case",     icon: Search },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex items-center gap-2 px-4 py-2.5 border-r border-white/10 transition-colors ${tab === t.k ? "bg-white text-[#0f172a] font-semibold" : "text-white/70 hover:bg-white/10"}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-12 gap-4">
          {/* Left rail — summary */}
          <aside className="col-span-12 lg:col-span-4 space-y-3">
            <div className="border border-[#1e3a5f]/20 bg-white">
              <div className="bg-[#0f172a] text-white px-3 py-2 text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-400" /> How it works
              </div>
              <ol className="p-4 space-y-2.5 text-sm text-[#0f172a]/80 list-decimal list-inside">
                <li>Submit your complaint — anonymously or with contact details.</li>
                <li>Receive a unique case reference (e.g. <code className="bg-slate-100 px-1">CMP-2026-XXXXX</code>).</li>
                <li>PRAZ Compliance Unit reviews within 5 business days.</li>
                <li>Track status any time from this portal.</li>
                <li>Serious findings are published in the Public Reports tab.</li>
              </ol>
            </div>

            <div className="border border-[#1e3a5f]/20 bg-white">
              <div className="bg-[#0f172a] text-white px-3 py-2 text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" /> Whistleblower protection
              </div>
              <p className="p-4 text-xs text-[#0f172a]/70 leading-relaxed">
                All complaints are confidential. Anonymous submissions are accepted and cannot be traced. Retaliation against
                whistleblowers is a criminal offense under the Public Procurement & Disposal of Public Assets Act.
              </p>
            </div>

            <div className="border border-[#1e3a5f]/20 bg-white">
              <div className="bg-[#0f172a] text-white px-3 py-2 text-sm font-semibold">Related</div>
              <div className="divide-y divide-slate-100 text-sm">
                <Link to="/portal" className="block px-3 py-2 hover:bg-slate-50">Active Tenders</Link>
                <Link to="/supplier-portal" className="block px-3 py-2 hover:bg-slate-50">Supplier Portal</Link>
                <Link to="/applications" className="block px-3 py-2 hover:bg-slate-50">Applications Portal</Link>
                <Link to="/signin" className="block px-3 py-2 hover:bg-slate-50">Officer Sign-in</Link>
              </div>
            </div>
          </aside>

          {/* Main panel */}
          <section className="col-span-12 lg:col-span-8">
            {tab === "complaint" && (
              submitted ? (
                <div className="border border-slate-200 bg-slate-50 p-6">
                  <CheckCircle2 className="w-10 h-10 text-[#0F172A] mb-3" />
                  <div className="text-lg font-bold text-[#0F172A]">Complaint submitted</div>
                  <div className="text-sm text-[#0F172A] mt-1">Your case reference is:</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-[#0f172a] bg-white border border-slate-200 px-4 py-2 inline-block">{submitted}</div>
                  <div className="text-xs text-[#0F172A]/80 mt-3">Save this reference — you'll need it to track your case. A confirmation has been sent to your email if provided.</div>
                  <button onClick={() => { setSubmitted(null); setForm({ ...form, subject: "", description: "" }); }}
                    className="mt-4 bg-[#0f172a] text-white px-4 py-2 text-sm">File another complaint</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="border border-[#1e3a5f]/20 bg-white">
                  <div className="bg-[#0f172a] text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-300" /> File a Procurement Complaint
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Category *</span>
                        <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                          className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Tender / Contract Reference</span>
                        <input value={form.tenderRef} onChange={e => setForm({ ...form, tenderRef: e.target.value })}
                          placeholder="e.g. MOH/ARV/2026-27/FW-001"
                          className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Subject *</span>
                      <input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="Short summary of the issue"
                        className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Detailed description *</span>
                      <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Provide dates, entities involved, and any evidence (attach separately via email if needed)."
                        rows={6}
                        className="mt-1 w-full px-3 py-2 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} />
                      Submit anonymously (no contact details required)
                    </label>

                    {!form.anonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                        <label className="block">
                          <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Full name</span>
                          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Email</span>
                          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-[#0f172a] uppercase tracking-wide">Phone</span>
                          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="mt-1 w-full h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                        </label>
                      </div>
                    )}

                    <button type="submit"
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 appois-glow-on-hover">
                      <Send className="w-4 h-4" /> Submit Complaint
                    </button>
                  </div>
                </form>
              )
            )}

            {tab === "reports" && (
              <div className="border border-[#1e3a5f]/20 bg-white">
                <div className="bg-[#0f172a] text-white px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Public Reports & Bulletins</span>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search reports…"
                      className="h-7 pl-7 pr-2 text-xs bg-white/10 border border-white/20 text-white placeholder-white/40 w-56 focus:outline-none" />
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                    <tr>
                      <th className="text-left px-3 py-2">Reference</th>
                      <th className="text-left px-3 py-2">Title</th>
                      <th className="text-left px-3 py-2">Issuing Body</th>
                      <th className="text-left px-3 py-2">Date</th>
                      <th className="text-left px-3 py-2">Type</th>
                      <th className="text-right px-3 py-2">Downloads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                        <td className="px-3 py-2 text-[#0f172a] font-medium">{r.title}</td>
                        <td className="px-3 py-2 text-slate-600">{r.org}</td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{r.date}</td>
                        <td className="px-3 py-2"><span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5">{r.type}</span></td>
                        <td className="px-3 py-2 text-right text-slate-500">{r.downloads.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "track" && (
              <div className="border border-[#1e3a5f]/20 bg-white">
                <div className="bg-[#0f172a] text-white px-4 py-2.5 text-sm font-semibold flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" /> Track a Complaint
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex gap-2">
                    <input value={trackId} onChange={e => setTrackId(e.target.value)}
                      placeholder="Enter your case reference (e.g. CMP-2026-12345)"
                      className="flex-1 h-10 px-3 text-sm border border-slate-300 focus:border-[#0f172a] focus:outline-none" />
                    <button onClick={handleTrack}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 text-sm font-semibold">Track</button>
                  </div>
                  {trackResult && (
                    <div className="border border-slate-200 p-4 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-lg font-bold text-[#0f172a]">{trackResult.id}</div>
                        <span className="text-xs bg-slate-100 text-[#0F172A] px-2 py-0.5 font-semibold">{trackResult.status}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div><div className="text-xs text-slate-500">Current stage</div><div className="font-medium">{trackResult.stage}</div></div>
                        <div><div className="text-xs text-slate-500">Submitted</div><div className="font-medium">{trackResult.submitted}</div></div>
                        <div><div className="text-xs text-slate-500">Last update</div><div className="font-medium">{trackResult.lastUpdate}</div></div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-sm text-slate-700">{trackResult.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="bg-[#0f172a] text-white/60 text-xs">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} Public Procurement Regulatory Authority (PRAZ)</span>
          <Link to="/" className="hover:text-white">Return to portal</Link>
        </div>
      </footer>
    </div>
  );
}
