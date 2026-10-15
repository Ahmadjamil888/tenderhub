import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

type StepStatus = "completed" | "active" | "pending" | "blocked";

type Step = {
  id: number;
  label: string;
  description?: string;
  status: StepStatus;
  assignee?: string;
  aiRole?: string;
};

type Props = {
  steps: Step[];
  orientation?: "horizontal" | "vertical";
  compact?: boolean;
};

const STATUS_STYLES: Record<StepStatus, { icon: typeof CheckCircle2; iconClass: string; lineClass: string; labelClass: string; bg: string }> = {
  completed: { icon: CheckCircle2, iconClass: "text-slate-600", lineClass: "bg-slate-400", labelClass: "text-foreground font-medium", bg: "bg-slate-50 border-slate-200" },
  active:    { icon: Clock,         iconClass: "text-slate-600 animate-pulse", lineClass: "bg-slate-300", labelClass: "text-[#0F172A] font-semibold", bg: "bg-slate-50 border-slate-200" },
  pending:   { icon: Circle,        iconClass: "text-muted-foreground", lineClass: "bg-border", labelClass: "text-muted-foreground", bg: "bg-secondary border-border" },
  blocked:   { icon: AlertCircle,   iconClass: "text-red-500", lineClass: "bg-red-300", labelClass: "text-red-600 font-medium", bg: "bg-red-50 border-red-200" },
};

export default function WorkflowStepper({ steps, orientation = "horizontal", compact = false }: Props) {
  if (orientation === "vertical") {
    return (
      <div className="space-y-0">
        {steps.map((step, i) => {
          const s = STATUS_STYLES[step.status];
          const Icon = s.icon;
          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${step.status === "active" ? "border-slate-200 bg-slate-50" : step.status === "completed" ? "border-slate-200 bg-slate-50" : step.status === "blocked" ? "border-red-300 bg-red-50" : "border-border bg-secondary"}`}>
                  <Icon className={`h-3.5 w-3.5 ${s.iconClass}`} />
                </div>
                {i < steps.length - 1 && <div className={`w-0.5 h-8 mt-0.5 ${s.lineClass}`} />}
              </div>
              <div className={`pb-6 flex-1 ${i < steps.length - 1 ? "" : ""}`}>
                <div className={`text-sm ${s.labelClass}`}>{step.id}. {step.label}</div>
                {!compact && step.description && <div className="text-[11px] text-muted-foreground mt-0.5">{step.description}</div>}
                {!compact && step.aiRole && (
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#0F172A] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
                    AI: {step.aiRole}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-max">
        {steps.map((step, i) => {
          const s = STATUS_STYLES[step.status];
          const Icon = s.icon;
          return (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${step.status === "active" ? "border-slate-200 bg-slate-50" : step.status === "completed" ? "border-slate-200 bg-slate-50" : step.status === "blocked" ? "border-red-300 bg-red-50" : "border-border bg-secondary"}`}>
                  <Icon className={`h-4 w-4 ${s.iconClass}`} />
                </div>
                <div className={`mt-1.5 text-center ${compact ? "w-16" : "w-24"}`}>
                  <div className={`text-[10px] leading-tight ${s.labelClass}`}>{step.label}</div>
                  {!compact && step.aiRole && (
                    <div className="text-[9px] text-[#0F172A] mt-0.5">🤖 {step.aiRole}</div>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 mt-4 flex-shrink-0 ${s.lineClass}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
