import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { PAYMENT_SUB_STAGES } from "@/lib/stage-configs/stage-payment";
import { DollarSign } from "lucide-react";

export default function PaymentManagementWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={18}
      stageLabel="Payment Management"
      stageDesc={`${PAYMENT_SUB_STAGES.length} sub-stages · Invoice verification, three-way match, EFT release`}
      icon={DollarSign}
      subStages={PAYMENT_SUB_STAGES}
    />
  );
}
