import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { TENDER_MGMT_SUB_STAGES } from "@/lib/stage-configs/stage-tender-management";
import { Newspaper } from "lucide-react";

export default function TenderManagementWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={5}
      stageLabel="Tender Management"
      stageDesc={`${TENDER_MGMT_SUB_STAGES.length} sub-stages · Active tender monitoring, addenda, register`}
      icon={Newspaper}
      subStages={TENDER_MGMT_SUB_STAGES}
    />
  );
}
