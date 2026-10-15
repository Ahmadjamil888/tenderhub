/**
 * OpenBidsVault Page — wraps the OpenBidsVault component
 * Route: /tenders/module/:moduleType/open-bids
 */
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { OpenBidsVault as OpenBidsVaultComponent } from "@/components/OpenBidsVault";
import { ArrowLeft, Lock } from "lucide-react";

export default function OpenBidsVaultPage() {
  const { moduleType = "tenders" } = useParams<{ moduleType: string }>();
  const navigate = useNavigate();
  const label = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Government of the Republic of Zimbabwe · {label}
              </div>
              <div className="text-sm font-black text-white">Open Bids Vault</div>
            </div>
          </div>
          <button onClick={() => navigate(`/tenders/module/${moduleType}`)}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <OpenBidsVaultComponent />
        </div>
      </div>
    </AppShell>
  );
}
