import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { REPORTS_SUB_STAGES } from "@/lib/stage-configs/stage-reports";
import { BarChart3 } from "lucide-react";

export default function ReportsWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={25}
      stageLabel="Reports"
      stageDesc={`${REPORTS_SUB_STAGES.length} sub-stages · Performance reports, public disclosures, analytics`}
      icon={BarChart3}
      subStages={REPORTS_SUB_STAGES}
    />
  );
}
