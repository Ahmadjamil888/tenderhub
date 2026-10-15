import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { RFQ_SUB_STAGES } from "@/lib/stage-configs/stage-rfq-rfp-eoi";
import { ShoppingCart } from "lucide-react";

export default function RFQWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={6}
      stageLabel="RFQ Management"
      stageDesc={`${RFQ_SUB_STAGES.length} sub-stages · Price-only evaluation — no technical evaluation per spec`}
      icon={ShoppingCart}
      subStages={RFQ_SUB_STAGES}
    />
  );
}
