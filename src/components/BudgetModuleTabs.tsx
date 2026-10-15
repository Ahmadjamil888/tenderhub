import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ModuleFilterBar } from "./ui/ModuleFilterBar";
import { WorkflowActionBar } from "./ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "./ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "./ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "./ui/AiAgentChatPanel";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Package, HardHat, Users, Building2, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

type BudgetTab = "consolidated-cash-flow" | "operations" | "supplies" | "works" | "services";

const TABS: { id: BudgetTab; label: string; icon: React.ElementType }[] = [
  { id: "consolidated-cash-flow", label: "Consolidated Cash Flow", icon: DollarSign },
  { id: "operations", label: "Operations", icon: Building2 },
  { id: "supplies", label: "Supplies", icon: Package },
  { id: "works", label: "Works", icon: HardHat },
  { id: "services", label: "Services", icon: Users },
];

type BudgetLineItem = {
  id: string;
  code: string;
  description: string;
  approved: number;
  spent: number;
  committed: number;
  available: number;
  variance: number;
  variancePercent: number;
  status: "on-track" | "warning" | "critical";
};

const MOCK_BUDGET_DATA: Record<BudgetTab, BudgetLineItem[]> = {
  "consolidated-cash-flow": [
    { id: "1", code: "CF-001", description: "Operating Cash Flow", approved: 50000000, spent: 32000000, committed: 8000000, available: 10000000, variance: -2000000, variancePercent: -4, status: "warning" },
    { id: "2", code: "CF-002", description: "Investing Cash Flow", approved: 25000000, spent: 18000000, committed: 5000000, available: 2000000, variance: 0, variancePercent: 0, status: "on-track" },
    { id: "3", code: "CF-003", description: "Financing Cash Flow", approved: 15000000, spent: 12000000, committed: 2000000, available: 1000000, variance: 500000, variancePercent: 3.3, status: "on-track" },
  ],
  "operations": [
    { id: "4", code: "OP-001", description: "Personnel Costs", approved: 80000000, spent: 52000000, committed: 15000000, available: 13000000, variance: -3000000, variancePercent: -3.75, status: "warning" },
    { id: "5", code: "OP-002", description: "Office Operations", approved: 15000000, spent: 9000000, committed: 3000000, available: 3000000, variance: 0, variancePercent: 0, status: "on-track" },
    { id: "6", code: "OP-003", description: "Utilities & Maintenance", approved: 12000000, spent: 11000000, committed: 2000000, available: -1000000, variance: -2000000, variancePercent: -16.7, status: "critical" },
  ],
  "supplies": [
    { id: "7", code: "SP-001", description: "Medical Supplies", approved: 25000000, spent: 18000000, committed: 5000000, available: 2000000, variance: 0, variancePercent: 0, status: "on-track" },
    { id: "8", code: "SP-002", description: "Office Supplies", approved: 5000000, spent: 3200000, committed: 1000000, available: 800000, variance: 200000, variancePercent: 4, status: "on-track" },
    { id: "9", code: "SP-003", description: "Food Supplies", approved: 8000000, spent: 7500000, committed: 1000000, available: -500000, variance: -1000000, variancePercent: -12.5, status: "critical" },
  ],
  "works": [
    { id: "10", code: "WK-001", description: "Infrastructure Projects", approved: 100000000, spent: 65000000, committed: 25000000, available: 10000000, variance: 5000000, variancePercent: 5, status: "on-track" },
    { id: "11", code: "WK-002", description: "Road Maintenance", approved: 30000000, spent: 28000000, committed: 5000000, available: -3000000, variance: -3000000, variancePercent: -10, status: "warning" },
    { id: "12", code: "WK-003", description: "Building Construction", approved: 45000000, spent: 20000000, committed: 15000000, available: 10000000, variance: 0, variancePercent: 0, status: "on-track" },
  ],
  "services": [
    { id: "13", code: "SV-001", description: "Consulting Services", approved: 15000000, spent: 8000000, committed: 4000000, available: 3000000, variance: 0, variancePercent: 0, status: "on-track" },
    { id: "14", code: "SV-002", description: "IT Services", approved: 10000000, spent: 9500000, committed: 1000000, available: -500000, variance: -500000, variancePercent: -5, status: "warning" },
    { id: "15", code: "SV-003", description: "Security Services", approved: 8000000, spent: 6000000, committed: 1500000, available: 500000, variance: 200000, variancePercent: 2.5, status: "on-track" },
  ],
};

type BudgetModuleTabsProps = {
  moduleName: string;
  className?: string;
};

