import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { BID_SUBMISSION_SUB_STAGES } from "@/lib/stage-configs/stage-bid-submission";
import { Send } from "lucide-react";

export default function BidSubmissionWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={10}
      stageLabel="Bid Submission"
      stageDesc={`${BID_SUBMISSION_SUB_STAGES.length} sub-stages · Encrypted bid upload, digital signatures, receipt confirmation`}
      icon={Send}
      subStages={BID_SUBMISSION_SUB_STAGES}
    />
  );
}
