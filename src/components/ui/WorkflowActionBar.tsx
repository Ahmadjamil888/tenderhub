import { Button } from "./button";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  RotateCcw, 
  CornerDownLeft, 
  Check, 
  ShieldCheck, 
  Gavel, 
  AlertTriangle, 
  TrendingUp,
  Printer,
  Eye,
  Download,
  Share2
} from "lucide-react";

type WorkflowActionBarProps = {
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  onReset?: () => void;
  onReturn?: () => void;
  onApprove?: () => void;
  onAuthorize?: () => void;
  onAdjudicate?: () => void;
  onAppealApproval?: () => void;
  onEscalate?: () => void;
  onSubmit?: () => void;
  onPrint?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  visibleButtons?: Array<
    "back" | "next" | "saveDraft" | "reset" | "return" | 
    "approve" | "authorize" | "adjudicate" | "appealApproval" | 
    "escalate" | "submit"
  >;
  showUtilities?: boolean;
  className?: string;
};

export function WorkflowActionBar({
  onBack,
  onNext,
  onSaveDraft,
  onReset,
  onReturn,
  onApprove,
  onAuthorize,
  onAdjudicate,
  onAppealApproval,
  onEscalate,
  onSubmit,
  onPrint,
  onPreview,
  onDownload,
  onShare,
  visibleButtons = ["back", "next", "saveDraft", "submit"],
  showUtilities = true,
  className = ""
}: WorkflowActionBarProps) {
  const buttonConfig = {
    back: { label: "Back", icon: ArrowLeft, action: onBack, variant: "outline" as const },
    next: { label: "Next", icon: ArrowRight, action: onNext, variant: "default" as const },
    saveDraft: { label: "Save Draft", icon: Save, action: onSaveDraft, variant: "secondary" as const },
    reset: { label: "Reset", icon: RotateCcw, action: onReset, variant: "outline" as const },
    return: { label: "Return", icon: CornerDownLeft, action: onReturn, variant: "outline" as const },
    approve: { label: "Approve", icon: Check, action: onApprove, variant: "default" as const },
    authorize: { label: "Authorize", icon: ShieldCheck, action: onAuthorize, variant: "default" as const },
    adjudicate: { label: "Adjudicate", icon: Gavel, action: onAdjudicate, variant: "default" as const },
    appealApproval: { label: "Appeal Approval", icon: AlertTriangle, action: onAppealApproval, variant: "outline" as const },
    escalate: { label: "Escalate", icon: TrendingUp, action: onEscalate, variant: "outline" as const },
    submit: { label: "Submit", icon: ArrowRight, action: onSubmit, variant: "default" as const },
  };

  return (
    <div className={`flex items-center justify-between border-t bg-white p-4 shadow-sm ${className}`}>
      {/* Workflow Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {visibleButtons.map((btnKey) => {
          const config = buttonConfig[btnKey as keyof typeof buttonConfig];
          if (!config || !config.action) return null;
          
          const Icon = config.icon;
          return (
            <Button
              key={btnKey}
              variant={config.variant}
              onClick={config.action}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Utility Icons */}
      {showUtilities && (
        <div className="flex items-center gap-1 border-l pl-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrint}
            className="h-9 w-9"
            title="Print"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreview}
            className="h-9 w-9"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="h-9 w-9"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-9 w-9"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
