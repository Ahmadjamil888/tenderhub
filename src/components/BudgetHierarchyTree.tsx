/**
 * BudgetHierarchyTree.tsx
 *
 * Interactive collapsible org-tree showing the 5-level government budget hierarchy:
 *   All Ministry → Ministry → Department/SOE → Centers Budget → Cell Budget
 *
 * Each node shows: approved / spent / committed / available + progress bar + status badge.
 * Clicking a node expands/collapses its children. Clicking "Detail" opens a side panel.
 */
import { useState, useCallback } from "react";
import {
  ChevronRight, ChevronDown, Building2, Layers, Landmark,
  School, FlaskConical, X, TrendingUp, AlertTriangle,
  Lock, DollarSign, BarChart3,
} from "lucide-react";
import {
  BudgetNode, BudgetLevel, LEVEL_LABELS, MINISTRY_COLORS,
  pctUsed, available, formatK, BUDGET_TREE,
} from "@/lib/budget-hierarchy-data";

// ─── Helpers ──────────────────────────────────────────────────────────────

function levelIcon(level: BudgetLevel, size = 14) {
  const cls = `h-[${size}px] w-[${size}px] flex-shrink-0`;
  switch (level) {
    case "all":        return <Layers        className={cls} />;
    case "ministry":   return <Landmark      className={cls} />;
    case "department": return <Building2     className={cls} />;
    case "center":     return <School        className={cls} />;
    case "cell":       return <FlaskConical  className={cls} />;
  }
}

function statusBadge(s: BudgetNode["status"]) {
  const map: Record<BudgetNode["status"], string> = {
    Active:     "bg-slate-100 text-[#0F172A] border border-slate-200",
    "At Risk":  "bg-slate-100   text-[#0F172A]   border border-slate-200",
    Frozen:     "bg-slate-100    text-[#0F172A]    border border-slate-200",
    "Over Budget": "bg-red-100  text-red-700     border border-red-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${map[s]}`}>{s}</span>
  );
}