export function BudgetModuleTabs({ moduleName, className = "" }: BudgetModuleTabsProps) {
  const [activeTab, setActiveTab] = useState<BudgetTab>("consolidated-cash-flow");
  const [showDocumentViewer, setShowDocumentViewer] = useState(true);
  const [showAiChat, setShowAiChat] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-ZW", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentData = MOCK_BUDGET_DATA[activeTab];
  const totalApproved = currentData.reduce((sum, item) => sum + item.approved, 0);
  const totalSpent = currentData.reduce((sum, item) => sum + item.spent, 0);
  const totalCommitted = currentData.reduce((sum, item) => sum + item.committed, 0);
  const totalAvailable = currentData.reduce((sum, item) => sum + item.available, 0);
  const totalVariance = currentData.reduce((sum, item) => sum + item.variance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-100 text-green-700">On Track</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700">Warning</Badge>;
      case "critical":
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (variance < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Module Header */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-800">{moduleName}</h2>
          <p className="text-sm text-slate-500">Budget planning, execution, and variance analysis</p>
        </CardHeader>
      </Card>

      {/* Module Filter Bar */}
      <ModuleFilterBar
        ministries={[
          { value: "mof", label: "Ministry of Finance" },
          { value: "moh", label: "Ministry of Health" },
          { value: "mot", label: "Ministry of Transport" },
        ]}
        departments={[
          { value: "finance", label: "Finance Department" },
          { value: "procurement", label: "Procurement Department" },
        ]}
        soes={[
          { value: "zesa", label: "ZESA" },
          { value: "aa", label: "Air Zimbabwe" },
        ]}
        units={[
          { value: "unit1", label: "Unit 1" },
          { value: "unit2", label: "Unit 2" },
        ]}
        financialYears={[
          { value: "2026", label: "FY 2026" },
          { value: "2027", label: "FY 2027" },
        ]}
      />

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`flex-1 justify-start gap-2 rounded-none border-b-2 ${
                    isActive ? "border-slate-800 bg-slate-50" : "border-transparent"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500 mb-1">Total Approved</div>
            <div className="text-lg font-semibold text-slate-800">{formatCurrency(totalApproved)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500 mb-1">Total Spent</div>
            <div className="text-lg font-semibold text-slate-800">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500 mb-1">Total Committed</div>
            <div className="text-lg font-semibold text-slate-800">{formatCurrency(totalCommitted)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500 mb-1">Total Available</div>
            <div className="text-lg font-semibold text-slate-800">{formatCurrency(totalAvailable)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-slate-500 mb-1">Total Variance</div>
            <div className={`text-lg font-semibold ${totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalVariance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-800">{TABS.find(t => t.id === activeTab)?.label} - Budget Details</h3>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Approved</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Committed</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Available</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Variance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Variance %</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.approved)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.spent)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.committed)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${item.available < 0 ? "text-red-600" : "text-slate-800"}`}>
                      {formatCurrency(item.available)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right flex items-center justify-end gap-1 ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {getVarianceIcon(item.variance)}
                      {formatCurrency(item.variance)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right ${item.variancePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.variancePercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Actions */}
      <WorkflowActionBar
        visibleButtons={["back", "saveDraft", "approve", "authorize", "submit"]}
        showUtilities={true}
      />

      {/* Approval Signature Block */}
      <ApprovalSignatureBlock
        reviewedBy={{
          name: "R. Chikwanda",
          position: "Finance Director",
          department: "Finance",
          role: "Reviewer",
          authority: "Finance Director",
          dateTime: new Date().toLocaleString()
        }}
        approvedBy={{
          name: "T. Moyo",
          position: "Chief Procurement Officer",
          department: "Procurement",
          role: "Approver",
          authority: "CPO",
          dateTime: new Date().toLocaleString()
        }}
        createdBy={{
          name: "System",
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        }}
      />

      {/* Right Panel */}
      <div className="w-96 space-y-4">
        {showDocumentViewer && (
          <DocumentViewerPanel
            documents={[
              {
                id: "1",
                name: "Budget Approval Document",
                type: "pdf",
                content: `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="text-align: center;">BUDGET APPROVAL</h2>
                    <p style="margin-top: 20px;"><strong>Module:</strong> {moduleName}</p>
                    <p><strong>Tab:</strong> {TABS.find(t => t.id === activeTab)?.label}</p>
                    <p style="margin-top: 20px;">This document contains the approved budget allocations and variance analysis.</p>
                  </div>
                `
              }
            ]}
            defaultVisible={true}
          />
        )}
        {showAiChat && (
          <AiAgentChatPanel
            agentName="Budget Intelligence"
            agentRole="Financial Analytics"
            context="budget planning and variance analysis"
            suggestedPrompts={[
              "Analyze variance trends",
              "Identify overspending risks",
              "Generate budget forecast"
            ]}
            color="emerald"
            defaultVisible={true}
          />
        )}
      </div>
    </div>
  );
}
