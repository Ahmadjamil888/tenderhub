import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { ASSET_MGMT_SUB_STAGES } from "@/lib/stage-configs/stage-asset-management";
import { Package } from "lucide-react";

export default function AssetManagementWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={20}
      stageLabel="Asset Management"
      stageDesc={`${ASSET_MGMT_SUB_STAGES.length} sub-stages · Asset registration, assignment, disposal`}
      icon={Package}
      subStages={ASSET_MGMT_SUB_STAGES}
    />
  );
}
