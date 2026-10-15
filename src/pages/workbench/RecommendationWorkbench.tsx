import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { RECOMMENDATION_SUB_STAGES } from "@/lib/stage-configs/stage-recommendation";
import { Trophy } from "lucide-react";

export default function RecommendationWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={13}
      stageLabel="Award Recommendation"
      stageDesc={`${RECOMMENDATION_SUB_STAGES.length} sub-stages · Evaluation report, committee resolution, AO submission`}
      icon={Trophy}
      subStages={RECOMMENDATION_SUB_STAGES}
    />
  );
}
