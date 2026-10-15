import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { CONTRACT_AWARD_SUB_STAGES } from "@/lib/stage-configs/stage-contract-award";
import { Award } from "lucide-react";

export default function ContractAwardWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={14}
      stageLabel="Contract Award"
      stageDesc={`${CONTRACT_AWARD_SUB_STAGES.length} sub-stages · Award notice, regret letters, appeals management`}
      icon={Award}
      subStages={CONTRACT_AWARD_SUB_STAGES}
    />
  );
}
