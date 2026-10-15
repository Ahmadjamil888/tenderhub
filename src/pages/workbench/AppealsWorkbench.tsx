import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { APPEALS_SUB_STAGES } from "@/lib/stage-configs/stage-appeals";
import { Scale } from "lucide-react";

export default function AppealsWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={23}
      stageLabel="Appeals"
      stageDesc={`${APPEALS_SUB_STAGES.length} sub-stages · Appeal lodgement, hearing and decision`}
      icon={Scale}
      subStages={APPEALS_SUB_STAGES}
    />
  );
}
