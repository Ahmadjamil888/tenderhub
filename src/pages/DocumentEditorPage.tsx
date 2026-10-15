/**
 * DocumentEditorPage — Full-screen standalone document editor / viewer.
 * Accessible from sidebar as "Documents" → "Document Editor"
 * Also reachable from any module via /docs/editor
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppShell, PageHeader , PageContextBar } from "@/components/AppShell";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Save, Download, Printer, Upload, Eye, X, Plus,
  FileText, FolderOpen, Search, ZoomIn, ZoomOut, Maximize2, Minimize2,
  RotateCcw, Palette, Type, ChevronLeft, ChevronRight, Sparkles, Check,
  Edit3, FileSignature, Link2, Image, Table, BookOpen, Clock, Star,
  Share2, Copy, Scissors, Trash2, MoreHorizontal, Grid, List as ListIcon,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ── Document types & mock library ────────────────────────────────────────
type DocStatus = "Draft" | "Final" | "Approved" | "Under Review" | "Archived";
type DocCategory =
  | "Tender Documents" | "Contracts" | "Evaluation Reports" | "Minutes"
  | "Resolutions" | "Compliance" | "Invoices" | "Reports" | "Policies"
  | "Templates" | "BOQ" | "TOR" | "Other";

type LibDoc = {
  id: string; name: string; type: string; category: DocCategory;
  size: string; created: string; modified: string;
  status: DocStatus; author: string; starred?: boolean;
  content?: string; tags?: string[];
};

const DEMO_DOCS: LibDoc[] = [
  { id: "d001", name: "Tender Document — Solar Mini-Grid RFP.docx",        type: "DOCX", category: "Tender Documents",    size: "1.8 MB", created: "2026-06-01", modified: "2026-06-18", status: "Final",        author: "D. Moyo",      starred: true,  tags: ["solar","energy","tender"] },
  { id: "d002", name: "ARV Medicines Contract — 2-Year Framework.docx",     type: "DOCX", category: "Contracts",           size: "2.4 MB", created: "2026-05-15", modified: "2026-06-20", status: "Approved",     author: "L. Ndlovu",    starred: true,  tags: ["health","medicines","contract"] },
  { id: "d003", name: "Technical Evaluation Report — ICT System.pdf",       type: "PDF",  category: "Evaluation Reports",  size: "3.1 MB", created: "2026-06-10", modified: "2026-06-21", status: "Final",        author: "A. Chikwanda", starred: false, tags: ["ICT","evaluation"] },
  { id: "d004", name: "Procurement Committee Minutes — 12 Jun 2026.docx",   type: "DOCX", category: "Minutes",             size: "320 KB", created: "2026-06-12", modified: "2026-06-12", status: "Final",        author: "D. Moyo",      starred: false, tags: ["minutes","committee"] },
  { id: "d005", name: "PRAZ Compliance Checklist v2.xlsx",                   type: "XLSX", category: "Compliance",          size: "210 KB", created: "2026-06-19", modified: "2026-06-21", status: "Final",        author: "L. Ndlovu",    starred: false, tags: ["compliance","PRAZ"] },
  { id: "d006", name: "BOQ — Beitbridge Highway Section 4.xlsx",             type: "XLSX", category: "BOQ",                 size: "840 KB", created: "2026-06-01", modified: "2026-06-14", status: "Under Review", author: "J. Banda",     starred: true,  tags: ["BOQ","highway","infrastructure"] },
  { id: "d007", name: "Award Resolution — MOH-2026-00183.docx",              type: "DOCX", category: "Resolutions",         size: "190 KB", created: "2026-06-22", modified: "2026-06-22", status: "Approved",     author: "L. Ndlovu",    starred: false, tags: ["award","resolution"] },
  { id: "d008", name: "Invoice — ZPH-INV-2026-0421.pdf",                     type: "PDF",  category: "Invoices",            size: "124 KB", created: "2026-06-15", modified: "2026-06-15", status: "Approved",     author: "A. Chikwanda", starred: false, tags: ["invoice","payment"] },
  { id: "d009", name: "Standard Bidding Document — Goods 2026.docx",         type: "DOCX", category: "Templates",           size: "1.2 MB", created: "2026-01-10", modified: "2026-05-08", status: "Final",        author: "System",       starred: false, tags: ["template","bidding"] },
  { id: "d010", name: "Procurement Policy Framework 2026.docx",               type: "DOCX", category: "Policies",            size: "2.1 MB", created: "2026-01-01", modified: "2026-04-15", status: "Approved",     author: "System",       starred: false, tags: ["policy","procurement"] },
  { id: "d011", name: "TOR — Legal Advisory Services 3 Years.docx",           type: "DOCX", category: "TOR",                 size: "380 KB", created: "2026-06-05", modified: "2026-06-12", status: "Under Review", author: "D. Moyo",      starred: false, tags: ["TOR","legal"] },
  { id: "d012", name: "Annual Procurement Plan 2026-2027.xlsx",               type: "XLSX", category: "Reports",             size: "1.5 MB", created: "2025-12-10", modified: "2026-01-20", status: "Approved",     author: "D. Moyo",      starred: true,  tags: ["annual","plan","procurement"] },
  { id: "d013", name: "Evaluation Framework — Technical Criteria.docx",       type: "DOCX", category: "Evaluation Reports",  size: "450 KB", created: "2026-06-08", modified: "2026-06-16", status: "Draft",        author: "A. Chikwanda", starred: false, tags: ["evaluation","criteria"] },
  { id: "d014", name: "Budget Variance Report — Jun 2026.xlsx",               type: "XLSX", category: "Reports",             size: "290 KB", created: "2026-06-25", modified: "2026-06-25", status: "Draft",        author: "L. Ndlovu",    starred: false, tags: ["budget","variance"] },
  { id: "d015", name: "Conflict of Interest Declaration — Eval Panel.docx",   type: "DOCX", category: "Compliance",          size: "95 KB",  created: "2026-06-09", modified: "2026-06-09", status: "Final",        author: "D. Moyo",      starred: false, tags: ["conflict","declaration","compliance"] },
];

const CATEGORY_COLORS: Record<DocCategory, string> = {
  "Tender Documents":   "bg-slate-100 text-[#0F172A]",
  "Contracts":          "bg-slate-100 text-[#0F172A]",
  "Evaluation Reports": "bg-slate-100 text-[#0F172A]",
  "Minutes":            "bg-slate-100 text-[#0F172A]",
  "Resolutions":        "bg-slate-100 text-slate-500",
  "Compliance":         "bg-slate-100 text-[#0F172A]",
  "Invoices":           "bg-slate-100 text-[#0F172A]",
  "Reports":            "bg-slate-100 text-[#0F172A]",
  "Policies":           "bg-slate-100 text-[#0F172A]",
  "Templates":          "bg-gray-100 text-gray-700",
  "BOQ":                "bg-lime-100 text-lime-700",
  "TOR":                "bg-rose-100 text-rose-700",
  "Other":              "bg-slate-100 text-slate-700",
};

const STATUS_COLORS: Record<DocStatus, string> = {
  "Draft":        "bg-gray-100 text-gray-600",
  "Final":        "bg-slate-100 text-[#0F172A]",
  "Approved":     "bg-slate-100 text-[#0F172A]",
  "Under Review": "bg-slate-100 text-[#0F172A]",
  "Archived":     "bg-slate-100 text-slate-500",
};

const TYPE_CLR: Record<string, string> = {
  PDF: "bg-red-500", XLSX: "bg-[#0F172A]", DOCX: "bg-[#0F172A]",
  PPTX: "bg-[#0F172A]", TXT: "bg-gray-500", DOC: "bg-[#0F172A]",
};

const ALL_CATEGORIES: DocCategory[] = [
  "Tender Documents", "Contracts", "Evaluation Reports", "Minutes",
  "Resolutions", "Compliance", "Invoices", "Reports", "Policies",
  "Templates", "BOQ", "TOR", "Other",
];

const FONTS = ["Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Courier New", "Cambria"];
const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","24","28","32","36","48","72"];
const COLORS = [
  "#000000","#0f172a","#1e3a5f","#0F172A","#047857","#7c2d12",
  "#831843","#dc2626","#64748B","#374151","#6b7280","#9ca3af","#ffffff",
];

// ── Rich Document Editor Component ──────────────────────────────────────
function RichEditor({ doc, onClose, onSave }: { doc: LibDoc; onClose: () => void; onSave: (content: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [wordCount, setWordCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState("");

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = doc.content || `
      <div style="text-align:center; margin-bottom:24px;">
        <p style="font-size:18px;font-weight:bold;color:#0f172a;">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
        <p style="font-size:14px;font-weight:600;margin-top:8px;">${doc.name.replace(/\.[^.]+$/, "")}</p>
        <p style="font-size:11px;color:#64748b;margin-top:4px;">Reference: ${doc.id.toUpperCase()}</p>
        <p style="font-size:11px;color:#64748b;">Date: ${doc.modified}</p>
        <p style="font-size:11px;color:#64748b;">Author: ${doc.author} &nbsp;|&nbsp; Status: ${doc.status}</p>
      </div>
      <hr style="border:none;border-top:2px solid #0f172a;margin:16px 0;"/>
      <p><br/></p>
      <p>This document has been prepared in accordance with the Public Procurement and Disposal of Public Assets Act (PPDPA) 2018 and Treasury Instructions. All procurement activities have been conducted transparently and in compliance with applicable regulations.</p>
      <p><br/></p>
      <p>Click anywhere in this document to start editing. Use the formatting toolbar above to style your content.</p>
      <p><br/></p>
      <p>Key information:</p>
      <ul><li>Category: ${doc.category}</li><li>Document Type: ${doc.type}</li><li>File Size: ${doc.size}</li></ul>
    `;
    updateWordCount();
  }, [doc]);

  const updateWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText ?? "";
      setWordCount(text.split(/\s+/).filter(w => w.length > 0).length);
    }
  };

  const execCmd = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    updateWordCount();
  }, []);

  const handleSave = () => {
    const content = editorRef.current?.innerHTML ?? "";
    onSave(content);
    setSaved(true);
    pushNotification(`Saved: ${doc.name}`, "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    const content = editorRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${doc.name}</title>
      <style>body{font-family:Calibri,sans-serif;font-size:12pt;margin:2.5cm;color:#000;line-height:1.6;}
      h1,h2,h3{color:#0f172a;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ccc;padding:6px;}
      @page{size:A4;margin:2.5cm;}</style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
      {/* Title bar — MS Word style blue */}
      <div className="bg-[#2b579a] flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <FileSignature className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white truncate max-w-md">{doc.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${STATUS_COLORS[doc.status]}`}>{doc.status}</span>
            {saved && <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleSave} className="h-7 px-3 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 rounded transition-colors">
              <Save className="h-3 w-3"/> Save
            </button>
            <button onClick={handlePrint} className="h-7 px-3 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 rounded transition-colors">
              <Printer className="h-3 w-3"/> Print
            </button>
            <a href={doc.content ? `data:text/html,${encodeURIComponent(doc.content ?? "")}` : "#"}
              download={doc.name}
              className="h-7 px-3 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 rounded transition-colors">
              <Download className="h-3 w-3"/> Export
            </a>
            <button onClick={onClose} className="h-7 w-7 grid place-items-center bg-red-600/80 hover:bg-red-500 text-white rounded ml-1 transition-colors">
              <X className="h-4 w-4"/>
            </button>
          </div>
        </div>

        {/* Ribbon menu tabs */}
        <div className="flex items-center gap-0 px-3 pt-1">
          {["Home","Insert","Layout","References","Review","View"].map((tab, i) => (
            <button key={tab} className={`px-3 py-1 text-[11px] font-medium border-b-2 -mb-px transition-colors ${i===0?"border-white text-white":"border-transparent text-white/55 hover:text-white hover:border-white/50"}`}>{tab}</button>
          ))}
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 px-3 py-1.5 flex-wrap">
          {/* Clipboard group */}
          <div className="flex items-center gap-0.5 border-r border-white/20 pr-2 mr-1">
            {[{icon:Copy,cmd:"copy",t:"Copy"},{icon:Scissors,cmd:"cut",t:"Cut"},{icon:RotateCcw,cmd:"undo",t:"Undo"}].map(({icon:Icon,cmd,t}) => (
              <button key={cmd} onClick={() => execCmd(cmd)} title={t} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded transition-colors">
                <Icon className="h-3 w-3"/>
              </button>
            ))}
          </div>
          {/* Font group */}
          <select value={fontFamily} onChange={e=>{setFontFamily(e.target.value);execCmd("fontName",e.target.value);}}
            className="h-6 px-1 text-[11px] bg-white text-black rounded focus:outline-none" style={{minWidth:80}}>
            {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={e=>{setFontSize(e.target.value);execCmd("fontSize","3");}}
            className="h-6 px-1 text-[11px] bg-white text-black rounded focus:outline-none w-10">
            {FONT_SIZES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <div className="h-4 w-px bg-white/20 mx-0.5"/>
          {/* Text format */}
          {[{icon:Bold,cmd:"bold"},{icon:Italic,cmd:"italic"},{icon:Underline,cmd:"underline"}].map(({icon:Icon,cmd})=>(
            <button key={cmd} onClick={()=>execCmd(cmd)} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded transition-colors">
              <Icon className="h-3 w-3"/>
            </button>
          ))}
          <div className="h-4 w-px bg-white/20 mx-0.5"/>
          {/* Alignment */}
          {[{icon:AlignLeft,cmd:"justifyLeft"},{icon:AlignCenter,cmd:"justifyCenter"},{icon:AlignRight,cmd:"justifyRight"},{icon:AlignJustify,cmd:"justifyFull"}].map(({icon:Icon,cmd})=>(
            <button key={cmd} onClick={()=>execCmd(cmd)} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded transition-colors">
              <Icon className="h-3 w-3"/>
            </button>
          ))}
          <div className="h-4 w-px bg-white/20 mx-0.5"/>
          {/* Lists */}
          <button onClick={()=>execCmd("insertUnorderedList")} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded"><List className="h-3 w-3"/></button>
          <button onClick={()=>execCmd("insertOrderedList")} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded"><ListOrdered className="h-3 w-3"/></button>
          <div className="h-4 w-px bg-white/20 mx-0.5"/>
          {/* Color picker */}
          <div className="relative group">
            <button className="h-6 px-1.5 flex items-center gap-1 bg-white/10 hover:bg-white/30 text-white rounded"><Palette className="h-3 w-3"/><span className="text-[10px]">A</span></button>
            <div className="absolute top-7 left-0 z-20 hidden group-hover:flex flex-wrap gap-0.5 p-1.5 bg-white rounded-lg shadow-xl border border-black/10" style={{width:116}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>execCmd("foreColor",c)} className="h-5 w-5 rounded border border-black/10 hover:scale-110 transition-transform flex-shrink-0" style={{background:c}}/>
              ))}
            </div>
          </div>
          {/* Heading styles */}
          <select onChange={e=>{execCmd("formatBlock",e.target.value);}} defaultValue="" className="h-6 px-1 text-[11px] bg-white/10 text-white rounded focus:outline-none hover:bg-white/20" style={{width:86}}>
            <option value="" disabled>Style ▼</option>
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Code</option>
          </select>
          <div className="h-4 w-px bg-white/20 mx-0.5"/>
          {/* Find */}
          <button onClick={()=>setShowFind(v=>!v)} className="h-6 px-1.5 flex items-center gap-1 bg-white/10 hover:bg-white/30 text-white rounded ml-auto">
            <Search className="h-3 w-3"/><span className="text-[10px]">Find</span>
          </button>
          {/* Zoom */}
          <button onClick={()=>setZoom(z=>Math.max(50,z-10))} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded"><ZoomOut className="h-3 w-3"/></button>
          <span className="text-[10px] text-white/70 w-8 text-center">{zoom}%</span>
          <button onClick={()=>setZoom(z=>Math.min(200,z+10))} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white rounded"><ZoomIn className="h-3 w-3"/></button>
        </div>

        {/* Find bar */}
        {showFind && (
          <div className="flex items-center gap-2 px-4 py-1.5 border-t border-white/15 bg-[#1d4ed8]">
            <input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find in document…"
              className="flex-1 h-6 px-2 text-[11px] bg-white/20 text-white placeholder-white/50 border-0 focus:outline-none rounded"/>
            <button onClick={()=>(window as unknown as Record<string,unknown>)["find"] && (window as unknown as {find:(t:string,b:boolean)=>void}).find(findText,false)} className="h-6 px-2 text-[10px] bg-white/20 hover:bg-white/30 text-white rounded">Find</button>
            <button onClick={()=>setShowFind(false)} className="text-white/60 hover:text-white"><X className="h-3.5 w-3.5"/></button>
          </div>
        )}
      </div>

      {/* Page ruler */}
      <div className="flex-shrink-0 h-5 bg-[#e8e8e8] border-b border-gray-300 flex items-center px-4">
        <div className="w-full h-px bg-gray-400 relative">
          {[2,4,6,8,10,12,14,16].map(n=>(
            <div key={n} className="absolute flex flex-col items-center" style={{left:`${(n/18)*100}%`}}>
              <div className="w-px h-2 bg-gray-500"/>
              <span className="text-[7px] text-gray-500">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Document canvas */}
      <div className="flex-1 overflow-auto bg-[#d0d0d0] min-h-0">
        <div className="flex justify-center py-8 px-4">
          <div style={{width:`${Math.min(100,zoom*6.3)}px`,minWidth:"600px",maxWidth:"100%",minHeight:`${zoom*8.9}px`,background:"white",boxShadow:"0 4px 24px rgba(0,0,0,0.18)",padding:`${zoom*0.9}px ${zoom*1.1}px`}}>
            <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={updateWordCount}
              style={{outline:"none",minHeight:`${zoom*7}px`,fontFamily,fontSize:`${parseInt(fontSize)*zoom/100}pt`,lineHeight:1.6,color:"#000"}}/>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 bg-[#2b579a] px-4 py-1 flex items-center gap-4 text-[10px] text-white/60">
        <span>Words: {wordCount}</span><span>·</span>
        <span>{doc.category}</span><span>·</span>
        <span>Author: {doc.author}</span><span>·</span>
        <span className="text-white/40">Document Editor</span>
        <div className="ml-auto flex items-center gap-2">
          <span>Zoom: {zoom}%</span>
          <button onClick={handleSave} className="h-5 px-2 bg-white/15 hover:bg-white/25 text-white rounded text-[10px]">{saved?"✓ Saved":"Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Document Library (left panel) ────────────────────────────────────────
function DocLibraryPanel({ docs, selected, onSelect, onNew, onUpload }: {
  docs: LibDoc[]; selected: LibDoc | null;
  onSelect: (d: LibDoc) => void; onNew: () => void; onUpload: (f: File) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<DocCategory | "All">("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = catFilter === "All" || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const starred = filtered.filter(d => d.starred);
  const recent = filtered.filter(d => !d.starred).slice(0, 20);

  return (
    <div className="w-72 flex-shrink-0 border-r border-black/10 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-black/8 flex-shrink-0">
        <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Document Library</div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full h-8 pl-8 pr-3 border border-black/15 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 rounded-lg"/>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-black/8 flex-shrink-0">
        <button onClick={onNew} className="flex-1 h-7 bg-[#0f172a] text-white text-[10px] font-semibold flex items-center justify-center gap-1 rounded-lg hover:bg-[#1e293b]">
          <Plus className="h-3 w-3"/> New Doc
        </button>
        <button onClick={()=>fileRef.current?.click()} className="h-7 px-2.5 border border-black/15 text-[10px] text-black/65 flex items-center gap-1 rounded-lg hover:bg-gray-50">
          <Upload className="h-3 w-3"/> Upload
        </button>
        <button onClick={()=>setViewMode(v=>v==="list"?"grid":"list")} className="h-7 w-7 grid place-items-center border border-black/15 text-black/50 rounded-lg hover:bg-gray-50">
          {viewMode==="list"?<Grid className="h-3.5 w-3.5"/>:<ListIcon className="h-3.5 w-3.5"/>}
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e=>{Array.from(e.target.files??[]).forEach(f=>onUpload(f));}}/>
      </div>

      {/* Category filter */}
      <div className="px-3 py-1.5 border-b border-black/8 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          <button onClick={()=>setCatFilter("All")} className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${catFilter==="All"?"bg-black text-white":"bg-black/5 text-black/50 hover:bg-black/10"}`}>All</button>
          {ALL_CATEGORIES.slice(0,6).map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${catFilter===c?"bg-black text-white":"bg-black/5 text-black/50 hover:bg-black/10"}`}>{c.split(" ")[0]}</button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {starred.length > 0 && (
          <div>
            <div className="px-4 py-1.5 text-[9px] font-bold text-black/40 uppercase tracking-wider bg-black/3 flex items-center gap-1.5">
              <Star className="h-3 w-3 text-slate-500 fill-amber-400"/> Starred
            </div>
            {starred.map(d=>(
              <DocRow key={d.id} doc={d} selected={selected?.id===d.id} onSelect={onSelect}/>
            ))}
          </div>
        )}
        <div>
          <div className="px-4 py-1.5 text-[9px] font-bold text-black/40 uppercase tracking-wider bg-black/3 flex items-center gap-1.5">
            <Clock className="h-3 w-3"/> Recent Documents
          </div>
          {recent.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-black/30">No documents found.</div>
          )}
          {recent.map(d=>(
            <DocRow key={d.id} doc={d} selected={selected?.id===d.id} onSelect={onSelect}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocRow({ doc, selected, onSelect }: { doc: LibDoc; selected: boolean; onSelect: (d: LibDoc) => void }) {
  return (
    <button onClick={()=>onSelect(doc)}
      className={`w-full text-left flex items-start gap-2.5 px-4 py-2.5 border-b border-black/5 hover:bg-[#EAF1F8] transition-colors ${selected?"bg-slate-50 border-l-2 border-l-blue-600":""}`}>
      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${TYPE_CLR[doc.type]??"bg-gray-500"}`}>{doc.type}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-black leading-tight truncate">{doc.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLORS[doc.status]}`}>{doc.status}</span>
          <span className="text-[9px] text-black/35">{doc.modified}</span>
          {doc.starred && <Star className="h-2.5 w-2.5 text-slate-500 fill-amber-400"/>}
        </div>
      </div>
    </button>
  );
}

