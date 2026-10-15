/**
 * InlineWorkbench — embeddable workbench panel with live document editor,
 * board meeting pack, and evaluation forms. Used across HR, Budget,
 * Contracts, Vendors, and other module pages.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  FileText, ChevronDown, ChevronUp, Plus, Save, Download,
  Printer, Upload, Eye, X, Users, Calendar, Edit3, CheckCircle2,
  AlertCircle, Lock, Send, BarChart3, Briefcase, FolderOpen,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Type, Palette, Link2, Image, Table, Search,
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight,
  FileSignature, RotateCcw, Copy, Scissors, Clipboard,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ─── Types ────────────────────────────────────────────────────────────────
type WbDoc = { name: string; type: string; size: string; url?: string; content?: string };

type Meeting = {
  id: string; name: string; date: string; time: string; venue: string;
  status: "SCHEDULED" | "CONCLUDED" | "CANCELLED";
  agenda: string[]; documents: WbDoc[];
};

interface InlineWorkbenchProps {
  context?: string;
  defaultOpen?: boolean;
}

const TYPE_CLR: Record<string, string> = {
  PDF: "bg-red-500", XLSX: "bg-[#0F172A]", DOCX: "bg-[#0F172A]",
  PPTX: "bg-[#0F172A]", TXT: "bg-gray-500",
};

// ─── Rich Document Editor (MS Word/Google Docs quality) ──────────────────
function RichDocEditor({ doc, onClose, onSave }: { doc: WbDoc; onClose: () => void; onSave?: (content: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [wordCount, setWordCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [findText, setFindText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Initialize content
  useEffect(() => {
    if (editorRef.current && doc.content) {
      editorRef.current.innerHTML = doc.content;
    } else if (editorRef.current) {
      editorRef.current.innerHTML = `
        <div style="text-align:center; margin-bottom: 24px;">
          <p style="font-size:18px; font-weight:bold; color:#0f172a;">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
          <p style="font-size:14px; font-weight:600; color:#1e293b;">${doc.name.replace(/\.[^.]+$/, "")}</p>
          <p style="font-size:11px; color:#64748b;">Document Reference: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p style="font-size:11px; color:#64748b;">Date: ${new Date().toLocaleDateString("en-GB")}</p>
        </div>
        <p><br/></p>
        <p>This document has been prepared in accordance with the Public Procurement and Disposal of Public Assets Act (PPDPA) 2018 and Treasury Instructions. All procurement activities have been conducted transparently and in compliance with applicable regulations.</p>
        <p><br/></p>
        <p>Click anywhere in this document area to start editing. Use the toolbar above to format your text.</p>
      `;
    }
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
    onSave?.(content);
    setSaved(true);
    pushNotification(`Document saved: ${doc.name}`, "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrint = () => {
    const content = editorRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>${doc.name}</title>
      <style>
        body { font-family: Calibri, sans-serif; font-size: 12pt; margin: 2.5cm; color: #000; line-height: 1.5; }
        @page { size: A4; margin: 2.5cm; }
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const FONTS = ["Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Courier New", "Cambria"];
  const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","24","28","32","36","48","72"];
  const COLORS = ["#000000","#0f172a","#1e3a5f","#0F172A","#047857","#7c2d12","#831843","#dc2626","#64748B","#374151","#6b7280","#ffffff"];

  const containerCls = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-white"
    : "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4";

  const panelCls = fullscreen
    ? "flex flex-col flex-1 min-h-0 overflow-hidden bg-white"
    : "bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden" ;

  const panelStyle = fullscreen
    ? { height: "100%" }
    : { maxHeight: "92vh" };

  return (
    <div className={containerCls}>
      <div className={panelCls} style={panelStyle}>
        {/* MS Word-style ribbon */}
        <div className="bg-[#2b579a] flex-shrink-0">
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/15">
            <div className="flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white truncate max-w-xs">{doc.name}</span>
              {saved && <span className="text-[10px] text-slate-400 font-medium">● Saved</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleSave}
                className="h-6 px-2.5 text-[10px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 transition-colors" style={{ borderRadius: 4 }}>
                <Save className="h-3 w-3" /> Save
              </button>
              <button onClick={handlePrint}
                className="h-6 px-2.5 text-[10px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 transition-colors" style={{ borderRadius: 4 }}>
                <Printer className="h-3 w-3" /> Print
              </button>
              {doc.url && (
                <a href={doc.url} download={doc.name}
                  className="h-6 px-2.5 text-[10px] font-semibold bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 transition-colors" style={{ borderRadius: 4 }}>
                  <Download className="h-3 w-3" /> Download
                </a>
              )}
              <button onClick={() => setFullscreen(v => !v)}
                className="h-6 w-6 grid place-items-center bg-white/15 hover:bg-white/25 text-white transition-colors" style={{ borderRadius: 4 }}>
                {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </button>
              <button onClick={onClose}
                className="h-6 w-6 grid place-items-center bg-red-600/80 hover:bg-red-500 text-white transition-colors" style={{ borderRadius: 4 }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {/* Ribbon tabs */}
          <div className="flex items-center gap-0 px-2 pt-1 border-b border-white/10">
            {["Home","Insert","Layout","Review","View"].map((tab, i) => (
              <button key={tab} className={`px-3 py-1 text-[11px] font-medium border-b-2 transition-colors ${i === 0 ? "border-white text-white" : "border-transparent text-white/60 hover:text-white"}`}>
                {tab}
              </button>
            ))}
          </div>
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 px-3 py-1.5 flex-wrap">
            {/* Font family */}
            <select value={fontFamily} onChange={e => { setFontFamily(e.target.value); execCmd("fontName", e.target.value); }}
              className="h-6 px-1 text-[11px] bg-white text-black border-0 focus:outline-none" style={{ borderRadius: 2, minWidth: 80 }}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {/* Font size */}
            <select value={fontSize} onChange={e => { setFontSize(e.target.value); execCmd("fontSize", "3"); }}
              className="h-6 px-1 text-[11px] bg-white text-black border-0 focus:outline-none" style={{ borderRadius: 2, width: 42 }}>
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            {/* Bold/Italic/Underline */}
            {[
              { icon: Bold,      cmd: "bold",         label: "B", style: "font-bold" },
              { icon: Italic,    cmd: "italic",       label: "I", style: "italic" },
              { icon: Underline, cmd: "underline",    label: "U", style: "underline" },
            ].map(({ icon: Icon, cmd, label, style }) => (
              <button key={cmd} onClick={() => execCmd(cmd)} title={label}
                className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white transition-colors" style={{ borderRadius: 2 }}>
                <Icon className="h-3 w-3" />
              </button>
            ))}
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            {/* Alignment */}
            {[
              { icon: AlignLeft,    cmd: "justifyLeft"   },
              { icon: AlignCenter,  cmd: "justifyCenter" },
              { icon: AlignRight,   cmd: "justifyRight"  },
              { icon: AlignJustify, cmd: "justifyFull"   },
            ].map(({ icon: Icon, cmd }) => (
              <button key={cmd} onClick={() => execCmd(cmd)}
                className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white transition-colors" style={{ borderRadius: 2 }}>
                <Icon className="h-3 w-3" />
              </button>
            ))}
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            {/* Lists */}
            <button onClick={() => execCmd("insertUnorderedList")}
              className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white transition-colors" style={{ borderRadius: 2 }}>
              <List className="h-3 w-3" />
            </button>
            <button onClick={() => execCmd("insertOrderedList")}
              className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white transition-colors" style={{ borderRadius: 2 }}>
              <ListOrdered className="h-3 w-3" />
            </button>
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            {/* Color picker */}
            <div className="relative group">
              <button className="h-6 px-1.5 flex items-center gap-1 bg-white/10 hover:bg-white/30 text-white transition-colors" style={{ borderRadius: 2 }}>
                <Palette className="h-3 w-3" />
                <span className="text-[10px]">Color</span>
              </button>
              <div className="absolute top-7 left-0 z-10 hidden group-hover:flex gap-0.5 flex-wrap p-1.5 bg-white rounded-lg shadow-xl border border-black/10" style={{ width: 132 }}>
                {COLORS.map(color => (
                  <button key={color} onClick={() => execCmd("foreColor", color)}
                    className="h-5 w-5 rounded border border-black/10 hover:scale-110 transition-transform"
                    style={{ background: color }} />
                ))}
              </div>
            </div>
            {/* Heading styles */}
            <select onChange={e => { execCmd("formatBlock", e.target.value); e.target.value = ""; }}
              className="h-6 px-1 text-[11px] bg-white/10 text-white border-0 focus:outline-none hover:bg-white/20" style={{ borderRadius: 2, width: 90 }}
              defaultValue="">
              <option value="" disabled>Paragraph ▼</option>
              <option value="p">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code</option>
            </select>
            <div className="h-4 w-px bg-white/20 mx-0.5" />
            {/* Undo/Redo */}
            <button onClick={() => execCmd("undo")} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white" style={{ borderRadius: 2 }}>
              <RotateCcw className="h-3 w-3" />
            </button>
            {/* Find */}
            <button onClick={() => setShowFind(v => !v)} className="h-6 px-1.5 flex items-center gap-1 bg-white/10 hover:bg-white/30 text-white ml-auto" style={{ borderRadius: 2 }}>
              <Search className="h-3 w-3" />
              <span className="text-[10px]">Find</span>
            </button>
            {/* Zoom */}
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white" style={{ borderRadius: 2 }}>
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="text-[10px] text-white/70 w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/30 text-white" style={{ borderRadius: 2 }}>
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>
          {/* Find bar */}
          {showFind && (
            <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/15 bg-[#1d4ed8]">
              <Search className="h-3 w-3 text-white/70" />
              <input value={findText} onChange={e => setFindText(e.target.value)}
                placeholder="Find in document…"
                className="flex-1 h-6 px-2 text-[11px] bg-white/20 text-white placeholder-white/50 border-0 focus:outline-none focus:ring-1 focus:ring-white/40" style={{ borderRadius: 3 }} />
              <button onClick={() => (window as unknown as {find:(t:string,b:boolean)=>void}).find(findText, false)}
                className="h-6 px-2 text-[10px] bg-white/20 hover:bg-white/30 text-white" style={{ borderRadius: 3 }}>
                Find
              </button>
              <button onClick={() => setShowFind(false)} className="text-white/60 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Page ruler */}
        <div className="flex-shrink-0 bg-[#e8e8e8] border-b border-gray-300 h-5 flex items-center px-4">
          <div className="w-full h-px bg-gray-400 relative">
            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => (
              <div key={n} className="absolute flex flex-col items-center" style={{ left: `${(n / 17) * 100}%` }}>
                <div className="w-px h-2 bg-gray-500" />
                <span className="text-[7px] text-gray-500 mt-0.5">{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document area */}
        <div className="flex-1 overflow-auto bg-[#d0d0d0]" style={{ minHeight: 0 }}>
          <div className="flex justify-center py-6 px-4">
            <div
              style={{
                width: `${zoom * 6.3}px`,
                minHeight: `${zoom * 8.9}px`,
                maxWidth: "100%",
                background: "white",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                padding: `${zoom * 0.9}px ${zoom * 1.1}px`,
                fontSize: `${zoom * 0.12}px`,
              }}
            >
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateWordCount}
                style={{
                  outline: "none",
                  minHeight: `${zoom * 7}px`,
                  fontFamily: fontFamily,
                  fontSize: `${parseInt(fontSize) * zoom / 100}pt`,
                  lineHeight: 1.6,
                  color: "#000",
                }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex-shrink-0 bg-[#2b579a] px-3 py-1 flex items-center gap-4 text-[10px] text-white/60">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{doc.name}</span>
          <span>·</span>
          <span className="text-white/40">Document Editor</span>
          <div className="ml-auto flex items-center gap-2">
            <span>Zoom: {zoom}%</span>
            <button onClick={handleSave}
              className="h-5 px-2 bg-white/15 hover:bg-white/25 text-white text-[10px] rounded transition-colors">
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Document Viewer (read-only for non-editable docs) ───────────────────
function DocViewer({ doc, onClose, onEdit }: { doc: WbDoc; onClose: () => void; onEdit?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-[#0f172a] text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold truncate">{doc.name}</span>
            <span className="text-[10px] text-white/50">{doc.size}</span>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit}
                className="h-7 px-3 text-[10px] bg-[#0F172A] hover:bg-[#0F172A] text-white flex items-center gap-1 rounded">
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            )}
            {doc.url && (
              <a href={doc.url} download={doc.name}
                className="h-7 px-3 text-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 rounded">
                <Download className="h-3 w-3" /> Download
              </a>
            )}
            <button onClick={onClose} className="h-7 w-7 grid place-items-center bg-red-700/80 hover:bg-red-600 text-white rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6">
          {doc.type === "PDF" && doc.url ? (
            <iframe src={doc.url} className="w-full h-[600px] border-0 rounded-lg shadow" title={doc.name} />
          ) : (
            <div className="bg-white rounded-xl shadow-md w-full max-w-2xl p-8 space-y-4">
              <div className={`h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto ${TYPE_CLR[doc.type] ?? "bg-gray-500"}`}>
                {doc.type}
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-black">{doc.name}</div>
                <div className="text-sm text-black/50 mt-1">{doc.size}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-black/60 text-center">
                {doc.type === "DOCX" || doc.type === "TXT"
                  ? <button onClick={onEdit} className="text-[#0F172A] underline font-medium">Click "Edit" to open in document editor</button>
                  : <>Document preview available for PDF files. For {doc.type} files, please download to view.</>
                }
              </div>
              {onEdit && (doc.type === "DOCX" || doc.type === "TXT") && (
                <button onClick={onEdit}
                  className="w-full h-9 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-2">
                  <Edit3 className="h-4 w-4" /> Open in Document Editor
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Document Manager Tab ─────────────────────────────────────────────────
function DocumentManager({ context }: { context: string }) {
  const [docs, setDocs] = useState<WbDoc[]>([
    { name: `${context} Policy Framework 2026.pdf`,   type: "PDF",  size: "2.4 MB" },
    { name: `${context} Budget Allocation FY26.xlsx`, type: "XLSX", size: "890 KB" },
    { name: `${context} Annual Report 2025.pdf`,      type: "PDF",  size: "4.1 MB" },
    { name: `${context} Standard Operating Procedure.docx`, type: "DOCX", size: "310 KB" },
    { name: `${context} Meeting Minutes June 2026.docx`, type: "DOCX", size: "180 KB" },
  ]);
  const [viewDoc, setViewDoc] = useState<WbDoc | null>(null);
  const [editDoc, setEditDoc] = useState<WbDoc | null>(null);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      const url = URL.createObjectURL(f);
      const ext = f.name.split(".").pop()?.toUpperCase() ?? "DOC";
      const size = f.size > 1024 * 1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`;
      setDocs(prev => [...prev, { name: f.name, type: ext, size, url }]);
    });
    pushNotification(`${files.length} document(s) uploaded`, "success");
  };

  const handleSaveContent = (doc: WbDoc, content: string) => {
    setDocs(prev => prev.map(d => d.name === doc.name ? { ...d, content } : d));
    setEditDoc(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {viewDoc && (
        <DocViewer
          doc={viewDoc}
          onClose={() => setViewDoc(null)}
          onEdit={viewDoc.type === "DOCX" || viewDoc.type === "TXT" ? () => { setEditDoc(viewDoc); setViewDoc(null); } : undefined}
        />
      )}
      {editDoc && (
        <RichDocEditor
          doc={editDoc}
          onClose={() => setEditDoc(null)}
          onSave={(content) => handleSaveContent(editDoc, content)}
        />
      )}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/8 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full h-8 pl-8 pr-3 border border-black/15 text-xs focus:outline-none" style={{ borderRadius: 0 }} />
          <FolderOpen className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/35" />
        </div>
        <button onClick={() => fileRef.current?.click()}
          className="h-8 px-3 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1e293b]"
          style={{ borderRadius: 0 }}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
        <button onClick={() => setEditDoc({ name: `New Document — ${new Date().toLocaleDateString()}.docx`, type: "DOCX", size: "—" })}
          className="h-8 px-3 border border-slate-200 text-[#0F172A] bg-slate-50 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
          style={{ borderRadius: 0 }}>
          <Edit3 className="h-3.5 w-3.5" /> New Doc
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-black/30 text-sm">No documents found.</div>
        )}
        {filtered.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5 hover:bg-gray-50 transition-colors">
            <div className={`h-8 w-8 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${TYPE_CLR[doc.type] ?? "bg-gray-500"}`}
              style={{ borderRadius: 4 }}>{doc.type}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-black truncate">{doc.name}</div>
              <div className="text-[10px] text-black/40">{doc.size}</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewDoc(doc)}
                className="h-7 px-2.5 border border-black/15 text-[10px] text-black/65 flex items-center gap-1 hover:bg-black/5"
                style={{ borderRadius: 0 }}>
                <Eye className="h-3 w-3" /> View
              </button>
              {(doc.type === "DOCX" || doc.type === "TXT") && (
                <button onClick={() => setEditDoc(doc)}
                  className="h-7 px-2.5 border border-slate-200 text-[10px] text-[#0F172A] bg-slate-50 flex items-center gap-1 hover:bg-slate-100"
                  style={{ borderRadius: 0 }}>
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
              )}
              {doc.url && (
                <a href={doc.url} download={doc.name}
                  className="h-7 px-2.5 border border-black/15 text-[10px] text-black/65 flex items-center gap-1 hover:bg-black/5"
                  style={{ borderRadius: 0 }}>
                  <Download className="h-3 w-3" /> Save
                </a>
              )}
              <button onClick={() => setDocs(p => p.filter((_, xi) => xi !== i))}
                className="h-7 w-7 grid place-items-center text-red-400 hover:bg-red-50 border border-transparent hover:border-red-200"
                style={{ borderRadius: 0 }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Board Meeting Pack Tab ───────────────────────────────────────────────
const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: "m1", name: "Monthly Management Meeting", date: "2026-07-10", time: "09:00",
    venue: "Boardroom A, Main Building", status: "SCHEDULED",
    agenda: ["Quorum & opening","Previous minutes","Financial performance review","HR & operational updates","Any other business","Close"],
    documents: [
      { name: "Board Pack Cover.pdf",           type: "PDF",  size: "124 KB" },
      { name: "Management Accounts Jun 2026.xlsx",type:"XLSX", size: "780 KB" },
      { name: "HR Summary Report.pdf",           type: "PDF",  size: "340 KB" },
    ],
  },
  {
    id: "m2", name: "Quarterly Strategy Review", date: "2026-07-25", time: "14:00",
    venue: "Virtual (Teams)", status: "SCHEDULED",
    agenda: ["Strategic priorities review","KPI dashboard walkthrough","Resource allocation","Q3 planning","AOB"],
    documents: [
      { name: "Q2 Strategy Report.pdf",  type: "PDF",  size: "2.1 MB" },
      { name: "KPI Dashboard.pptx",     type: "PPTX", size: "3.4 MB" },
    ],
  },
];

function BoardPackTab({ context }: { context: string }) {
  const [meetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [open, setOpen] = useState<Meeting | null>(null);
  const [editorTab, setEditorTab] = useState<"agenda"|"minutes"|"documents">("agenda");
  const [minutes, setMinutes] = useState("");
  const [viewDoc, setViewDoc] = useState<WbDoc | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [meetDocs, setMeetDocs] = useState<WbDoc[]>(open?.documents ?? []);

  const handleSave = () => {
    setSaved(true);
    pushNotification("Board pack saved", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const statusCls: Record<string, string> = {
    SCHEDULED: "bg-slate-100 text-[#0F172A]",
    CONCLUDED: "bg-slate-100 text-[#0F172A]",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (open) {
    const docs = open.documents;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {viewDoc && <DocViewer doc={viewDoc} onClose={() => setViewDoc(null)} />}
        {/* Top bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap">
          <button onClick={() => setOpen(null)} className="h-7 px-2 text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 rounded hover:bg-gray-100">
            ← Back
          </button>
          <span className="text-sm font-bold text-gray-900">{open.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCls[open.status]}`}>{open.status}</span>
          <div className="flex-1" />
          {saved && <span className="text-xs text-[#0F172A] font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
          <button onClick={handleSave} className="h-7 px-3 bg-[#0F172A] text-white rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0F172A]">
            <Save className="h-3.5 w-3.5" /> Save
          </button>
          <button onClick={() => pushNotification("Board pack exported as PDF", "info")}
            className="h-7 px-3 border border-gray-200 text-gray-600 rounded text-xs flex items-center gap-1 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={() => pushNotification("Printing board pack…", "info")}
            className="h-7 px-3 border border-gray-200 text-gray-600 rounded text-xs flex items-center gap-1 hover:bg-gray-50">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
        {/* Blue meta bar */}
        <div className="flex-shrink-0 bg-[#0F172A] px-5 py-2 text-white flex gap-6 flex-wrap text-xs">
          <div><div className="text-[9px] text-slate-300 uppercase">Date & Time</div><div className="font-bold">{open.date} · {open.time}</div></div>
          <div><div className="text-[9px] text-slate-300 uppercase">Venue</div><div className="font-bold">{open.venue}</div></div>
          <div><div className="text-[9px] text-slate-300 uppercase">Context</div><div className="font-bold">{context}</div></div>
        </div>
        {/* Sub-tabs */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 flex">
          {(["agenda","minutes","documents"] as const).map(t => (
            <button key={t} onClick={() => setEditorTab(t)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors ${editorTab===t?"border-slate-200 text-[#0F172A]":"border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "agenda" ? "📋 Agenda" : t === "minutes" ? "✍️ Minutes" : "📁 Documents"}
            </button>
          ))}
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {editorTab === "agenda" && (
            <div className="max-w-2xl space-y-2">
              <div className="text-sm font-bold text-gray-900 mb-3">Meeting Agenda</div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {open.agenda.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-slate-50/40">
                    <span className="h-5 w-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    <span className="text-sm text-gray-700 flex-1">{item}</span>
                    <Edit3 className="h-3.5 w-3.5 text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {editorTab === "minutes" && (
            <div className="max-w-2xl space-y-3">
              <div className="text-sm font-bold text-gray-900">Meeting Minutes</div>
              <textarea value={minutes} onChange={e => setMinutes(e.target.value)} rows={12}
                placeholder={`Minutes for: ${open.name}\nDate: ${open.date} · ${open.time}\nVenue: ${open.venue}\n\nPresent:\n\nApologies:\n\nProceedings:\n`}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 leading-relaxed" />
              <div className="flex gap-2">
                <button onClick={handleSave} className="h-8 px-4 bg-[#0F172A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0F172A]">
                  <Save className="h-3.5 w-3.5" /> Save Minutes
                </button>
                <button className="h-8 px-4 border border-gray-200 text-gray-600 rounded-lg text-xs flex items-center gap-1.5 hover:bg-gray-50">
                  <Download className="h-3.5 w-3.5" /> Export DOCX
                </button>
              </div>
            </div>
          )}
          {editorTab === "documents" && (
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">Board Pack Documents</div>
                <button onClick={() => fileRef.current?.click()}
                  className="h-7 px-3 bg-[#0F172A] text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-[#0F172A]">
                  <Upload className="h-3 w-3" /> Upload
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={e => {
                  if (!e.target.files) return;
                  Array.from(e.target.files).forEach(f => {
                    const url = URL.createObjectURL(f);
                    const ext = f.name.split(".").pop()?.toUpperCase() ?? "DOC";
                    const size = f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} MB` : `${Math.round(f.size/1024)} KB`;
                    open.documents.push({ name: f.name, type: ext, size, url });
                  });
                  pushNotification("Documents uploaded", "success");
                }} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${TYPE_CLR[doc.type] ?? "bg-gray-500"}`}>{doc.type}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{doc.name}</div>
                      <div className="text-[11px] text-gray-400">{doc.size}</div>
                    </div>
                    <button onClick={() => setViewDoc(doc)} className="h-7 px-3 text-xs text-[#0F172A] hover:bg-slate-50 rounded-lg font-medium flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View
                    </button>
                    {doc.url && (
                      <a href={doc.url} download={doc.name} className="h-7 px-3 text-xs text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                        <Download className="h-3 w-3" /> Download
                      </a>
                    )}
                  </div>
                ))}
                {docs.length === 0 && <div className="px-4 py-6 text-center text-xs text-gray-400">No documents uploaded yet.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="text-xs text-black/40 mb-3">Click <strong>Open Board Pack</strong> to edit agenda, minutes, and manage documents.</div>
      {meetings.map(m => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
          <div className={`h-1 ${m.status==="SCHEDULED"?"bg-[#0F172A]":m.status==="CONCLUDED"?"bg-[#0F172A]":"bg-red-500"}`} />
          <div className="p-4 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#0F172A] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm font-bold text-gray-900">{m.name}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCls[m.status]}`}>{m.status}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{m.date} · {m.time} · {m.venue}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {m.documents.map((d, i) => (
                  <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 text-white rounded ${TYPE_CLR[d.type]??"bg-gray-500"}`}>{d.type}</span>
                ))}
              </div>
            </div>
            <button onClick={() => { setOpen(m); setEditorTab("agenda"); setMinutes(""); }}
              className="h-8 px-3 bg-[#0F172A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 flex-shrink-0 hover:bg-[#0F172A]">
              <FileText className="h-3.5 w-3.5" /> Open Board Pack
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────
const TASK_STATUSES = ["Pending","In Progress","Completed","Overdue"] as const;
type TaskStatus = typeof TASK_STATUSES[number];

function TasksTab({ context }: { context: string }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: `Review ${context} quarterly report`, due: "2026-07-10", priority: "High",    status: "Pending"     as TaskStatus },
    { id: 2, title: `Approve ${context} budget variance`, due: "2026-07-08", priority: "High",    status: "Overdue"     as TaskStatus },
    { id: 3, title: `Update ${context} risk register`,    due: "2026-07-15", priority: "Medium",  status: "In Progress" as TaskStatus },
    { id: 4, title: `Submit ${context} compliance report`,due: "2026-07-20", priority: "Low",     status: "Pending"     as TaskStatus },
    { id: 5, title: `Team ${context} performance review`, due: "2026-07-25", priority: "Medium",  status: "Completed"   as TaskStatus },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");

  const priorityCls: Record<string, string> = {
    High: "bg-red-100 text-red-700", Medium: "bg-slate-100 text-[#0F172A]", Low: "bg-slate-100 text-[#0F172A]",
  };
  const statusCls: Record<TaskStatus, string> = {
    Pending: "bg-gray-100 text-gray-600", "In Progress": "bg-slate-100 text-[#0F172A]",
    Completed: "bg-slate-100 text-[#0F172A]", Overdue: "bg-red-100 text-red-700",
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks(p => [...p, { id: Date.now(), title: newTitle, due: newDue || "TBD", priority: "Medium", status: "Pending" }]);
    setNewTitle(""); setNewDue("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Add task */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-black/8 flex-wrap">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key==="Enter" && addTask()}
          placeholder="Add new task…" className="flex-1 min-w-[160px] h-8 px-3 border border-black/15 text-xs focus:outline-none" style={{ borderRadius: 0 }} />
        <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
          className="h-8 px-2 border border-black/15 text-xs focus:outline-none" style={{ borderRadius: 0 }} />
        <button onClick={addTask} className="h-8 px-3 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1" style={{ borderRadius: 0 }}>
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5 hover:bg-gray-50">
            <input type="checkbox" checked={task.status==="Completed"}
              onChange={() => setTasks(p => p.map(t => t.id===task.id ? { ...t, status: t.status==="Completed" ? "Pending" : "Completed" } : t))}
              className="h-4 w-4 accent-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium ${task.status==="Completed" ? "line-through text-black/40" : "text-black"}`}>{task.title}</div>
              <div className="text-[10px] text-black/40 mt-0.5">Due: {task.due}</div>
            </div>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${priorityCls[task.priority]}`}>{task.priority}</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusCls[task.status]}`}>{task.status}</span>
            <button onClick={() => setTasks(p => p.filter(t => t.id !== task.id))} className="text-red-400 hover:text-red-600 flex-shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────
type WbTab = "documents" | "board-pack" | "tasks";

const WB_TABS: { id: WbTab; label: string; Icon: React.ElementType }[] = [
  { id: "documents",  label: "Documents",       Icon: FolderOpen  },
  { id: "board-pack", label: "Meeting Board Pack", Icon: FileText  },
  { id: "tasks",      label: "Tasks & Actions", Icon: CheckCircle2 },
];

export default function InlineWorkbench({ context = "Module", defaultOpen = false }: InlineWorkbenchProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<WbTab>("documents");

  return (
    <div className={`flex flex-col border-t border-black/10 bg-white transition-all ${open ? "h-[420px]" : "h-11"} flex-shrink-0`}>
      {/* Header toggle bar */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#0f172a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{context} Workbench</span>
          {open && (
            <div className="flex ml-3">
              {WB_TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold border-b-2 transition-colors
                    ${activeTab === id ? "border-slate-200 text-white" : "border-transparent text-white/50 hover:text-white"}`}>
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setOpen(v => !v)}
          className="h-7 px-3 text-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center gap-1"
          style={{ borderRadius: 0 }}>
          {open ? <><ChevronDown className="h-3.5 w-3.5" /> Collapse</> : <><ChevronUp className="h-3.5 w-3.5" /> Open Workbench</>}
        </button>
      </div>

      {/* Content */}
      {open && (
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "documents"  && <DocumentManager context={context} />}
          {activeTab === "board-pack" && <BoardPackTab context={context} />}
          {activeTab === "tasks"      && <TasksTab context={context} />}
        </div>
      )}
    </div>
  );
}

