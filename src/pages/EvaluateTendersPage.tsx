/**
 * EvaluateTendersPage — wraps EvaluateTenders component
 * Route: /tenders/module/:moduleType/evaluate
 */
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { EvaluateTenders } from "@/components/EvaluateTenders";
import { ArrowLeft, Scale } from "lucide-react";

export default function EvaluateTendersPage() {
  const { moduleType = "tenders" } = useParams<{ moduleType: string }>();
  const navigate = useNavigate();
  const label = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#7C3AED]/80 flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Government of the Republic of Zimbabwe · {label}
              </div>
              <div className="text-sm font-black text-white">Evaluate Tenders</div>
            </div>
          </div>
          <button onClick={() => navigate(`/tenders/module/${moduleType}`)}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <EvaluateTenders />
        </div>
      </div>
    </AppShell>
  );
}
