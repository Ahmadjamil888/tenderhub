import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { CONTRACT_EXECUTION_SUB_STAGES } from "@/lib/stage-configs/stage-contract-execution";
import { FileSignature } from "lucide-react";

export default function ContractExecutionWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={15}
      stageLabel="Contract Execution"
      stageDesc={`${CONTRACT_EXECUTION_SUB_STAGES.length} sub-stages · Mobilisation, progress tracking, variations`}
      icon={FileSignature}
      subStages={CONTRACT_EXECUTION_SUB_STAGES}
    />
  );
}
