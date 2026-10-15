import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { PERFORMANCE_EVAL_SUB_STAGES } from "@/lib/stage-configs/stage-performance-eval";
import { TrendingUp } from "lucide-react";

export default function PerformanceEvalWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={21}
      stageLabel="Performance Evaluation"
      stageDesc={`${PERFORMANCE_EVAL_SUB_STAGES.length} sub-stages · Supplier scoring and procurement analytics`}
      icon={TrendingUp}
      subStages={PERFORMANCE_EVAL_SUB_STAGES}
    />
  );
}
