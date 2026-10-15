/**
 * ProcurementDocumentTemplate
 * Government of Zimbabwe / Ministry of Finance masthead wrapper used
 * by ALL 5 procurement documents (Bid Opening Register, Evaluation Score Sheets,
 * Award Recommendation Letter, Letter of Award).
 *
 * Renders: gov masthead → ministry/department context → reference/date row → {children}
 * → DocumentAuthenticityFooter
 */
import { Printer, Download, Share2, Eye, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { DocumentAuthenticityFooter, type DigitalSigner, type RelationshipManager } from "./DocumentAuthenticityFooter";

export type ProcDocMeta = {
  referenceNumber: string;
  date: string;
  ministry: string;
  department: string;
  procuringEntity: string;
  financialYear: string;
  tenderNumber?: string;
  tenderTitle?: string;
  serialNumber: string;
  auditTrailNumber: string;
  signers?: DigitalSigner[];
  relationshipManager?: RelationshipManager;
  reportClassification?: string;
  currency?: string;
};

type Props = {
  meta: ProcDocMeta;
  documentTitle: string;
  documentSubtitle?: string;
  children: React.ReactNode;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPreview?: () => void;
  className?: string;
};

export function ProcurementDocumentTemplate({
  meta,
  documentTitle,
  documentSubtitle,
  children,
  onPrint,
  onDownload,
  onShare,
  onPreview,
  className = "",
}: Props) {
  const [fullScreen, setFullScreen] = useState(false);

  const wrapper = fullScreen ? "fixed inset-0 z-50 overflow-auto bg-white" : "";

  return (
    <div className={`${wrapper} ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#2b579a] text-white px-4 py-2 print:hidden">
        <span className="text-sm font-semibold">{documentTitle}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onPrint} title="Print">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onShare} title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={onPreview} title="Preview">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setFullScreen(f => !f)} title={fullScreen ? "Exit Full Screen" : "Full Screen"}>
            {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* A4-style document area */}
      <div className="bg-gray-200 p-6 min-h-screen print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded print:shadow-none print:rounded-none">
          <div className="p-8">
            {/* ── Gov Masthead ── */}
            <div className="bg-[#0f172a] text-white px-6 py-4 -mx-8 -mt-8 mb-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
              <p className="text-sm font-semibold mt-0.5">{meta.ministry}</p>
              <p className="text-xs text-slate-300">{meta.department}</p>
            </div>

            {/* System sub-header */}
            <div className="text-center border-b pb-4 mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Electronic Government Procurement System (E-GP)</p>
              <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900 mt-1">{documentTitle}</h1>
              {documentSubtitle && <p className="text-sm text-gray-600 mt-1">{documentSubtitle}</p>}
            </div>

            {/* Reference / date row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 text-xs">
              <div className="border border-gray-200 rounded p-2">
                <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Reference No.</p>
                <p className="font-bold text-gray-900">{meta.referenceNumber}</p>
              </div>
              <div className="border border-gray-200 rounded p-2">
                <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Date</p>
                <p className="font-bold text-gray-900">{meta.date}</p>
              </div>
              <div className="border border-gray-200 rounded p-2">
                <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Financial Year</p>
                <p className="font-bold text-gray-900">{meta.financialYear}</p>
              </div>
              <div className="border border-gray-200 rounded p-2">
                <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Procuring Entity</p>
                <p className="font-bold text-gray-900">{meta.procuringEntity}</p>
              </div>
              {meta.tenderNumber && (
                <div className="border border-gray-200 rounded p-2 col-span-2">
                  <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Tender Number</p>
                  <p className="font-bold text-gray-900">{meta.tenderNumber}</p>
                </div>
              )}
              {meta.tenderTitle && (
                <div className="border border-gray-200 rounded p-2 col-span-2">
                  <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Tender Title</p>
                  <p className="font-bold text-gray-900">{meta.tenderTitle}</p>
                </div>
              )}
            </div>

            {/* Document body */}
            {children}

            {/* Authenticity footer */}
            <DocumentAuthenticityFooter
              serialNumber={meta.serialNumber}
              auditTrailNumber={meta.auditTrailNumber}
              signers={meta.signers}
              relationshipManager={meta.relationshipManager}
              reportClassification={meta.reportClassification}
              currency={meta.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
