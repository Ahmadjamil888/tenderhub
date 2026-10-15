import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { STAGE5_SUB_STAGES } from "@/lib/stage-configs/stage5-implementation";
import { Activity } from "lucide-react";

export default function ProjectMonitoringWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={5}
      stageLabel="Tender Implementation"
      stageDesc={`${STAGE5_SUB_STAGES.length} sub-stages · Delivery through contract closure`}
      icon={Activity}
      subStages={STAGE5_SUB_STAGES}
    />
  );
}