function pctBar(pct: number) {
  const color =
    pct >= 100 ? "bg-red-500" :
    pct >= 85  ? "bg-[#0F172A]" :
    pct >= 70  ? "bg-[#0F172A]" :
    "bg-[#0F172A]";
  return (
    <div className="flex items-center gap-1.5 min-w-[72px]">
      <div className="flex-1 h-1.5 rounded-full bg-black/8 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[10px] font-bold text-black/60 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ─── Single Tree Node ─────────────────────────────────────────────────────

const INDENT_PX = 20; // px per level

function TreeNode({
  node,
  depth,
  onSelect,
}: {
  node: BudgetNode;
  depth: number;
  onSelect: (n: BudgetNode) => void;
}) {
  const [open, setOpen] = useState(depth < 2); // auto-expand top 2 levels
  const hasChildren = (node.children?.length ?? 0) > 0;
  const pct = pctUsed(node);
  const mc = MINISTRY_COLORS[node.ministry] ?? MINISTRY_COLORS["all"];

  return (
    <div>
      {/* Row */}
      <div
        className={`
          group flex items-center gap-2 pr-3 py-1.5 cursor-pointer
          border-b border-black/4 hover:bg-black/[0.02] transition-colors
        `}
        style={{ paddingLeft: `${16 + depth * INDENT_PX}px` }}
      >
        {/* Expand / collapse toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`h-4 w-4 flex-shrink-0 grid place-items-center rounded text-black/40 hover:text-black/80 transition-colors ${!hasChildren ? "invisible" : ""}`}
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        {/* Icon + name */}
        <span className={`h-6 w-6 flex-shrink-0 grid place-items-center rounded ${mc.bg} ${mc.text}`}>
          {levelIcon(node.level, 13)}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-black/90 truncate block leading-tight">{node.name}</span>
          <span className="text-[10px] text-black/40">{LEVEL_LABELS[node.level]}</span>
        </div>

        {/* Budget figures — always visible */}
        <div className="flex items-center gap-3">
          <div className="w-24 text-right">
            <div className="text-[10px] text-black/40">Approved</div>
            <div className="text-xs font-semibold text-black">{formatK(node.approved)}</div>
          </div>
          <div className="w-24 text-right">
            <div className="text-[10px] text-black/40">Spent</div>
            <div className="text-xs font-semibold text-[#0F172A]">{formatK(node.spent)}</div>
          </div>
          <div className="w-24 text-right">
            <div className="text-[10px] text-black/40">Available</div>
            <div className="text-xs font-semibold text-[#0F172A]">{formatK(available(node))}</div>
          </div>
          <div className="w-24">{pctBar(pct)}</div>
        </div>

        {/* Status + detail button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusBadge(node.status)}
          <button
            onClick={e => { e.stopPropagation(); onSelect(node); }}
            className="h-6 px-2 text-[10px] rounded border border-black/10 hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            Detail
          </button>
        </div>
      </div>

      {/* Children */}
      {open && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: BudgetNode; onClose: () => void }) {
  const pct = pctUsed(node);
  const avail = available(node);
  const mc = MINISTRY_COLORS[node.ministry] ?? MINISTRY_COLORS["all"];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b border-black/8 ${mc.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${mc.text}`}>
                {LEVEL_LABELS[node.level]}
              </div>
              <h2 className="text-base font-bold text-black leading-tight">{node.name}</h2>
            </div>
            <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-black/10 flex-shrink-0">
              <X className="h-4 w-4 text-black/60" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {statusBadge(node.status)}
            <span className="text-[10px] text-black/50 font-mono">{node.id}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {[
            { label: "Approved Budget", value: formatK(node.approved), icon: DollarSign,   color: "text-black" },
            { label: "Spent",           value: formatK(node.spent),    icon: TrendingUp,   color: "text-[#0F172A]" },
            { label: "Committed",       value: formatK(node.committed),icon: Lock,          color: "text-[#0F172A]" },
            { label: "Available",       value: formatK(avail),         icon: BarChart3,    color: "text-[#0F172A]" },
          ].map(k => (
            <div key={k.label} className="border border-black/8 rounded-xl p-3 flex items-start gap-2.5">
              <div className={`h-8 w-8 grid place-items-center rounded-lg bg-black/4 ${k.color}`}>
                <k.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-black/40 mb-0.5">{k.label}</div>
                <div className={`text-sm font-bold ${k.color}`}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="px-5 pb-4">
          <div className="border border-black/8 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-black/60">Budget Utilisation</span>
              <span className={`text-sm font-bold ${pct >= 100 ? "text-red-600" : pct >= 85 ? "text-[#0F172A]" : "text-black"}`}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-black/6 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            {pct >= 85 && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#0F172A] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {pct >= 100 ? "Budget exhausted — no available funds." : "Budget utilisation above 85% — approaching limit."}
              </div>
            )}
          </div>
        </div>

        {/* Children list */}
        {(node.children?.length ?? 0) > 0 && (
          <div className="px-5 pb-5">
            <div className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">
              Sub-entities ({node.children!.length})
            </div>
            <div className="border border-black/8 rounded-xl divide-y divide-black/5 overflow-hidden">
              {node.children!.map(child => (
                <div key={child.id} className="px-3 py-2.5 flex items-center gap-2.5">
                  <span className={`h-5 w-5 grid place-items-center rounded text-[11px] ${MINISTRY_COLORS[child.ministry]?.bg ?? "bg-gray-50"} ${MINISTRY_COLORS[child.ministry]?.text ?? "text-gray-700"}`}>
                    {levelIcon(child.level, 11)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-black truncate">{child.name}</div>
                    <div className="text-[10px] text-black/40">{formatK(child.approved)} approved</div>
                  </div>
                  {statusBadge(child.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto px-5 py-4 border-t border-black/8 flex gap-2">
          <button className="flex-1 h-9 rounded-lg bg-black text-white text-xs font-semibold hover:bg-black/80 transition-colors">
            Allocate Budget
          </button>
          <button className="flex-1 h-9 rounded-lg border border-black/10 text-xs font-semibold hover:bg-black/4 transition-colors">
            Transfer Funds
          </button>
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-black/10 text-xs hover:bg-black/4 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Level Legend ─────────────────────────────────────────────────────────

function LevelLegend() {
  const levels: BudgetLevel[] = ["all", "ministry", "department", "center", "cell"];
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-b border-black/6 bg-gray-50/60">
      {levels.map((lv, i) => (
        <div key={lv} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-black/20" />}
          <span className={`h-5 w-5 grid place-items-center rounded ${MINISTRY_COLORS["all"].bg} text-black/60`}>
            {levelIcon(lv, 11)}
          </span>
          <span className="text-[11px] text-black/60 font-medium">{LEVEL_LABELS[lv]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────

export default function BudgetHierarchyTree() {
  const [selected, setSelected] = useState<BudgetNode | null>(null);

  const handleSelect = useCallback((n: BudgetNode) => setSelected(n), []);

  return (
    <div className="border border-black/8 rounded-2xl overflow-hidden bg-white overflow-x-auto">
      {/* Column headers */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white">
        <div className="flex-1 text-xs font-semibold uppercase tracking-wider">Budget Entity / Hierarchy</div>
        <div className="flex items-center gap-3">
          {["Approved", "Spent", "Available", "Utilisation"].map(h => (
            <div key={h} className="w-24 text-right text-[10px] text-white/60 font-medium uppercase tracking-wider">{h}</div>
          ))}
        </div>
        <div className="w-28 text-right text-[10px] text-white/60 font-medium uppercase tracking-wider">Status</div>
      </div>

      {/* Level legend */}
      <div className="min-w-[700px]">
      <LevelLegend />

      {/* Tree */}
      <div className="divide-y divide-transparent">
        {BUDGET_TREE.map(root => (
          <TreeNode key={root.id} node={root} depth={0} onSelect={handleSelect} />
        ))}
      </div>
      </div>

      {/* Detail panel */}
      {selected && <DetailPanel node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
