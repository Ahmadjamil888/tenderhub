import { Mail } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

const config: ModuleConfig = {
  key: "communications",
  label: "Communications",
  color: "bg-[#0F172A]",
  textAccent: "text-[#0F172A]",
  borderAccent: "border-slate-200",
  icon: Mail,
  desc: "Submit mails, letters and proposals to government offices. Specify the recipient, mark confidentiality and urgency. Track which office holds your communication.",
  steps: ["Draft","Submission","Registry","Routing","Response"],
  formFields: [
    { key:"commType", label:"Communication Type", type:"select", required:true,
      options:["Official Letter","Proposal","Petition","Memorandum","Complaint","Enquiry","Application","Other"] },
    { key:"recipientMinistry", label:"Recipient Ministry / Entity", placeholder:"e.g. Ministry of Finance — if known" },
    { key:"recipientName", label:"Recipient Name / Office", placeholder:"e.g. The Permanent Secretary — leave blank if unknown" },
    { key:"subject", label:"Subject", required:true, placeholder:"Clear and concise subject line" },
    { key:"confidentiality", label:"Confidentiality Level", type:"select", required:true,
      options:["Not Confidential — Public","Official","Confidential","Strictly Confidential"] },
    { key:"urgency", label:"Urgency Level", type:"select", required:true,
      options:["Normal","Urgent","Very Urgent — Escalation"] },
    { key:"isEscalation", label:"Is this an Escalation?", type:"select",
      options:["No","Yes — escalating unresolved matter","Yes — escalating complaint"] },
    { key:"body", label:"Content of Communication", type:"textarea", required:true,
      placeholder:"Write the full content of your letter, proposal or communication here…" },
    { key:"existingRef", label:"Reference to Existing Case (if any)", placeholder:"e.g. COMM-2026-00123" },
  ],
};

export default function CommunicationsPortalPage() {
  return <ApplicationModuleBase config={config} />;
}
