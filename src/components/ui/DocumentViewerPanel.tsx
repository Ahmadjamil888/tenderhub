import { useState } from "react";
import { Card, CardContent, CardHeader } from "./card";
import { Button } from "./button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Download, 
  X, 
  Paperclip,
  Eye,
  EyeOff
} from "lucide-react";

type Document = {
  id: string;
  name: string;
  type: "pdf" | "letter" | "notification";
  content?: string;
  url?: string;
};

type DocumentViewerPanelProps = {
  documents?: Document[];
  currentDocument?: Document;
  onDocumentChange?: (doc: Document) => void;
  onAttach?: (file: File) => void;
  onPrint?: () => void;
  onDownload?: () => void;
  className?: string;
  defaultVisible?: boolean;
};

export function DocumentViewerPanel({
  documents = [],
  currentDocument,
  onDocumentChange,
  onAttach,
  onPrint,
  onDownload,
  className = "",
  defaultVisible = true
}: DocumentViewerPanelProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeDoc = currentDocument || documents[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onDocumentChange?.(documents[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onDocumentChange?.(documents[currentIndex + 1]);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttach?.(file);
    }
  };

  if (!isVisible) {
    return (
      <div className={`border-l bg-slate-50 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="w-full justify-start gap-2"
        >
          <Eye className="h-4 w-4" />
          Show Document Viewer
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col border-l bg-white ${isFullScreen ? 'fixed inset-0 z-50 m-0' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 truncate">
            {activeDoc?.name || "Document Viewer"}
          </h3>
          {activeDoc?.type && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 flex-shrink-0">
              {activeDoc.type.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Navigation */}
          {documents.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500">
                {currentIndex + 1} / {documents.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === documents.length - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div className="h-4 w-px bg-slate-300 mx-2" />

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrint}
            className="h-8 w-8"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="h-8 w-8"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="h-8 w-8"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8"
            title="Hide Panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeDoc ? (
          <Card className="min-h-full">
            <CardContent className="p-6">
              {activeDoc.content ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                />
              ) : activeDoc.url ? (
                <iframe
                  src={activeDoc.url}
                  className="h-full w-full border-0"
                  title={activeDoc.name}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">Document content not available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <p className="text-sm">No document selected</p>
          </div>
        )}
      </div>

      {/* Attachment Bar */}
      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileAttach}
              />
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <span>
                  <Paperclip className="h-4 w-4" />
                  Attach Document
                </span>
              </Button>
            </label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Hide
          </Button>
        </div>
      </div>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
