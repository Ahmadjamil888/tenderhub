/**
 * GisMapView — redesigned to match reference GIS layout:
 * Left: Map Layers panel (checkboxes, counts, colour dots, collapsible)
 * Centre: Leaflet map with popup cards on pin click
 * Right: Case Details panel (Details/BOQ/Media/Reviews/Report/Feedback tabs + Activity History)
 * Top: toolbar (Street/Satellite, Zoom, Legend, Settings, Details)
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X, ExternalLink, FileText, Briefcase, Layers,
  Navigation, AlertTriangle, CheckCircle2, Clock, Info,
  Settings, Map, ZoomIn, ZoomOut, Maximize2, Star,
  MessageSquare, ChevronDown, ChevronRight, Activity,
  Download, Link2, History, MapPin,
} from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error – Leaflet internal
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// ── Types ─────────────────────────────────────────────────────────────────
export type GisPin = {
  id: string;
  type: "tender" | "project";
  title: string;
  entity: string;
  status: string;
  priority?: string;
  value?: string;
  phase?: string;
  officer?: string;
  contactPhone?: string;
  startDate?: string;
  endDate?: string;
  locationLabel: string;
  lat: number;
  lng: number;
  tone: "green" | "amber" | "red" | "blue" | "violet";
};

const TONE_HEX: Record<GisPin["tone"], string> = {
  green: "#475569", amber: "#64748B", red: "#dc2626", blue: "#0F172A", violet: "#334155",
};

// ── Layer definitions (left panel) ────────────────────────────────────────
type LayerDef = { id: string; label: string; color: string; asset?: boolean };

const LAYERS: { group: string; items: LayerDef[] }[] = [
  { group: "TENDERS", items: [
    { id: "tender-open",   label: "Bidding Open",      color: "#0F172A" },
    { id: "tender-eval",   label: "Under Evaluation",  color: "#64748B" },
    { id: "tender-award",  label: "Award Pending",     color: "#334155" },
    { id: "tender-closed", label: "Closed / Awarded",  color: "#475569" },
  ]},
  { group: "PROJECTS", items: [
    { id: "proj-active",   label: "Active Projects",   color: "#475569" },
    { id: "proj-risk",     label: "At Risk",           color: "#DC2626" },
    { id: "proj-complete", label: "Completed",         color: "#64748b" },
  ]},
  { group: "ASSETS", items: [
    { id: "roads",         label: "Roads",             color: "#0F172A",  asset: true },
    { id: "buildings",     label: "Buildings",         color: "#475569",  asset: true },
    { id: "schools",       label: "Schools",           color: "#ec4899",  asset: true },
    { id: "hospitals",     label: "Hospitals",         color: "#DC2626",  asset: true },
    { id: "fleet",         label: "Fleet",             color: "#84cc16",  asset: true },
    { id: "infrastructure",label: "Infrastructure",    color: "#f97316",  asset: true },
    { id: "contracts",     label: "Contracts",         color: "#64748b",  asset: true },
  ]},
];

// ── Layer counts from pins ────────────────────────────────────────────────
function getCount(pins: GisPin[], id: string): number {
  if (id === "tender-open")   return pins.filter(p => p.type === "tender" && p.status === "Bidding Open").length;
  if (id === "tender-eval")   return pins.filter(p => p.type === "tender" && p.status === "Evaluation").length;
  if (id === "tender-award")  return pins.filter(p => p.type === "tender" && p.status === "Award Pending").length;
  if (id === "tender-closed") return pins.filter(p => p.type === "tender" && ["Closed","Awarded","Published"].includes(p.status)).length;
  if (id === "proj-active")   return pins.filter(p => p.type === "project" && p.tone !== "red" && p.phase !== "Completed").length;
  if (id === "proj-risk")     return pins.filter(p => p.type === "project" && p.tone === "red").length;
  if (id === "proj-complete") return pins.filter(p => p.type === "project" && p.phase === "Completed").length;
  return 0;
}

// ── Pin icon ──────────────────────────────────────────────────────────────
function makeIcon(pin: GisPin) {
  const fill = TONE_HEX[pin.tone];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="24" height="34">
    <circle cx="12" cy="10" r="8" fill="${fill}" stroke="white" stroke-width="2"/>
    <path d="M12 34 L7 18 Q12 22 17 18 Z" fill="${fill}"/>
    <text x="12" y="14" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="system-ui">
      ${pin.type === "tender" ? "T" : "P"}
    </text>
  </svg>`;
  return L.divIcon({ html: svg, className: "", iconSize: [24, 34], iconAnchor: [12, 34], popupAnchor: [0, -36] });
}

// ── Component props ───────────────────────────────────────────────────────
interface Props {
  pins: GisPin[];
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  title?: string;
  onNavigate?: (pin: GisPin) => void;
}

export default function GisMapView({ pins, height = "100%", initialCenter = [-19.0, 29.8], initialZoom = 6, onNavigate }: Props) {
  const mapRef       = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const basemapRef   = useRef<L.TileLayer | null>(null);
  const markersRef   = useRef<L.LayerGroup | null>(null);

  const [selected,   setSelected]   = useState<GisPin | null>(null);
  const [detailTab,  setDetailTab]  = useState<"Case Details"|"Media"|"BOQ"|"Reviews"|"Feedback"|"Reports">("Case Details");
  const [basemap,    setBasemap]    = useState<"street"|"satellite">("satellite");
  const [enabledLayers, setEnabledLayers] = useState<Set<string>>(() => new Set(LAYERS.flatMap(g => g.items.map(i => i.id))));
  const [collapsed,  setCollapsed]  = useState<Set<string>>(new Set());
  const [showLayers, setShowLayers] = useState(true);
  const [showDetails,setShowDetails]= useState(true);

  const BASEMAPS = {
    satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "© Esri" },
    street:    { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap" },
  };

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: initialCenter, zoom: initialZoom, zoomControl: false, attributionControl: false });
    mapRef.current = map;
    basemapRef.current = L.tileLayer(BASEMAPS.satellite.url, { maxZoom: 19 }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap basemap
  useEffect(() => {
    if (!mapRef.current || !basemapRef.current) return;
    basemapRef.current.remove();
    const cfg = BASEMAPS[basemap];
    basemapRef.current = L.tileLayer(cfg.url, { maxZoom: 19 }).addTo(mapRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  // Render pins
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();
    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon(pin) });
      const fill = TONE_HEX[pin.tone];
      const popup = `
        <div style="min-width:240px;font-family:system-ui,sans-serif;font-size:12px;padding:2px;">
          <div style="font-weight:800;font-size:13px;margin-bottom:8px;color:#0f172a;">
            ${pin.id}
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#64748b;padding:3px 10px 3px 0;width:70px;">Domain</td>
                <td style="font-weight:500;">${pin.type === "tender" ? "Procurement" : "Projects"}</td></tr>
            <tr><td style="color:#64748b;padding:3px 10px 3px 0;">Type</td>
                <td style="text-transform:capitalize;font-weight:500;">${pin.type}</td></tr>
            <tr><td style="color:#64748b;padding:3px 10px 3px 0;">District</td>
                <td style="font-weight:500;">${pin.locationLabel.split(",").slice(-1)[0]?.trim() ?? pin.locationLabel}</td></tr>
            <tr><td style="color:#64748b;padding:3px 10px 3px 0;">Location</td>
                <td style="font-size:11px;">${pin.locationLabel}</td></tr>
            <tr><td style="color:#64748b;padding:3px 10px 3px 0;">Status</td>
                <td><span style="background:${fill}22;color:${fill};padding:1px 8px;border-radius:4px;font-size:11px;font-weight:700;">${pin.status}</span></td></tr>
            ${pin.startDate ? `<tr><td style="color:#64748b;padding:3px 10px 3px 0;">Created</td><td style="font-size:11px;">${pin.startDate}</td></tr>` : ""}
          </table>
          <div style="display:flex;gap:6px;margin-top:10px;">
            <button id="pd-${pin.id}" style="flex:1;height:32px;background:#2563eb;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
              DETAILS
            </button>
            <button id="pn-${pin.id}" style="flex:1;height:32px;background:#16a34a;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
              ⊕ DIRECTIONS
            </button>
          </div>
        </div>`;
      marker.bindPopup(popup, { maxWidth: 300, minWidth: 260 });
      marker.on("popupopen", () => {
        setTimeout(() => {
          document.getElementById(`pd-${pin.id}`)?.addEventListener("click", () => { setSelected(pin); setDetailTab("Case Details"); });
          document.getElementById(`pn-${pin.id}`)?.addEventListener("click", () => {
            if (mapRef.current) mapRef.current.flyTo([pin.lat, pin.lng], 14, { duration: 1 });
          });
        }, 50);
      });
      marker.addTo(markersRef.current!);
    });
  }, [pins, enabledLayers]);

  // Fly to selected
  useEffect(() => {
    if (selected && mapRef.current) mapRef.current.flyTo([selected.lat, selected.lng], 13, { animate: true, duration: 1 });
  }, [selected]);

  const toggleLayer = (id: string) => setEnabledLayers(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleGroup = (group: string) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(group) ? next.delete(group) : next.add(group);
    return next;
  });

  const toneLabel: Record<GisPin["tone"], string> = {
    green: "text-[#0F172A] bg-slate-100", amber: "text-[#0F172A] bg-slate-100",
    red: "text-red-700 bg-red-100", blue: "text-[#0F172A] bg-slate-100", violet: "text-[#0F172A] bg-slate-100",
  };

  const DETAIL_TABS = ["Case Details","Media","BOQ","Reviews","Feedback","Reports"] as const;

  // Activity history for selected pin
  const activity = selected ? [
    { label: "Created",  who: "System",           note: "Record created in the system",           date: selected.startDate ?? "2026-01-01" },
    { label: "Updated",  who: selected.officer ?? "Officer", note: "Status updated",               date: "2026-06-10" },
    { label: "Reviewed", who: "Procurement Unit",  note: "Document review completed",              date: "2026-07-01" },
  ] : [];

  return (
    <div className="flex flex-col w-full bg-gray-100" style={{ height }}>

      {/* ── TOP TOOLBAR ── */}
      <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        {/* Left: Exit + Layers toggle */}
        <button onClick={() => setShowLayers(v => !v)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors mr-1">
          ← Exit GIS
        </button>
        <button onClick={() => setShowLayers(v => !v)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${showLayers ? "bg-[#0F172A] text-white border-slate-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
          <Layers className="h-3.5 w-3.5" /> Layers
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Centre: basemap + zoom + legend */}
        <button onClick={() => setBasemap("street")}
          className={`flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${basemap === "street" ? "bg-[#0F172A] text-white border-slate-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
          <Map className="h-3.5 w-3.5" /> Street
        </button>
        <button onClick={() => setBasemap("satellite")}
          className={`flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${basemap === "satellite" ? "bg-[#0F172A] text-white border-slate-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
          <Layers className="h-3.5 w-3.5" /> Satellite
        </button>
        <button onClick={() => mapRef.current?.zoomIn()}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <ZoomIn className="h-3.5 w-3.5 text-gray-600" />
        </button>
        <button onClick={() => mapRef.current?.zoomOut()}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <ZoomOut className="h-3.5 w-3.5 text-gray-600" />
        </button>
        <button onClick={() => mapRef.current?.flyTo(initialCenter, initialZoom)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <Maximize2 className="h-3.5 w-3.5 text-gray-600" />
        </button>

        {/* Legend */}
        <div className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 ml-1">
          <Info className="h-3.5 w-3.5" /> Legend
        </div>

        <div className="flex-1" />

        {/* Right: Settings + Details */}
        <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          <Settings className="h-3.5 w-3.5" /> Settings
        </button>
        <button onClick={() => setShowDetails(v => !v)}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors ${showDetails && selected ? "bg-[#0F172A] text-white border-slate-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
          <Info className="h-3.5 w-3.5" /> Details
        </button>
      </div>

      {/* ── BODY: Layers | Map | Details ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Map Layers Panel ── */}
        {showLayers && (
          <div className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800">Map Layers</span>
              <button onClick={() => setShowLayers(false)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Layer / Filter / Charts tabs */}
            <div className="flex border-b border-gray-100">
              {["Layers","Filters","Charts"].map((t,i) => (
                <button key={t} className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${i===0 ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {t === "Layers" && <span className="flex items-center justify-center gap-1"><Layers className="h-3 w-3"/>{t}</span>}
                  {t === "Filters" && <span className="flex items-center justify-center gap-1"><Activity className="h-3 w-3"/>{t}</span>}
                  {t === "Charts"  && <span className="flex items-center justify-center gap-1"><MapPin className="h-3 w-3"/>{t}</span>}
                </button>
              ))}
            </div>

            {/* Groups */}
            <div className="flex-1 px-2 py-2 space-y-1">
              {LAYERS.map(group => {
                const isCollapsed = collapsed.has(group.group);
                return (
                  <div key={group.group}>
                    {/* Group header */}
                    <button onClick={() => toggleGroup(group.group)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      {isCollapsed
                        ? <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"/>
                        : <ChevronDown  className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"/>}
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">{group.group}</span>
                    </button>

                    {/* Items */}
                    {!isCollapsed && (
                      <div className="space-y-0.5 pl-2 mb-2">
                        {group.items.map(item => {
                          const count = getCount(pins, item.id);
                          const isOn  = enabledLayers.has(item.id);
                          return (
                            <div key={item.id}
                              onClick={() => toggleLayer(item.id)}
                              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${isOn ? "hover:bg-slate-50" : "opacity-50 hover:opacity-70 hover:bg-gray-50"}`}>
                              {/* Checkbox */}
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isOn ? "border-slate-200 bg-[#0F172A]" : "border-gray-300 bg-white"}`}>
                                {isOn && <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={3}/>}
                              </div>
                              {/* Icon dot */}
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }}/>
                              {/* Label */}
                              <span className="flex-1 text-xs text-gray-700 font-medium">{item.label}</span>
                              {/* Count badge */}
                              {count > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: item.color }}>
                                  {count}
                                </span>
                              )}
                              {/* Chevron */}
                              <ChevronDown className="h-3 w-3 text-gray-300 flex-shrink-0"/>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="h-px bg-gray-100 mx-2 mb-1" />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
              <button className="flex items-center gap-1 hover:text-red-600 transition-colors font-medium">
                <X className="h-3 w-3"/> Clear Filters
              </button>
              <button className="flex items-center gap-1 hover:text-[#0F172A] transition-colors font-medium">
                <CheckCircle2 className="h-3 w-3"/> Show All
              </button>
            </div>
          </div>
        )}

        {/* ── CENTRE: Map ── */}
        <div className="flex-1 min-w-0 relative">
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* ── RIGHT: Case Details Panel — always visible ── */}
        {showDetails && (
          <div className="w-72 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                {selected ? (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                      {selected.type === "tender"
                        ? <FileText className="h-4 w-4 text-[#0F172A]"/>
                        : <Briefcase className="h-4 w-4 text-[#0F172A]"/>}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">{selected.id}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{selected.locationLabel.split(",").slice(-1)[0]?.trim()}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm font-bold text-gray-700">Case Details</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {selected && (
                  <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100 transition-colors" title="Clear selection">
                    <X className="h-3.5 w-3.5 text-gray-400"/>
                  </button>
                )}
              </div>
            </div>

            {/* Tab bar — the right-panel's own tabs */}
            <div className="flex border-b border-gray-100 bg-white flex-shrink-0 overflow-x-auto">
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`flex items-center gap-1 px-2.5 py-2.5 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    detailTab === tab
                      ? "border-slate-200 text-[#0F172A] bg-slate-50/50"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab === "Case Details" && <Info className="h-3 w-3"/>}
                  {tab === "Media"        && <Layers className="h-3 w-3"/>}
                  {tab === "BOQ"          && <FileText className="h-3 w-3"/>}
                  {tab === "Reviews"      && <Star className="h-3 w-3"/>}
                  {tab === "Feedback"     && <MessageSquare className="h-3 w-3"/>}
                  {tab === "Reports"      && <Briefcase className="h-3 w-3"/>}
                  {tab}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">

              {/* No selection state */}
              {!selected && (
                <div className="py-12 text-center text-gray-400">
                  <MapPin className="h-10 w-10 mx-auto mb-3 opacity-20"/>
                  <p className="text-sm font-medium text-gray-500">No case selected</p>
                  <p className="text-xs mt-1 text-gray-400">Click a pin on the map to view case details here.</p>
                </div>
              )}

              {/* ── Case Details tab ── */}
              {selected && detailTab === "Case Details" && (
                <>
                  {/* Status badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${toneLabel[selected.tone]}`}>{selected.status.toUpperCase()}</span>
                    {selected.priority && <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#0F172A] bg-slate-100">{selected.priority.toUpperCase()}</span>}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{selected.type}</span>
                  </div>

                  {/* Detail rows */}
                  <div className="space-y-0 border border-gray-100 rounded-lg overflow-hidden">
                    {[
                      { label: "Case No.",    value: selected.id },
                      { label: "Title",       value: selected.title },
                      { label: "Domain",      value: selected.type === "tender" ? "Procurement" : "Projects" },
                      { label: "Entity",      value: selected.entity },
                      { label: "Officer",     value: selected.officer ?? "—" },
                      { label: "Location",    value: selected.locationLabel },
                      { label: "Contact",     value: selected.contactPhone ?? "—" },
                      { label: "Start Date",  value: selected.startDate ?? "—" },
                      ...(selected.value   ? [{ label: "Value",    value: selected.value }]   : []),
                      ...(selected.phase   ? [{ label: "Phase",    value: selected.phase }]   : []),
                      ...(selected.endDate ? [{ label: "End Date", value: selected.endDate }] : []),
                    ].map((row, i) => (
                      <div key={row.label} className={`flex gap-2 px-3 py-2 text-xs ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <span className="w-20 flex-shrink-0 text-gray-400 font-semibold uppercase text-[10px] tracking-wide leading-relaxed">{row.label}</span>
                        <span className="flex-1 text-gray-800 break-words leading-relaxed">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Actions</p>
                    {onNavigate && (
                      <button onClick={() => onNavigate(selected)}
                        className="w-full h-9 flex items-center justify-center gap-2 bg-[#0F172A] text-white text-xs font-bold rounded-lg hover:bg-[#0F172A] transition-colors">
                        <Navigation className="h-3.5 w-3.5"/> Get Directions
                      </button>
                    )}
                    <button onClick={() => navigator.clipboard?.writeText(selected.id)}
                      className="w-full h-9 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                      <Link2 className="h-3.5 w-3.5"/> Copy Case Link
                    </button>
                  </div>

                  {/* Activity History */}
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <History className="h-3.5 w-3.5 text-gray-400"/>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Activity History</p>
                    </div>
                    <div className="space-y-3">
                      {activity.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity className="h-3 w-3 text-[#0F172A]"/>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold text-gray-700">
                              <span className="text-[#0F172A]">{a.label}</span>{" "}
                              <span className="text-gray-400 font-normal">by {a.who}</span>
                            </div>
                            <div className="text-[10px] text-gray-500">{a.note}</div>
                            <div className="text-[10px] text-gray-400">{a.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Media tab ── */}
              {selected && detailTab === "Media" && (
                <div className="py-8 text-center text-gray-400">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-medium text-gray-600">Media Files</p>
                  <p className="text-xs mt-1">No media uploaded for this {selected.type}.</p>
                  <button className="mt-4 h-8 px-4 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A]">
                    Upload Media
                  </button>
                </div>
              )}

              {/* ── BOQ tab ── */}
              {selected && detailTab === "BOQ" && (
                <div className="py-8 text-center text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-medium text-gray-600">Bill of Quantities</p>
                  <p className="text-xs mt-1">No BOQ attached for this {selected.type}.</p>
                  <button className="mt-4 h-8 px-4 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] flex items-center gap-1.5 mx-auto">
                    <Download className="h-3 w-3"/>Upload BOQ
                  </button>
                </div>
              )}

              {/* ── Reviews tab ── */}
              {selected && detailTab === "Reviews" && (
                <div className="py-8 text-center text-gray-400">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-xs mt-1">No reviews recorded for this {selected.type}.</p>
                </div>
              )}

              {/* ── Feedback tab ── */}
              {selected && detailTab === "Feedback" && (
                <div className="py-8 text-center text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-medium text-gray-600">Feedback</p>
                  <p className="text-xs mt-1">No feedback submitted yet.</p>
                </div>
              )}

              {/* ── Reports tab ── */}
              {selected && detailTab === "Reports" && (
                <div className="py-8 text-center text-gray-400">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-xs mt-1">No reports generated for this {selected.type}.</p>
                  <button className="mt-4 h-8 px-4 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A]">
                    Generate Report
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
