/**
 * BudgetWorkflowStatusTracker
 * Generic step-tracker used on every Budget Item/Project Profile.
 * Statuses: complete | in-progress | pending | rejected
 */
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

export type WorkflowStep = {
  label: string;
  status: "complete" | "in-progress" | "pending" | "rejected";
  dateTime?: string;
};

type Props = {
  steps: WorkflowStep[];
  className?: string;
};

const STATUS_CONFIG = {
  complete:    { icon: CheckCircle2, bg: "bg-emerald-600",  ring: "ring-emerald-600",  text: "text-emerald-700",  label: "Complete"    },
  "in-progress":{ icon: Clock,       bg: "bg-amber-500",    ring: "ring-amber-500",    text: "text-amber-700",   label: "In Progress" },
  pending:     { icon: Circle,       bg: "bg-gray-300",     ring: "ring-gray-300",     text: "text-gray-500",    label: "Pending"     },
  rejected:    { icon: AlertCircle,  bg: "bg-red-500",      ring: "ring-red-500",      text: "text-red-700",     label: "Rejected"    },
};

export function BudgetWorkflowStatusTracker({ steps, className = "" }: Props) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Workflow Status</h4>
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const cfg = STATUS_CONFIG[step.status];
          const Icon = cfg.icon;
          const isLast = i === steps.length - 1;
          return (
            <div key={step.label} className="flex flex-col items-center flex-1 min-w-0">
              {/* connector + icon row */}
              <div className="flex items-center w-full">
                {/* left connector */}
                <div className={`flex-1 h-0.5 ${i === 0 ? "invisible" : step.status === "complete" ? "bg-emerald-500" : "bg-gray-200"}`} />
                {/* icon */}
                <div className={`relative flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ring-2 ${cfg.ring} ${cfg.bg}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {/* right connector */}
                <div className={`flex-1 h-0.5 ${isLast ? "invisible" : step.status === "complete" ? "bg-emerald-500" : "bg-gray-200"}`} />
              </div>
              {/* label */}
              <p className="mt-1 text-center text-[10px] font-medium text-gray-700 leading-tight px-1 truncate w-full">{step.label}</p>
              {/* status badge */}
              <span className={`text-[9px] font-semibold uppercase ${cfg.text}`}>{cfg.label}</span>
              {/* date/time if provided */}
              {step.dateTime && (
                <span className="text-[9px] text-gray-400 mt-0.5">{step.dateTime}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
