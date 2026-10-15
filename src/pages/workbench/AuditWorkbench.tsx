import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { AUDIT_SUB_STAGES } from "@/lib/stage-configs/stage-audit";
import { ShieldCheck } from "lucide-react";

export default function AuditWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={24}
      stageLabel="Audit"
      stageDesc={`${AUDIT_SUB_STAGES.length} sub-stages · Internal audit, audit trail review`}
      icon={ShieldCheck}
      subStages={AUDIT_SUB_STAGES}
    />
  );
}
