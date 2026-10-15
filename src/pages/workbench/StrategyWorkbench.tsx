/**
 * StrategyWorkbench — Stage 3 of 26 (Procurement Strategy & Sourcing)
 * Sub-stages: Market Analysis → Sourcing Strategy → Category Management
 */
import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import { STRATEGY_SUB_STAGES } from "@/lib/stage-configs/stage3-strategy";
import { Target } from "lucide-react";

export default function StrategyWorkbench() {
  return (
    <WorkbenchStageShell
      stageNumber={3}
      stageLabel="Strategy & Sourcing"
      stageDesc={`${STRATEGY_SUB_STAGES.length} sub-stages · Market analysis, sourcing strategy, category management`}
      icon={Target}
      subStages={STRATEGY_SUB_STAGES}
    />
  );
}
