import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { AI_ANALYTICS_SUB_STAGES } from "@/lib/stage-configs/stage-ai-analytics";
import { Sparkles } from "lucide-react";

export default function AIAnalyticsWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={26}
      stageLabel="AI Analytics"
      stageDesc={`${AI_ANALYTICS_SUB_STAGES.length} sub-stages · Procurement intelligence, risk prediction, executive AI advisor`}
      icon={Sparkles}
      subStages={AI_ANALYTICS_SUB_STAGES}
    />
  );
}
