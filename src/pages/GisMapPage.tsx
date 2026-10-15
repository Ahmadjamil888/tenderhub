import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { AppShell, PageHeader , PageContextBar } from "@/components/AppShell";
import { ALL_GIS_PINS } from "@/lib/gis-data";
import { ZW_PROVINCES, spendIntensity, choroColor, TOTAL_SPEND_M, type ZWProvince } from "@/lib/zw-provinces-geo";
import { useAuth } from "@/lib/auth-context";
import {
  MapPin, ArrowLeft, Layers, BarChart2, PieChart as PieIcon,
  Thermometer, Circle, X, TrendingUp, DollarSign,
  FileText, Briefcase, ChevronRight, Info,
  Navigation, Activity,
} from "lucide-react";
import type { GisPin } from "@/components/GisMapView";

// ── Fix Leaflet icon paths ─────────────────────────────────────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// @ts-expect-error – internal
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// ── Chart colours ─────────────────────────────────────────────────────────
const CHART_COLORS = ["#0F172A","#334155","#334155","#64748B","#475569","#DC2626","#06b6d4","#f97316","#84cc16","#ec4899"];

type MapMode = "pins" | "choropleth" | "heat" | "circles";
type ChartView = "bar" | "pie" | "none";

// ── Province tooltip popup helper ─────────────────────────────────────────
function provincePopupHtml(p: ZWProvince) {
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;font-size:13px;">
      <div style="font-weight:800;font-size:15px;margin-bottom:8px;color:#0f172a;">${p.name}</div>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Capital</td><td style="font-weight:600;">${p.capital}</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Tender Spend</td><td style="font-weight:700;color:#2563eb;">USD ${p.tenderSpendM}M</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Active Tenders</td><td style="font-weight:600;">${p.activeTenders}</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Projects</td><td style="font-weight:600;">${p.activeProjects}</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Awarded</td><td style="font-weight:600;">USD ${p.awardedM}M</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Compliance</td><td style="font-weight:600;">${p.compliance}%</td></tr>
        <tr><td style="color:#64748b;padding:2px 10px 2px 0;">Population</td><td style="font-weight:600;">${p.population.toLocaleString()}</td></tr>
      </table>
    </div>`;
}

// ── Main Map Component ────────────────────────────────────────────────────
function ZimbabweMap({ onPinClick }: { onPinClick?: (pin: GisPin) => void }) {
  const mapRef     = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef  = useRef<L.Layer[]>([]);
  const [mode, setMode]         = useState<MapMode>("pins");
  const [basemap, setBasemap]   = useState<"street" | "satellite">("street");
  const [selected, setSelected] = useState<ZWProvince | null>(null);
  const [selectedPin, setSelectedPin] = useState<GisPin | null>(null);
  const [chartView, setChartView] = useState<ChartView>("bar");
  const tileRef = useRef<L.TileLayer | null>(null);

  // ── Init map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-19.0, 29.8], zoom: 6, zoomControl: true,
    });
    mapRef.current = map;
    tileRef.current = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
    ).addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Swap basemap ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    tileRef.current.remove();
    tileRef.current = L.tileLayer(
      basemap === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: basemap === "satellite" ? "Tiles © Esri" : "© OpenStreetMap", maxZoom: 19 }
    ).addTo(mapRef.current);
  }, [basemap]);

  // ── Clear all overlay layers ─────────────────────────────────────────
  const clearLayers = useCallback(() => {
    if (!mapRef.current) return;
    layersRef.current.forEach(l => { try { mapRef.current!.removeLayer(l); } catch {} });
    layersRef.current = [];
  }, []);

  // ── Render layers based on mode ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    clearLayers();

    if (mode === "pins") {
      // Standard tender/project pins
      ALL_GIS_PINS.forEach(pin => {
        const color = pin.tone === "green" ? "#475569" : pin.tone === "red" ? "#dc2626"
          : pin.tone === "amber" ? "#64748B" : pin.tone === "violet" ? "#334155" : "#0F172A";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="34">
          <circle cx="12" cy="9" r="6" fill="${color}" stroke="white" stroke-width="1.5"/>
          <path d="M12 22 L12 15" stroke="${color}" stroke-width="2"/>
        </svg>`;
        const icon = L.divIcon({ html: svg, className: "", iconSize: [26, 34], iconAnchor: [13, 34] });
        const marker = L.marker([pin.lat, pin.lng], { icon });
        marker.bindPopup(`<b>${pin.id}</b><br/>${pin.title}<br/><small>${pin.status} · ${pin.value ?? ""}</small>`, { maxWidth: 260 });
        marker.on("click", () => setSelectedPin(pin));
        marker.addTo(map);
        layersRef.current.push(marker);
      });
    }

    if (mode === "choropleth" || mode === "heat" || mode === "circles") {
      ZW_PROVINCES.forEach((prov, i) => {
        const intensity = spendIntensity(prov);

        if (mode === "choropleth") {
          // Filled circle approximating province area — NO border lines
          const circle = L.circle([prov.lat, prov.lng], {
            radius: prov.radiusKm * 1000,
            fillColor: choroColor(intensity),
            fillOpacity: 0.72,
            color: "transparent",
            weight: 0,
          });
          circle.bindPopup(provincePopupHtml(prov), { maxWidth: 260 });
          circle.on("click", () => setSelected(prov));
          circle.addTo(map);
          layersRef.current.push(circle);

          // Province label
          const label = L.divIcon({
            html: `<div style="font-size:11px;font-weight:700;color:#fff;text-shadow:0 1px 3px #0008;white-space:nowrap;text-align:center;">${prov.name}<br/><span style="font-size:10px;font-weight:400">USD ${prov.tenderSpendM}M</span></div>`,
            className: "", iconSize: [120, 32], iconAnchor: [60, 16],
          });
          const lm = L.marker([prov.lat, prov.lng], { icon: label, interactive: false });
          lm.addTo(map);
          layersRef.current.push(lm);
        }

        if (mode === "heat") {
          // Heat rings — multiple concentric circles
          [1.0, 0.7, 0.4].forEach((scale, ri) => {
            const ring = L.circle([prov.lat, prov.lng], {
              radius: prov.radiusKm * 1000 * scale,
              fillColor: `hsl(${180 - intensity * 180}, 90%, ${50 - ri * 10}%)`,
              fillOpacity: 0.25 + ri * 0.1,
              color: "transparent",
              weight: 0,
            });
            ring.addTo(map);
            layersRef.current.push(ring);
          });
          // Center dot
          const dot = L.circleMarker([prov.lat, prov.lng], {
            radius: 6 + intensity * 10,
            fillColor: `hsl(${180 - intensity * 180}, 90%, 45%)`,
            fillOpacity: 0.9,
            color: "#0f172a",
            weight: 1.5,
          });
          dot.bindPopup(provincePopupHtml(prov), { maxWidth: 260 });
          dot.on("click", () => setSelected(prov));
          dot.addTo(map);
          layersRef.current.push(dot);
        }

        if (mode === "circles") {
          // Proportional circles — radius proportional to spend — NO border
          const circle = L.circle([prov.lat, prov.lng], {
            radius: 20000 + intensity * 80000,
            fillColor: CHART_COLORS[i % CHART_COLORS.length],
            fillOpacity: 0.6,
            color: "transparent",
            weight: 0,
          });
          circle.bindPopup(provincePopupHtml(prov), { maxWidth: 260 });
          circle.on("click", () => setSelected(prov));
          circle.addTo(map);
          layersRef.current.push(circle);

          // Value label inside circle
          const valLabel = L.divIcon({
            html: `<div style="font-size:10px;font-weight:800;color:#fff;text-shadow:0 1px 3px #0009;text-align:center;line-height:1.2;">${prov.name.split(" ")[0]}<br/>$${prov.tenderSpendM}M</div>`,
            className: "", iconSize: [80, 28], iconAnchor: [40, 14],
          });
          const lm = L.marker([prov.lat, prov.lng], { icon: valLabel, interactive: false });
          lm.addTo(map);
          layersRef.current.push(lm);
        }
      });
    }
  }, [mode, clearLayers]);

  // ── Chart data ───────────────────────────────────────────────────────
  const barData = ZW_PROVINCES.map(p => ({
    name: p.name.replace("Mashonaland ","Mash.").replace("Matabeleland ","Mat."),
    spend: p.tenderSpendM,
    awarded: p.awardedM,
    tenders: p.activeTenders,
  }));

  const pieData = ZW_PROVINCES.map(p => ({
    name: p.name.split(" ")[0],
    value: p.tenderSpendM,
  }));

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] border-b border-white/8 flex-wrap flex-shrink-0 z-10">

        {/* Mode selector */}
        <div className="flex items-center bg-white/8 rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
          {([
            ["pins",       <MapPin className="h-3.5 w-3.5" />,       "Pins"],
            ["choropleth", <Layers className="h-3.5 w-3.5" />,       "Choropleth"],
            ["heat",       <Thermometer className="h-3.5 w-3.5" />,  "Heat Map"],
            ["circles",    <Circle className="h-3.5 w-3.5" />,       "Circles"],
          ] as [MapMode, React.ReactNode, string][]).map(([m, icon, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${mode === m ? "bg-[#2563eb] text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Basemap */}
        <div className="flex items-center bg-white/8 rounded-lg overflow-hidden border border-white/10 text-xs font-medium">
          {(["street","satellite"] as const).map(b => (
            <button key={b} onClick={() => setBasemap(b)}
              className={`px-3 py-2 capitalize transition-colors ${basemap === b ? "bg-[#2563eb] text-white" : "text-white/50 hover:text-white"}`}>
              {b}
            </button>
          ))}
        </div>

        {/* Chart toggle */}
        <div className="flex items-center bg-white/8 rounded-lg overflow-hidden border border-white/10 text-xs font-medium ml-auto">
          {([
            ["none","none", "Map Only"],
            ["bar", "bar",  "Bar Chart"],
            ["pie", "pie",  "Pie Chart"],
          ] as [ChartView, string, string][]).map(([v,,label]) => (
            <button key={v} onClick={() => setChartView(v)}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${chartView === v ? "bg-[#2563eb] text-white" : "text-white/50 hover:text-white"}`}>
              {v === "bar" && <BarChart2 className="h-3.5 w-3.5" />}
              {v === "pie" && <PieIcon className="h-3.5 w-3.5" />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map + Side panels row ─────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Map */}
        <div ref={containerRef} className="flex-1 min-w-0 z-0" />

        {/* Province detail panel */}
        {selected && (
          <div className="w-72 flex-shrink-0 bg-[#0f172a] border-l border-white/8 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 sticky top-0 bg-[#0f172a]">
              <span className="font-semibold text-sm text-white">{selected.name}</span>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {/* KPI chips */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tender Spend", value: `USD ${selected.tenderSpendM}M`, color: "text-[#2563eb]" },
                  { label: "Awarded",      value: `USD ${selected.awardedM}M`,     color: "text-slate-500" },
                  { label: "Active Tenders", value: String(selected.activeTenders), color: "text-slate-400" },
                  { label: "Projects",     value: String(selected.activeProjects), color: "text-slate-400" },
                  { label: "Compliance",   value: `${selected.compliance}%`,       color: selected.compliance >= 85 ? "text-slate-500" : "text-slate-500" },
                  { label: "Population",   value: (selected.population / 1e6).toFixed(2) + "M", color: "text-white/70" },
                ].map(k => (
                  <div key={k.label} className="bg-white/5 rounded-lg p-2.5 border border-white/8">
                    <div className="text-[10px] text-white/40 mb-1">{k.label}</div>
                    <div className={`text-sm font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Spend vs national */}
              <div>
                <div className="text-xs text-white/50 mb-1.5">Share of National Spend</div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#2563eb] rounded-full" style={{ width: `${(selected.tenderSpendM / TOTAL_SPEND_M * 100).toFixed(1)}%` }} />
                </div>
                <div className="text-[10px] text-white/40 mt-1">{(selected.tenderSpendM / TOTAL_SPEND_M * 100).toFixed(1)}% of USD {TOTAL_SPEND_M}M national total</div>
              </div>

              {/* Compliance bar */}
              <div>
                <div className="text-xs text-white/50 mb-1.5">Compliance Score</div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${selected.compliance}%`,
                    background: selected.compliance >= 85 ? "#475569" : selected.compliance >= 70 ? "#64748B" : "#DC2626",
                  }} />
                </div>
                <div className="text-[10px] text-white/40 mt-1">{selected.compliance}/100</div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full h-8 rounded-lg bg-[#2563eb]/20 text-[#2563eb] text-xs font-medium border border-[#2563eb]/30 hover:bg-[#2563eb]/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Pin detail panel */}
        {selectedPin && (
          <div className="w-72 flex-shrink-0 bg-[#0f172a] border-l border-white/8 overflow-y-auto flex flex-col z-10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 sticky top-0 bg-[#0f172a]">
              <span className="font-semibold text-sm text-white">{selectedPin.type === "tender" ? "Tender" : "Project"}</span>
              <button onClick={() => setSelectedPin(null)} className="text-white/40 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] font-mono text-[#2563eb]">{selectedPin.id}</div>
              <div className="text-sm font-semibold text-white leading-snug">{selectedPin.title}</div>
              <div className="text-xs text-white/50">{selectedPin.entity}</div>
              <div className="text-xs font-bold text-slate-500">{selectedPin.value}</div>
              <div className="text-xs text-white/50">{selectedPin.locationLabel}</div>
              {onPinClick && (
                <button onClick={() => onPinClick(selectedPin)}
                  className="w-full h-8 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" /> View Full Details
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chart side panel */}
        {chartView !== "none" && !selected && !selectedPin && (
          <div className="w-80 flex-shrink-0 bg-[#0f172a] border-l border-white/8 overflow-y-auto flex flex-col z-10">
            <div className="px-4 py-3 border-b border-white/8">
              <div className="text-sm font-semibold text-white">
                {chartView === "bar" ? "Tender Spend by Province" : "Spend Distribution"}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">USD Millions · FY 2026</div>
            </div>
            <div className="flex-1 p-3">
              {chartView === "bar" && (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <XAxis type="number" tick={{ fill: "#ffffff60", fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff70", fontSize: 9 }} width={60} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11, color: "#fff" }} />
                    <Bar dataKey="spend" name="Spend" radius={[0,4,4,0]}>
                      {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                    <Bar dataKey="awarded" name="Awarded" fill="#10B981" radius={[0,4,4,0]} fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartView === "pie" && (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={45}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "#ffffff30" }}>
                      {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11, color: "#fff" }} formatter={(v: number) => `USD ${v}M`} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Summary stats */}
              <div className="mt-3 space-y-2">
                {ZW_PROVINCES.slice(0, 5).map((p, i) => (
                  <button key={p.id} onClick={() => setSelected(p)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors text-left">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                    <span className="flex-1 text-xs text-white/70 truncate">{p.name}</span>
                    <span className="text-xs font-bold text-[#2563eb]">${p.tenderSpendM}M</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Legend bar ────────────────────────────────────────────── */}
      {(mode === "choropleth" || mode === "heat" || mode === "circles") && (
        <div className="flex-shrink-0 bg-[#0f172a] border-t border-white/8 px-4 py-2 flex items-center gap-4 flex-wrap text-xs">
          <span className="text-white/50 font-medium uppercase tracking-wider text-[10px]">
            {mode === "choropleth" ? "Spend Intensity" : mode === "heat" ? "Heat Intensity" : "Circle Size = Spend"}
          </span>
          {mode !== "circles" && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-24 rounded-full" style={{
                background: "linear-gradient(to right, rgb(0,80,140), rgb(173,216,230))"
              }} />
              <span className="text-white/40 text-[10px]">Low → High Spend</span>
            </div>
          )}
          <span className="ml-auto text-white/30 text-[10px]">Click any region for details</span>
        </div>
      )}
    </div>
  );
}

// ── KPI Summary Strip ─────────────────────────────────────────────────────
function MapKpiStrip() {
  const totalTenders  = ZW_PROVINCES.reduce((s, p) => s + p.activeTenders, 0);
  const totalProjects = ZW_PROVINCES.reduce((s, p) => s + p.activeProjects, 0);
  const avgCompliance = Math.round(ZW_PROVINCES.reduce((s, p) => s + p.compliance, 0) / ZW_PROVINCES.length);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { label: "National Tender Spend",  value: `USD ${TOTAL_SPEND_M}M`, icon: DollarSign,  color: "text-[#2563eb]" },
        { label: "Active Tenders",          value: String(totalTenders),    icon: FileText,    color: "text-slate-400"   },
        { label: "Active Projects",         value: String(totalProjects),   icon: Briefcase,   color: "text-slate-400" },
        { label: "Avg Compliance",          value: `${avgCompliance}%`,     icon: Activity,    color: "text-slate-500"},
      ].map(k => (
        <div key={k.label} className="bg-[#0f172a] border border-white/8 rounded-xl p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <k.icon className={`h-5 w-5 ${k.color}`} />
          </div>
          <div>
            <div className={`text-lg font-bold leading-tight ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-white/40">{k.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Authenticated Map Page ────────────────────────────────────────────────
function AuthenticatedGisPage() {
  const navigate = useNavigate();
  const handlePinClick = (pin: GisPin) => {
    if (pin.type === "tender") navigate(`/tenders/${pin.id}`);
    else navigate("/projects");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="GIS & Mapping"
        process="Geographic Information System"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="flex flex-col h-[calc(100vh-56px)] p-4 sm:p-6 max-w-[1800px] mx-auto w-full gap-3">
        <div className="flex items-start justify-between flex-wrap gap-2 flex-shrink-0">
          <PageHeader
            title="GIS Procurement Map — Zimbabwe"
            description="Interactive choropleth, heat map, and proportional circles showing tender spend, projects and compliance per province. Click any region or pin for details."
          />
          <div className="flex items-center gap-2 text-xs text-white/60 bg-[#0f172a] border border-white/8 rounded-lg px-3 py-2">
            <MapPin className="h-3.5 w-3.5 text-[#2563eb]" />
            <span><strong className="text-white">{ALL_GIS_PINS.filter(p => p.type === "tender").length}</strong> Tenders</span>
            <span>·</span>
            <span><strong className="text-white">{ALL_GIS_PINS.filter(p => p.type === "project").length}</strong> Projects</span>
            <span>·</span>
            <span><strong className="text-white">10</strong> Provinces</span>
          </div>
        </div>

        <MapKpiStrip />

        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl min-h-0">
          <ZimbabweMap onPinClick={handlePinClick} />
        </div>
      </div>
    </AppShell>
  );
}

// ── Public Map Page ───────────────────────────────────────────────────────
function PublicGisPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal
          </button>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#2563eb]" />
            <span className="font-semibold text-sm text-white">Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System — Procurement Geographic Information System Map</span>
          </div>
        </div>
        <button onClick={() => navigate("/signin")}
          className="h-8 px-3 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-[#1d4ed8] transition-colors">
          Login for Full Access
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <ZimbabweMap />
      </div>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────
export default function GisMapPage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedGisPage /> : <PublicGisPage />;
}


