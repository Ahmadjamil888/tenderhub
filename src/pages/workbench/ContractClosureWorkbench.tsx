import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { CONTRACT_CLOSURE_SUB_STAGES } from "@/lib/stage-configs/stage-contract-closure";
import { CheckCircle } from "lucide-react";

export default function ContractClosureWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={19}
      stageLabel="Contract Closure"
      stageDesc={`${CONTRACT_CLOSURE_SUB_STAGES.length} sub-stages · Final acceptance, lessons learned, asset handover`}
      icon={CheckCircle}
      subStages={CONTRACT_CLOSURE_SUB_STAGES}
    />
  );
}
