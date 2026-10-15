import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { AUCTION_SUB_STAGES } from "@/lib/stage-configs/stage-rfq-rfp-eoi";
import { Gavel } from "lucide-react";

export default function AuctionWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={9}
      stageLabel="Auction Management"
      stageDesc={`${AUCTION_SUB_STAGES.length} sub-stages · No technical evaluation — price/proceeds only per spec`}
      icon={Gavel}
      subStages={AUCTION_SUB_STAGES}
    />
  );
}
