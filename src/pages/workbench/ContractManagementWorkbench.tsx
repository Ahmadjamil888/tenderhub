import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { STAGE4_SUB_STAGES } from "@/lib/stage-configs/stage4-contract";
import { FileSignature } from "lucide-react";

export default function ContractManagementWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={4}
      stageLabel="Contract Management"
      stageDesc={`${STAGE4_SUB_STAGES.length} sub-stages · Notice of award through contract kick-off`}
      icon={FileSignature}
      subStages={STAGE4_SUB_STAGES}
    />
  );
}
