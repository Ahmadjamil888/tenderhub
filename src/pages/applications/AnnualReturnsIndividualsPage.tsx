import { User } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

const config: ModuleConfig = {
  key: "annual-returns-individuals",
  label: "Annual Returns — Individuals",
  color: "bg-[#0F172A]",
  textAccent: "text-[#0F172A]",
  borderAccent: "border-slate-200",
  icon: User,
  desc: "Create your profile and declare assets, employment history, achievements and biography. Build your official electronic CV with attachments.",
  steps: ["Profile","Employment","Assets","Biography","CV & Submit"],
  formFields: [
    { key:"surname", label:"Surname", required:true, placeholder:"Banda" },
    { key:"firstName", label:"First Name", required:true, placeholder:"John" },
    { key:"middleName", label:"Middle Name / Initials", placeholder:"T." },
    { key:"dateOfBirth", label:"Date of Birth", type:"date", required:true },
    { key:"gender", label:"Gender", type:"select", required:true, options:["Male","Female","Other","Prefer not to say"] },
    { key:"maritalStatus", label:"Marital Status", type:"select", options:["Single","Married","Divorced","Widowed"] },
    { key:"nationality", label:"Nationality", placeholder:"Zimbabwean" },
    { key:"currentEmployer", label:"Current Employer / Ministry", placeholder:"e.g. Ministry of Health" },
    { key:"currentPost", label:"Current Post / Job Title", placeholder:"e.g. Senior Nurse" },
    { key:"employmentStart", label:"Date Started Current Post", type:"date" },
    { key:"highestQualification", label:"Highest Qualification", type:"select",
      options:["Certificate","Diploma","Bachelor's Degree","Honours","Master's","Doctorate","Professional","Other"] },
    { key:"totalAssets", label:"Estimated Total Assets Value (USD)", placeholder:"e.g. 25000" },
    { key:"propertyDesc", label:"Properties / Real Estate Owned", type:"textarea",
      placeholder:"Describe any properties you own — address, estimated value…" },
    { key:"vehiclesDesc", label:"Vehicles Owned", type:"textarea", placeholder:"Make, model, year, registration…" },
    { key:"achievements", label:"Key Achievements / Awards", type:"textarea",
      placeholder:"List key achievements, awards, recognitions…" },
    { key:"biography", label:"Short Biography", type:"textarea",
      placeholder:"Write a brief professional biography (200–400 words)…" },
  ],
};

export default function AnnualReturnsIndividualsPage() {
  return <ApplicationModuleBase config={config} />;
}
