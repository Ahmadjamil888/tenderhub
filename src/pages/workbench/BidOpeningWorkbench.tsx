import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { BID_OPENING_SUB_STAGES } from "@/lib/stage-configs/stage-bid-opening";
import { BookOpen } from "lucide-react";

export default function BidOpeningWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={11}
      stageLabel="Bid Opening"
      stageDesc={`${BID_OPENING_SUB_STAGES.length} sub-stages · Vault integrity check through opening register`}
      icon={BookOpen}
      subStages={BID_OPENING_SUB_STAGES}
    />
  );
}
