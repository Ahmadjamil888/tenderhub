import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { RFP_SUB_STAGES } from "@/lib/stage-configs/stage-rfq-rfp-eoi";
import { FileText } from "lucide-react";

export default function RFPWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={7}
      stageLabel="RFP Management"
      stageDesc={`${RFP_SUB_STAGES.length} sub-stages · Technical & financial weighted evaluation`}
      icon={FileText}
      subStages={RFP_SUB_STAGES}
    />
  );
}
