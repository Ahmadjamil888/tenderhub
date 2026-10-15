/**
 * ZimbabweMapTab — full-province-border choropleth map with district drill-down.
 * Renders real polygon boundaries for all 10 Zimbabwe provinces using Leaflet.
 * Shows per-province and per-district: Tenders, Projects, Spend, Dev Cost.
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  ZW_PROVINCES, spendIntensity, choroColor, devCostColor,
  type ZWProvince, type ZWDistrict,
} from "@/lib/zw-provinces-geo";
import { ALL_GIS_PINS } from "@/lib/gis-data";
import {
  MapPin, BarChart3, PieChart as PieIcon, Activity,
  Layers, Target, DollarSign, Building2, X,
} from "lucide-react";

const COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#14B8A6","#F97316","#EC4899","#06B6D4","#6366F1"];
const tt = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 } };

type MapMode = "spend" | "heat" | "pins" | "compliance" | "devCost";

interface Props {
  theme?: "dark" | "light";
}

export default function ZimbabweMapTab({ theme = "light" }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    borders?: L.LayerGroup;
    labels?: L.LayerGroup;
    districts?: L.LayerGroup;
    pins?: L.LayerGroup;
    boundary?: L.LayerGroup;
  }>({});
  const [mode, setMode] = useState<MapMode>("spend");
  const [selected, setSelected] = useState<ZWProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<ZWDistrict | null>(null);
  const [chartView, setChartView] = useState<"bar" | "pie" | "radar">("bar");
  const [showDistricts, setShowDistricts] = useState(true);
  const isDark = theme === "dark";

  const cardBg   = isDark ? "bg-[#0f172a] border-white/8 text-white" : "bg-white border-black/8 text-black";
  const subText  = isDark ? "text-white/50" : "text-black/50";
  const panelBg  = isDark ? "bg-[#161a21]" : "bg-white";
  const divider  = isDark ? "border-white/8" : "border-black/6";

  // ── Init Leaflet ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-19.2, 29.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });
    // Satellite basemap
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 18 }
    ).addTo(map);
    // Street label overlay (semi-transparent)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { opacity: 0.45, maxZoom: 18 }
    ).addTo(map);
    mapRef.current = map;
    layersRef.current.boundary = L.layerGroup().addTo(map);
    layersRef.current.borders  = L.layerGroup().addTo(map);
    layersRef.current.districts= L.layerGroup().addTo(map);
    layersRef.current.labels   = L.layerGroup().addTo(map);
    layersRef.current.pins     = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Helper: get fill color for current mode ──────────────────────
  function getFill(p: ZWProvince): string {
    if (mode === "compliance") {
      const t = p.compliance / 100;
      return `hsl(${Math.round(120 * t)}, 60%, 42%)`;
    }
    if (mode === "devCost") return devCostColor(p);
    if (mode === "heat")    return "#DC2626";
    return choroColor(spendIntensity(p));
  }
  function getFillOpacity(p: ZWProvince): number {
    if (mode === "heat") return 0.15 + spendIntensity(p) * 0.45;
    return 0.45 + spendIntensity(p) * 0.35;
  }

  // ── Redraw province polygons ─────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    layersRef.current.borders?.clearLayers();
    layersRef.current.labels?.clearLayers();
    layersRef.current.districts?.clearLayers();
    layersRef.current.pins?.clearLayers();

    if (mode !== "pins") {
      ZW_PROVINCES.forEach(p => {
        // Convert [lng, lat] polygon to Leaflet [lat, lng]
        const latlngs = p.polygon.map(([lng, lat]) => [lat, lng] as [number, number]);
        const isSelected = selected?.id === p.id;
        const fillColor = getFill(p);
        const poly = L.polygon(latlngs, {
          fillColor,
          fillOpacity: isSelected ? 0.75 : getFillOpacity(p),
          color: isSelected ? "#facc15" : "#ffffff",
          weight: isSelected ? 3 : 1.5,
          opacity: isSelected ? 1 : 0.85,
        });
        poly.bindTooltip(
          `<div style="font-weight:700;font-size:13px;margin-bottom:4px;">${p.name}</div>` +
          `<div style="font-size:11px;line-height:1.7;">` +
          `💰 Spend: <b>USD ${p.tenderSpendM}M</b><br/>` +
          `📋 Tenders: <b>${p.activeTenders}</b><br/>` +
          `🏗 Projects: <b>${p.activeProjects}</b><br/>` +
          `🏦 Dev Cost: <b>USD ${p.developmentCostM}M</b><br/>` +
          `✅ Compliance: <b>${p.compliance}%</b>` +
          `</div>`,
          { sticky: true, className: "zw-tooltip" }
        );
        poly.on("click", () => { setSelected(p); setSelectedDistrict(null); });
        poly.on("mouseover", () => { poly.setStyle({ weight: 2.5, fillOpacity: Math.min(0.9, getFillOpacity(p) + 0.15) }); });
        poly.on("mouseout",  () => {
          if (selected?.id !== p.id) poly.setStyle({ weight: 1.5, fillOpacity: getFillOpacity(p) });
        });
        poly.addTo(layersRef.current.borders!);

        // Province label at centroid
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            html: `<div style="
              font-size:10px;font-weight:800;color:#fff;
              text-shadow:0 0 4px #000,0 0 8px #000;
              white-space:nowrap;letter-spacing:0.03em;
              pointer-events:none;">${p.name.toUpperCase()}</div>`,
            className: "", iconAnchor: [40, 6],
          }),
          interactive: false,
        }).addTo(layersRef.current.labels!);
      });
    }

    // District markers
    if (showDistricts && mode !== "pins") {
      ZW_PROVINCES.forEach(p => {
        p.districts.forEach(d => {
          const dot = L.circleMarker([d.lat, d.lng], {
            radius: 5, fillColor: "#fbbf24", fillOpacity: 0.9,
            color: "#0f172a", weight: 1.5,
          });
          dot.bindTooltip(
            `<b>${d.name}</b> (${p.name})<br/>` +
            `Spend: <b>USD ${d.tenderSpendM}M</b> · ` +
            `Tenders: <b>${d.activeTenders}</b> · ` +
            `Dev: <b>USD ${d.developmentCostM}M</b>`,
            { sticky: true }
          );
          dot.on("click", (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            setSelected(p);
            setSelectedDistrict(d);
          });
          dot.addTo(layersRef.current.districts!);
        });
      });
    }

    // Pins mode
    if (mode === "pins") {
      ALL_GIS_PINS.forEach(pin => {
        const clr = pin.tone === "green" ? "#475569" : pin.tone === "red" ? "#dc2626"
          : pin.tone === "amber" ? "#64748B" : pin.tone === "violet" ? "#334155" : "#0F172A";
        const icon = L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="20" height="26">
            <circle cx="12" cy="10" r="7" fill="${clr}" stroke="white" stroke-width="1.5"/>
            <path d="M12 28 L12 17" stroke="${clr}" stroke-width="2"/>
          </svg>`,
          className: "", iconSize: [20, 26], iconAnchor: [10, 26],
        });
        L.marker([pin.lat, pin.lng], { icon })
          .bindTooltip(`<b>${pin.id}</b><br/>${pin.title}<br/><i>${pin.status}</i>`, { sticky: true })
          .addTo(layersRef.current.pins!);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selected, showDistricts]);

  // ── Fly to selected province ─────────────────────────────────────
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.flyTo([selected.lat, selected.lng], 8, { animate: true, duration: 0.8 });
    }
  }, [selected]);

  const sorted = [...ZW_PROVINCES].sort((a, b) => b.tenderSpendM - a.tenderSpendM);

  return (
    <div className={`rounded-2xl border overflow-hidden flex flex-col ${cardBg}`}>
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b flex-wrap ${isDark ? `border-white/8 bg-white/3` : `border-black/6 bg-gray-50`}`}>
        <div className="flex items-center gap-1.5">
          <MapPin className={`h-4 w-4 ${isDark ? "text-[#2563eb]" : "text-[#0F172A]"}`} />
          <span className={`text-sm font-bold ${isDark ? "text-white" : "text-black"}`}>
            Zimbabwe Procurement Map
          </span>
          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-slate-200/40 text-slate-400" : "border-slate-200 text-[#0F172A]"}`}>
            Province Borders · Districts · Live Data
          </span>
        </div>
        <div className="flex gap-1 ml-auto flex-wrap">
          {([
            { key: "spend",      label: "Spend",       icon: BarChart3   },
            { key: "devCost",    label: "Dev Cost",     icon: Building2   },
            { key: "compliance", label: "Compliance",   icon: Target      },
            { key: "heat",       label: "Heat",         icon: Activity    },
            { key: "pins",       label: "Pins",         icon: MapPin      },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setMode(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mode === key
                  ? isDark ? "bg-[#2563eb] text-white" : "bg-[#0F172A] text-white"
                  : isDark ? "bg-white/8 text-white/70 hover:bg-white/15" : "bg-white border border-black/10 text-black/60 hover:bg-gray-100"
              }`}>
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
          <button onClick={() => setShowDistricts(v => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ml-1 ${
              showDistricts
                ? isDark ? "bg-[#0F172A]/20 text-slate-400 border border-slate-200/30" : "bg-slate-50 text-[#0F172A] border border-slate-200"
                : isDark ? "bg-white/8 text-white/50" : "bg-white border border-black/10 text-black/40"
            }`}>
            <Layers className="h-3 w-3" /> Districts
          </button>
        </div>
      </div>

      {/* ── Map + Side panel ───────────────────────────────────────── */}
      <div className="flex" style={{ minHeight: 520 }}>
        <div className="flex-1 min-w-0 relative" style={{ minHeight: 520 }}>
          <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 520 }} />
          {/* Map legend overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px] text-white space-y-1 pointer-events-none">
            <div className="font-bold uppercase tracking-wider mb-1 text-white/70">
              {mode === "spend" ? "Tender Spend" : mode === "devCost" ? "Dev Cost" : mode === "compliance" ? "Compliance" : mode === "heat" ? "Activity" : "Legend"}
            </div>
            {(mode === "spend" || mode === "devCost") && (
              <>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[rgb(10,60,180)]"/> High</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[rgb(100,170,220)]"/> Medium</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[rgb(173,200,230)]"/> Low</div>
              </>
            )}
            {mode === "compliance" && (
              <>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[hsl(120,60%,42%)]"/> ≥90%</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[hsl(60,60%,42%)]"/> 75–89%</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-[hsl(0,60%,42%)]"/> &lt;75%</div>
              </>
            )}
            <div className="flex items-center gap-1.5 mt-1 border-t border-white/20 pt-1">
              <span className="w-3 h-3 rounded-full inline-block bg-slate-200"/> District capital
            </div>
            <div className="flex items-center gap-1.5 text-white/60">White border = Province boundary</div>
          </div>
        </div>

        {/* ── Province / District Detail Panel ─────────────────────── */}
        {selected && (
          <div className={`w-80 flex-shrink-0 border-l overflow-y-auto flex flex-col ${panelBg} ${isDark ? "border-white/8" : "border-black/8"}`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10 ${panelBg} ${divider}`}>
              <div>
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-black"}`}>{selected.name}</span>
                <div className={`text-[10px] mt-0.5 ${subText}`}>Capital: {selected.capital} · Pop: {selected.population.toLocaleString()}</div>
              </div>
              <button onClick={() => { setSelected(null); setSelectedDistrict(null); }}
                className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-white/10 text-white/60" : "bg-black/5 text-black/50"}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* District selected indicator */}
            {selectedDistrict && (
              <div className={`px-4 py-2 border-b text-[11px] font-semibold flex items-center justify-between ${isDark ? "bg-slate-200/10 border-slate-200/20 text-slate-400" : "bg-slate-50 border-slate-200 text-[#0F172A]"}`}>
                <span>📍 {selectedDistrict.name} District</span>
                <button onClick={() => setSelectedDistrict(null)} className="opacity-60 hover:opacity-100">✕</button>
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2 p-3">
              {(selectedDistrict ? [
                { label: "District Spend",  value: `USD ${selectedDistrict.tenderSpendM}M`,  icon: DollarSign },
                { label: "Tenders",         value: selectedDistrict.activeTenders,             icon: BarChart3  },
                { label: "Projects",        value: selectedDistrict.activeProjects,             icon: Building2  },
                { label: "Dev Cost",        value: `USD ${selectedDistrict.developmentCostM}M`,icon: Target     },
              ] : [
                { label: "Tender Spend",    value: `USD ${selected.tenderSpendM}M`,  icon: DollarSign },
                { label: "Active Tenders",  value: selected.activeTenders,            icon: BarChart3  },
                { label: "Active Projects", value: selected.activeProjects,           icon: Building2  },
                { label: "Dev Cost",        value: `USD ${selected.developmentCostM}M`, icon: Target  },
                { label: "Awarded",         value: `USD ${selected.awardedM}M`,       icon: DollarSign },
                { label: "Compliance",      value: `${selected.compliance}%`,          icon: Target     },
              ]).map(kpi => (
                <div key={kpi.label} className={`rounded-xl p-2.5 flex items-start gap-2 ${isDark ? "bg-white/5" : "bg-gray-50 border border-black/5"}`}>
                  <kpi.icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${isDark ? "text-[#2563eb]" : "text-[#0F172A]"}`} />
                  <div>
                    <div className={`text-[9px] uppercase tracking-wide ${subText}`}>{kpi.label}</div>
                    <div className={`text-sm font-bold mt-0.5 ${isDark ? "text-[#2563eb]" : "text-[#0F172A]"}`}>{kpi.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart switcher */}
            {!selectedDistrict && (
              <>
                <div className="flex gap-1 px-3 pb-2">
                  {([["bar","Bar",BarChart3],["pie","Pie",PieIcon],["radar","Radar",Layers]] as const).map(([v, lbl, Icon]) => (
                    <button key={v} onClick={() => setChartView(v)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                        chartView === v
                          ? isDark ? "bg-[#2563eb] text-white" : "bg-[#0F172A] text-white"
                          : isDark ? "bg-white/8 text-white/60" : "bg-gray-100 text-black/50"
                      }`}>
                      <Icon className="h-3 w-3" />{lbl}
                    </button>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  {chartView === "bar" && (
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: "Spend",   value: selected.tenderSpendM  },
                          { name: "Awarded", value: selected.awardedM      },
                          { name: "DevCost", value: selected.developmentCostM },
                          { name: "Tenders", value: selected.activeTenders },
                          { name: "Proj.",   value: selected.activeProjects },
                        ]} margin={{ left: -20 }}>
                          <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} stroke={isDark?"#ffffff60":"#00000060"} />
                          <YAxis fontSize={9} tickLine={false} axisLine={false} stroke={isDark?"#ffffff60":"#00000060"} />
                          <Tooltip {...tt} />
                          <Bar dataKey="value" radius={[3,3,0,0]}>
                            {["#0F172A","#475569","#64748B","#334155","#334155"].map((c,i) => <Cell key={i} fill={c} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {chartView === "pie" && (
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[
                            { name: "Awarded",  value: selected.awardedM },
                            { name: "Dev Cost", value: selected.developmentCostM },
                            { name: "Pending",  value: selected.tenderSpendM - selected.awardedM },
                          ]} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={3}>
                            <Cell fill="#3B82F6"/><Cell fill="#10B981"/><Cell fill={isDark?"#ffffff20":"#e2e8f0"}/>
                          </Pie>
                          <Tooltip {...tt} formatter={(v: number) => [`USD ${v}M`]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className={`text-center text-[10px] ${subText}`}>Awarded / Dev Cost / Pending</div>
                    </div>
                  )}
                  {chartView === "radar" && (
                    <div className="h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={[
                          { axis: "Spend",      value: Math.round(spendIntensity(selected) * 100) },
                          { axis: "Compliance", value: selected.compliance                         },
                          { axis: "Tenders",    value: Math.min(100, selected.activeTenders * 2)   },
                          { axis: "Projects",   value: Math.min(100, selected.activeProjects * 4)  },
                          { axis: "DevCost",    value: Math.round(selected.developmentCostM / 1.45) },
                        ]}>
                          <PolarGrid stroke={isDark?"#ffffff15":"#00000010"} />
                          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: isDark?"#ffffff80":"#00000080" }} />
                          <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Districts list */}
            <div className={`border-t ${divider}`}>
              <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${subText}`}>
                Districts ({selected.districts.length})
              </div>
              <div className="space-y-0 px-2 pb-3">
                {selected.districts.map(d => {
                  const isActive = selectedDistrict?.id === d.id;
                  return (
                    <div key={d.id}
                      onClick={() => setSelectedDistrict(isActive ? null : d)}
                      className={`rounded-lg p-2.5 cursor-pointer transition-colors mb-1 ${
                        isActive
                          ? isDark ? "bg-slate-200/15 border border-slate-200/30" : "bg-slate-50 border border-slate-200"
                          : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}>
                      <div className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{d.name}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[10px] ${isDark ? "text-[#2563eb]" : "text-[#0F172A]"} font-mono`}>USD {d.tenderSpendM}M</span>
                        <span className={`text-[10px] ${subText}`}>{d.activeTenders} tenders</span>
                        <span className={`text-[10px] ${subText}`}>{d.activeProjects} projects</span>
                        <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-[#0F172A]"}`}>Dev: USD {d.developmentCostM}M</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Province rankings table ────────────────────────────────── */}
      <div className={`border-t ${divider}`}>
        <div className={`px-4 py-2 flex items-center justify-between ${isDark ? "bg-white/3" : "bg-gray-50"}`}>
          <span className={`text-xs font-bold uppercase tracking-wide ${subText}`}>
            Province Rankings — Click to Focus Map
          </span>
          <span className={`text-[10px] ${subText}`}>
            {ZW_PROVINCES.reduce((s,p) => s + p.districts.length, 0)} districts total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={isDark ? "border-b border-white/8 text-white/40" : "border-b border-black/6 text-black/40"}>
                {["#","Province","Spend (M)","Dev Cost","Tenders","Projects","Compliance",""].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const barW = Math.round((p.tenderSpendM / sorted[0].tenderSpendM) * 100);
                const isSelected = selected?.id === p.id;
                return (
                  <tr key={p.id} onClick={() => { setSelected(p); setSelectedDistrict(null); }}
                    className={`cursor-pointer border-b transition-colors ${
                      isDark
                        ? isSelected ? "bg-[#2563eb]/15 border-white/8" : "border-white/5 hover:bg-white/5"
                        : isSelected ? "bg-slate-50 border-black/6" : "border-black/4 hover:bg-gray-50"
                    }`}>
                    <td className={`px-3 py-2 font-bold ${i < 3 ? "text-[#2563eb]" : isDark ? "text-white/30" : "text-black/30"}`}>{i+1}</td>
                    <td className={`px-3 py-2 font-semibold ${isDark ? "text-white" : "text-black"}`}>{p.name}</td>
                    <td className={`px-3 py-2 font-bold tabular-nums ${isDark ? "text-[#2563eb]" : "text-[#0F172A]"}`}>USD {p.tenderSpendM}M</td>
                    <td className={`px-3 py-2 tabular-nums ${isDark ? "text-slate-500" : "text-[#0F172A]"}`}>USD {p.developmentCostM}M</td>
                    <td className={`px-3 py-2 ${isDark ? "text-white/70" : "text-black/70"}`}>{p.activeTenders}</td>
                    <td className={`px-3 py-2 ${isDark ? "text-white/70" : "text-black/70"}`}>{p.activeProjects}</td>
                    <td className={`px-3 py-2 font-semibold ${p.compliance >= 90 ? "text-slate-600" : p.compliance >= 80 ? "text-slate-600" : "text-red-500"}`}>
                      {p.compliance}%
                    </td>
                    <td className="px-3 py-2 w-24">
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
                        <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${barW}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom summary charts ─────────────────────────────────── */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-t ${divider}`}>
        <div className={`rounded-xl p-3 border ${isDark ? "bg-white/3 border-white/8" : "bg-gray-50 border-black/6"}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${subText}`}>Tender Spend by Province (USD M)</div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} margin={{ left: -20 }}>
                <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false}
                  stroke={isDark?"#ffffff50":"#00000050"} tickFormatter={n => n.split(" ")[0].substring(0,6)} />
                <YAxis fontSize={8} tickLine={false} axisLine={false} stroke={isDark?"#ffffff50":"#00000050"} />
                <Tooltip {...tt} formatter={(v: number) => [`USD ${v}M`, "Spend"]} />
                <Bar dataKey="tenderSpendM" radius={[3,3,0,0]}>
                  {sorted.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl p-3 border ${isDark ? "bg-white/3 border-white/8" : "bg-gray-50 border-black/6"}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${subText}`}>Development Cost by Province (USD M)</div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} margin={{ left: -20 }}>
                <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false}
                  stroke={isDark?"#ffffff50":"#00000050"} tickFormatter={n => n.split(" ")[0].substring(0,6)} />
                <YAxis fontSize={8} tickLine={false} axisLine={false} stroke={isDark?"#ffffff50":"#00000050"} />
                <Tooltip {...tt} formatter={(v: number) => [`USD ${v}M`, "Dev Cost"]} />
                <Bar dataKey="developmentCostM" radius={[3,3,0,0]}>
                  {sorted.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-xl p-3 border ${isDark ? "bg-white/3 border-white/8" : "bg-gray-50 border-black/6"}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${subText}`}>Compliance Score by Province</div>
          <div className="space-y-1.5">
            {sorted.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className={`text-[9px] w-20 truncate ${isDark?"text-white/60":"text-black/60"}`}>{p.name.split(" ")[0]}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark?"bg-white/10":"bg-gray-200"}`}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${p.compliance}%`,
                    background: p.compliance >= 90 ? "#475569" : p.compliance >= 80 ? "#64748B" : "#DC2626",
                  }} />
                </div>
                <span className={`text-[9px] font-bold w-8 text-right ${
                  p.compliance >= 90 ? "text-slate-600" : p.compliance >= 80 ? "text-slate-600" : "text-red-500"
                }`}>{p.compliance}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
