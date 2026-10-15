import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { EOI_SUB_STAGES } from "@/lib/stage-configs/stage-rfq-rfp-eoi";
import { Users } from "lucide-react";

export default function EOIWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={8}
      stageLabel="EOI Management"
      stageDesc={`${EOI_SUB_STAGES.length} sub-stages · Capability screening and shortlisting`}
      icon={Users}
      subStages={EOI_SUB_STAGES}
    />
  );
}
