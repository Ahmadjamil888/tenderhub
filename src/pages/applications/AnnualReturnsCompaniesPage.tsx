import { Building2 } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

const config: ModuleConfig = {
  key: "annual-returns-companies",
  label: "Annual Returns — Companies",
  color: "bg-[#0F172A]",
  textAccent: "text-[#0F172A]",
  borderAccent: "border-slate-200",
  icon: Building2,
  desc: "File annual returns, confirm that all company profile information is still valid, and upload any documents that have expired.",
  steps: ["Profile Check","Returns Form","Documents","Submission","Certificate"],
  formFields: [
    { key:"companyName", label:"Company Name", required:true, placeholder:"Full registered company name" },
    { key:"companyReg", label:"Company Registration No.", required:true, placeholder:"e.g. 12345/2024" },
    { key:"taxTin", label:"Tax TIN Number", required:true, placeholder:"e.g. 1234567890" },
    { key:"vatNumber", label:"VAT Number", placeholder:"If registered for VAT" },
    { key:"returnYear", label:"Return Year", type:"select", required:true,
      options:["2026","2025","2024","2023","2022"] },
    { key:"companyStatus", label:"Company Status Confirmation", type:"select", required:true,
      options:["Active — All information unchanged","Active — Some information has changed","Dormant","Ceased Operations"] },
    { key:"changesDesc", label:"Describe Any Changes to Company Details", type:"textarea",
      placeholder:"List any changes to directors, address, activities, banking details etc." },
    { key:"registeredAddress", label:"Current Registered Address", required:true, placeholder:"Physical registered address" },
    { key:"contactPerson", label:"Contact Person Name", required:true, placeholder:"Full name of contact person" },
    { key:"contactEmail", label:"Contact Person Email", type:"email", required:true, placeholder:"contact@company.co.zw" },
  ],
};

export default function AnnualReturnsCompaniesPage() {
  return <ApplicationModuleBase config={config} />;
}