// ── Document Preview Panel (right side) ─────────────────────────────────
function DocPreviewPanel({ doc, onEdit, onOpen }: { doc: LibDoc; onEdit: ()=>void; onOpen: ()=>void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f6f9]">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 px-5 py-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-black truncate">{doc.name}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${CATEGORY_COLORS[doc.category]}`}>{doc.category}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[doc.status]}`}>{doc.status}</span>
            <span className="text-[10px] text-black/40">{doc.size}</span>
            <span className="text-[10px] text-black/40">Modified: {doc.modified}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(doc.type==="DOCX"||doc.type==="TXT"||doc.type==="DOC") && (
            <button onClick={onEdit} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#1e293b]">
              <Edit3 className="h-3.5 w-3.5"/> Open Editor
            </button>
          )}
          <button onClick={onOpen} className="h-8 px-3 border border-black/15 text-xs text-black/60 rounded-lg flex items-center gap-1.5 hover:bg-gray-50">
            <Maximize2 className="h-3.5 w-3.5"/> Full Screen
          </button>
          <button className="h-8 px-3 border border-black/15 text-xs text-black/60 rounded-lg flex items-center gap-1.5 hover:bg-gray-50">
            <Share2 className="h-3.5 w-3.5"/> Share
          </button>
          <button className="h-8 px-3 border border-black/15 text-xs text-black/60 rounded-lg flex items-center gap-1.5 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5"/> Download
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8 min-h-0">
        <div className="bg-white shadow-xl w-full max-w-3xl" style={{minHeight:600}}>
          {/* Word-style header */}
          <div className="bg-[#2b579a] px-6 py-3 flex items-center gap-3">
            <div className={`h-10 w-10 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${TYPE_CLR[doc.type]??"bg-gray-500"}`}>{doc.type}</div>
            <div>
              <div className="text-sm font-bold text-white">{doc.name}</div>
              <div className="text-[10px] text-white/60">{doc.author} · {doc.modified} · {doc.size}</div>
            </div>
          </div>

          {/* Document body preview */}
          <div className="p-10 font-serif" style={{fontFamily:"Calibri,sans-serif",fontSize:12,lineHeight:1.6,color:"#000"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <p style={{fontSize:18,fontWeight:"bold",color:"#0f172a"}}>GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
              <p style={{fontSize:14,fontWeight:600,marginTop:8}}>{doc.name.replace(/\.[^.]+$/,"")}</p>
              <p style={{fontSize:11,color:"#64748b",marginTop:4}}>Reference: {doc.id.toUpperCase()} | Date: {doc.modified} | Author: {doc.author}</p>
            </div>
            <hr style={{borderTop:"2px solid #0f172a",margin:"16px 0"}}/>
            <p style={{marginBottom:12}}>This document has been prepared in accordance with the Public Procurement and Disposal of Public Assets Act (PPDPA) 2018 and Treasury Instructions.</p>
            <p style={{marginBottom:12}}>Category: <strong>{doc.category}</strong> | Status: <strong>{doc.status}</strong></p>
            {doc.tags && doc.tags.length > 0 && (
              <p style={{marginBottom:12}}>Tags: {doc.tags.map(t=>`#${t}`).join(", ")}</p>
            )}
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",padding:16,borderRadius:8,marginTop:16}}>
              <p style={{fontSize:11,color:"#64748b",fontStyle:"italic"}}>
                Document content would appear here. Click "Open Editor" to view and edit the full document content in the rich text editor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata sidebar */}
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-5 py-3 flex items-center gap-6 text-xs text-black/50">
        <div><span className="font-semibold text-black/70">Author:</span> {doc.author}</div>
        <div><span className="font-semibold text-black/70">Created:</span> {doc.created}</div>
        <div><span className="font-semibold text-black/70">Modified:</span> {doc.modified}</div>
        <div><span className="font-semibold text-black/70">ID:</span> <span className="font-mono">{doc.id.toUpperCase()}</span></div>
        {doc.tags && <div><span className="font-semibold text-black/70">Tags:</span> {doc.tags.map(t=>`#${t}`).join(" ")}</div>}
      </div>
    </div>
  );
}

