import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  FileText, Briefcase, Search, Users, Gavel, MessageSquare,
  ChevronDown, ChevronRight, Lock, Scale, Megaphone, AlertTriangle
} from "lucide-react";

type TenderModule = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accentColor: string;
  subTiles: SubTile[];
};

type SubTile = {
  id: string;
  name: string;
  icon: React.ElementType;
  count?: number;
  route: string;
};

const TENDER_MODULES: TenderModule[] = [
  {
    id: "tenders",
    name: "Tenders",
    description: "Open / restricted / direct appointment",
    icon: FileText,
    color: "bg-blue-600",
    accentColor: "text-blue-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 12, route: "/tenders/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 3, route: "/tenders/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 5, route: "/tenders/bid-opening-vault" },
      { id: "tender-list", name: "Tender List", icon: FileText, count: 147, route: "/tenders" },
      { id: "create-tender", name: "Create Tender", icon: FileText, route: "/tenders/create" },
      { id: "evaluate-tenders", name: "Evaluate Tenders", icon: Scale, count: 8, route: "/tenders/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/tenders/reports" },
    ]
  },
  {
    id: "rfq",
    name: "RFQ",
    description: "Request for Quotation (supplies)",
    icon: Briefcase,
    color: "bg-emerald-600",
    accentColor: "text-emerald-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 8, route: "/rfq/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 1, route: "/rfq/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 3, route: "/rfq/bid-opening-vault" },
      { id: "rfq-list", name: "RFQ List", icon: Briefcase, count: 45, route: "/rfq" },
      { id: "create-rfq", name: "Create RFQ", icon: Briefcase, route: "/rfq/create" },
      { id: "evaluate-rfq", name: "Evaluate RFQ", icon: Scale, count: 4, route: "/rfq/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/rfq/reports" },
    ]
  },
  {
    id: "unsolicited-bids",
    name: "Unsolicited Bids",
    description: "Unsolicited proposals",
    icon: Megaphone,
    color: "bg-amber-600",
    accentColor: "text-amber-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 2, route: "/unsolicited/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 0, route: "/unsolicited/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 1, route: "/unsolicited/bid-opening-vault" },
      { id: "unsolicited-list", name: "Unsolicited Bids List", icon: Megaphone, count: 12, route: "/unsolicited" },
      { id: "create-unsolicited", name: "Create Unsolicited Bid", icon: Megaphone, route: "/unsolicited/create" },
      { id: "evaluate-unsolicited", name: "Evaluate Unsolicited", icon: Scale, count: 2, route: "/unsolicited/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/unsolicited/reports" },
    ]
  },
  {
    id: "rfp",
    name: "RFP",
    description: "Request for Proposal (consulting/services)",
    icon: Search,
    color: "bg-violet-600",
    accentColor: "text-violet-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 6, route: "/rfp/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 1, route: "/rfp/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 2, route: "/rfp/bid-opening-vault" },
      { id: "rfp-list", name: "RFP List", icon: Search, count: 28, route: "/rfp" },
      { id: "create-rfp", name: "Create RFP", icon: Search, route: "/rfp/create" },
      { id: "evaluate-rfp", name: "Evaluate RFP", icon: Scale, count: 5, route: "/rfp/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/rfp/reports" },
    ]
  },
  {
    id: "eoi",
    name: "EOI",
    description: "Expression of Interest (shortlisting)",
    icon: MessageSquare,
    color: "bg-rose-600",
    accentColor: "text-rose-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 4, route: "/eoi/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 0, route: "/eoi/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 2, route: "/eoi/bid-opening-vault" },
      { id: "eoi-list", name: "EOI List", icon: MessageSquare, count: 18, route: "/eoi" },
      { id: "create-eoi", name: "Create EOI", icon: MessageSquare, route: "/eoi/create" },
      { id: "evaluate-eoi", name: "Evaluate EOI", icon: Scale, count: 3, route: "/eoi/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/eoi/reports" },
    ]
  },
  {
    id: "auctions",
    name: "Auctions",
    description: "Public auctions (asset disposal)",
    icon: Gavel,
    color: "bg-orange-600",
    accentColor: "text-orange-600",
    subTiles: [
      { id: "open-bids-vault", name: "Open Bids Vault", icon: Lock, count: 3, route: "/auctions/open-bids-vault" },
      { id: "investigation-cases", name: "Investigation Cases", icon: AlertTriangle, count: 0, route: "/auctions/investigation-cases" },
      { id: "bid-opening-vault", name: "Bid Opening Vault", icon: Lock, count: 1, route: "/auctions/bid-opening-vault" },
      { id: "auctions-list", name: "Auctions List", icon: Gavel, count: 9, route: "/auctions" },
      { id: "create-auction", name: "Create Auction", icon: Gavel, route: "/auctions/create" },
      { id: "evaluate-auctions", name: "Evaluate Auctions", icon: Scale, count: 2, route: "/auctions/evaluate" },
      { id: "reports-intelligence", name: "Reports and Intelligence", icon: Search, route: "/auctions/reports" },
    ]
  },
];

export function TenderTiles() {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="space-y-4">
      {/* Top-level tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TENDER_MODULES.map((module) => {
          const Icon = module.icon;
          const isExpanded = expandedModule === module.id;
          
          return (
            <Card
              key={module.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${isExpanded ? 'ring-2 ring-offset-2 ' + module.accentColor.replace('text-', 'ring-') : ''}`}
              onClick={() => toggleModule(module.id)}
            >
              <CardContent className="p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${module.color} mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-slate-800">{module.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{module.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-400">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expanded sub-tiles */}
      {expandedModule && (
        <div className="mt-4">
          {TENDER_MODULES.filter(m => m.id === expandedModule).map((module) => (
            <Card key={module.id} className="border-2 border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <module.icon className={`h-5 w-5 ${module.accentColor}`} />
                  <h3 className="font-semibold text-slate-800">{module.name} - Sub-modules</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {module.subTiles.map((subTile) => {
                    const Icon = subTile.icon;
                    return (
                      <Button
                        key={subTile.id}
                        variant="outline"
                        className="h-auto flex-col py-4 gap-2 hover:bg-slate-50"
                        onClick={() => navigate(subTile.route)}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${module.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">{subTile.name}</span>
                        {subTile.count !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {subTile.count}
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
