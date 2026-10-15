import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { GOVERNANCE_SUB_STAGES } from "@/lib/stage-configs/stage-governance";
import { Landmark } from "lucide-react";

export default function GovernanceWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={22}
      stageLabel="Governance"
      stageDesc={`${GOVERNANCE_SUB_STAGES.length} sub-stages · COI monitoring, fraud detection, policy compliance`}
      icon={Landmark}
      subStages={GOVERNANCE_SUB_STAGES}
    />
  );
}
