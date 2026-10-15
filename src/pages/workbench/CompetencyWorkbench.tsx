/**
 * CompetencyWorkbench
 * Route: /workbench/competency-assessment
 *
 * Hosts the full Competency Assessment Subsystem inside
 * the standard Enterprise Workbench shell.
 *
 * IMPORTANT — Vendor Lifecycle Context:
 * Competency assessment is NOT a tender-time process. It begins at vendor
 * registration (Step 5 — Resource Profiling). Resources are profiled there,
 * assessments are assigned by role (Track 1 for Directors, Track 2 for
 * Technical), and scores are stored against each resource profile permanently.
 *
 * This workbench allows:
 *   A. Admin to manage and review resource profiles
 *   B. Assign assessments to resources who haven't yet been assessed
 *   C. Resources to take their assigned tests
 *   D. View scoring results
 *   E. Review stored competency records
 *   F. See how stored scores feed into tender technical evaluation (6a/6b)
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EnterpriseWorkbench, { PROCUREMENT_MODULES } from "@/components/EnterpriseWorkbench";
import CompetencySubsystem from "@/components/CompetencySubsystem";
import { BadgeCheck, ChevronDown, ChevronUp, ArrowRight, Users, Link2 } from "lucide-react";

export default function CompetencyWorkbench() {
  const [showSubsystem, setShowSubsystem] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();

  // If user lands on base route, redirect to resources sub-route
  useEffect(() => {
    if (location.pathname === "/workbench/competency-assessment") {
      navigate("/workbench/competency-assessment/resources", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Add this module to the known module list so the stage panel shows it
  const allModules = [
    ...(PROCUREMENT_MODULES ?? []),
    {
      num: 27, label: "Competency Assessment", route: "/workbench/competency-assessment",
      status: "active" as const, desc: "Resource profiling, assignment, test-taking, scoring and tender integration",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Lifecycle context strip ── */}
      <div className="flex-shrink-0 bg-[#1e293b] border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap text-[9px] text-white/50 font-semibold uppercase tracking-widest">
          <span className="text-slate-500">Vendor Registers</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-slate-500">Resource Profiled (Step 5 of Registration)</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-[#a78bfa]">Assessment Assigned (Track 1 / 2)</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-slate-400">Assessment Completed ← You are here</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-white/40">Score Stored Against Resource</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-white/40">Tender Participation</span>
          <ArrowRight className="h-2.5 w-2.5 text-white/20" />
          <span className="text-slate-500">Score Used in 6a / 6b Evaluation</span>
        </div>
      </div>

      {/* ── Competency subsystem panel (collapsible) ── */}
      <div className={`flex-shrink-0 border-b border-black/10 bg-white transition-all ${showSubsystem ? "h-[72vh]" : "h-12"}`}>
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] text-white h-12">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold">Competency Assessment Subsystem</span>
            <span className="text-[9px] text-white/40 ml-3 hidden sm:inline">
              Vendor Registration → Resource Profiling · Assignment · Test-Taking · Scoring · Records · Tender Integration
            </span>
          </div>
          <button onClick={() => setShowSubsystem(v => !v)}
            className="h-7 px-3 text-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center gap-1" style={{ borderRadius: 0 }}>
            {showSubsystem
              ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Competency Assessment System</>
            }
          </button>
        </div>

        {/* Subsystem content — always mounted to preserve state across tab navigation */}
        <div className={`overflow-hidden ${showSubsystem ? "h-[calc(72vh-3rem)]" : "hidden"}`}>
          <CompetencySubsystem />
        </div>
      </div>

      {/* ── Enterprise Workbench below ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <EnterpriseWorkbench
          module={{
            id: "competency-assessment",
            label: "Competency Assessment",
            stageNumber: 27,
            allModules,
          }}
          title="Competency Assessment Workbench"
          subtitle="Vendor Registration → Resource Profiling → Assessment → Score Stored → Tender Technical Evaluation (6a/6b)"
        />
      </div>
    </div>
  );
}