// ── Blank state when nothing selected ────────────────────────────────────
function EmptyState({ onNew }: { onNew: ()=>void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f6f9] gap-4">
      <div className="h-20 w-20 rounded-2xl bg-white border border-black/8 shadow-sm flex items-center justify-center">
        <FileText className="h-10 w-10 text-black/20"/>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-black/50">Select a document</div>
        <div className="text-sm text-black/30 mt-1">Choose a document from the library on the left to view or edit it</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onNew} className="h-9 px-5 bg-[#0f172a] text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] flex items-center gap-2">
          <Plus className="h-4 w-4"/> Create New Document
        </button>
        <div className="text-xs text-black/30">or upload from your computer</div>
      </div>
    </div>
  );
}

// ── Main DocumentEditorPage ───────────────────────────────────────────────
export default function DocumentEditorPage() {
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState<LibDoc[]>(DEMO_DOCS);
  const [selected, setSelected] = useState<LibDoc | null>(null);
  const [editing, setEditing] = useState<LibDoc | null>(null);
  const navigate = useNavigate();

  // Pre-select document from URL query ?docId=xxx
  useEffect(() => {
    const docId = searchParams.get("docId");
    if (docId) {
      const doc = docs.find(d => d.id === docId);
      if (doc) setSelected(doc);
    }
  }, [searchParams, docs]);

  const handleNew = () => {
    const newDoc: LibDoc = {
      id: `d${Date.now()}`, name: `New Document — ${new Date().toLocaleDateString("en-GB")}.docx`,
      type: "DOCX", category: "Other", size: "—",
      created: new Date().toISOString().split("T")[0],
      modified: new Date().toISOString().split("T")[0],
      status: "Draft", author: "Current User", content: "",
    };
    setDocs(prev => [newDoc, ...prev]);
    setSelected(newDoc);
    setEditing(newDoc);
  };

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "DOC";
    const size = file.size > 1024*1024 ? `${(file.size/1024/1024).toFixed(1)} MB` : `${Math.round(file.size/1024)} KB`;
    const newDoc: LibDoc = {
      id: `u${Date.now()}`, name: file.name, type: ext, category: "Other",
      size, created: new Date().toISOString().split("T")[0],
      modified: new Date().toISOString().split("T")[0],
      status: "Draft", author: "Current User", content: url,
    };
    setDocs(prev => [newDoc, ...prev]);
    setSelected(newDoc);
    pushNotification(`Uploaded: ${file.name}`, "success");
  };

  const handleSaveContent = (content: string) => {
    if (!editing) return;
    setDocs(prev => prev.map(d => d.id===editing.id ? {...d, content, modified: new Date().toISOString().split("T")[0], status: "Draft"} : d));
    setSelected(prev => prev?.id===editing.id ? {...prev, content} : prev);
  };

  return (
    <>
      {editing && (
        <RichEditor
          doc={editing}
          onClose={()=>setEditing(null)}
          onSave={handleSaveContent}
        />
      )}
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Document Management"
        process="Document Editor"
        financialYear="FY2026"
        pageType="form"
      />
        <div className="flex flex-col h-[calc(100vh-56px)]">
          {/* Page header */}
          <div className="flex-shrink-0 bg-white border-b border-black/8 px-6 py-3 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-black">Document Editor & Library</h1>
              <p className="text-xs text-black/40 mt-0.5">Create, edit and manage all procurement documents — BOQ, TOR, contracts, reports, minutes and more</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-black/40 bg-black/5 px-3 py-1 rounded-full">{docs.length} documents</span>
              <button onClick={handleNew} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#1e293b]">
                <Plus className="h-3.5 w-3.5"/> New Document
              </button>
            </div>
          </div>

          {/* Main 2-panel layout */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <DocLibraryPanel
              docs={docs}
              selected={selected}
              onSelect={setSelected}
              onNew={handleNew}
              onUpload={handleUpload}
            />
            {selected ? (
              <DocPreviewPanel
                doc={selected}
                onEdit={()=>setEditing(selected)}
                onOpen={()=>setEditing(selected)}
              />
            ) : (
              <EmptyState onNew={handleNew}/>
            )}
          </div>
        </div>
      </AppShell>
    </>
  );
}

