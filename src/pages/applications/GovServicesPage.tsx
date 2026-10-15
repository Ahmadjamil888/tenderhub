import { Landmark } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

const config: ModuleConfig = {
  key: "government-services",
  label: "Government Services",
  color: "bg-[#0F172A]",
  textAccent: "text-[#0F172A]",
  borderAccent: "border-slate-200",
  icon: Landmark,
  desc: "Processing applications for government services including licensing, building permits, certificates and approvals. Track every stage and chat with admin.",
  steps: ["Registration","Application","Review","Approval","Collection"],
  formFields: [
    { key:"serviceType", label:"Service Required", type:"select", required:true,
      options:["Business Licence","Building Permit","Health Certificate","Trading Licence","Export/Import Permit","Land Title","Birth Certificate","Marriage Certificate","Death Certificate","Other Government Service"] },
    { key:"serviceLocation", label:"Service Location / Municipality", required:true, placeholder:"e.g. Harare City Council" },
    { key:"purposeDesc", label:"Purpose / Description of Need", type:"textarea", required:true, placeholder:"Describe what you need and why…" },
    { key:"preferredDate", label:"Preferred Processing Date", type:"date" },
    { key:"urgency", label:"Urgency Level", type:"select", options:["Normal — 5–10 business days","Urgent — 2–3 business days","Emergency — Same day"] },
    { key:"referenceNo", label:"Existing Reference / Case No.", placeholder:"If renewal or follow-up" },
  ],
};

export default function GovServicesPage() {
  return <ApplicationModuleBase config={config} />;
}
