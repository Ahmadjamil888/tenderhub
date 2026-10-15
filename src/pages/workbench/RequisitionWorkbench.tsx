/**
 * RequisitionWorkbench — Stage 2 of 26 (Bid Submission / Supplier side)
 * Sub-stages: Supplier Registration → Clarification → Site Visit → Bid Submission → Bid Closing
 */
import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { REQUISITION_SUB_STAGES } from "@/lib/stage-configs/stage2-requisition";
import { Send } from "lucide-react";

export default function RequisitionWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={2}
      stageLabel="Bid Preparation & Submission"
      stageDesc={`${REQUISITION_SUB_STAGES.length} sub-stages · Supplier registration through bid closing`}
      icon={Send}
      subStages={REQUISITION_SUB_STAGES}
    />
  );
}
