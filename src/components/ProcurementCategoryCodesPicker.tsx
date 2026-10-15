import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronUp, Search, Package, Users, HardHat } from "lucide-react";

type CategoryCode = {
  code: string;
  name: string;
  selected: boolean;
};

type CategoryGroup = {
  id: string;
  name: string;
  icon: React.ElementType;
  codes: CategoryCode[];
};

const PROCUREMENT_CATEGORIES: CategoryGroup[] = [
  {
    id: "supplies",
    name: "Supplies",
    icon: Package,
    codes: [
      { code: "200", name: "Agriculture Products & Equipment", selected: false },
      { code: "201", name: "Printed Matter & Equipment", selected: false },
      { code: "202", name: "Medical Supplies & Equipment", selected: false },
      { code: "203", name: "Electrical/Electronic & ICT", selected: false },
      { code: "204", name: "Office Equipment & Supplies", selected: false },
      { code: "205", name: "Furniture & Fittings", selected: false },
      { code: "206", name: "Vehicle Parts & Accessories", selected: false },
      { code: "207", name: "Food Supplies", selected: false },
      { code: "208", name: "Transport Equipment & Accessories", selected: false },
      { code: "209", name: "Safety Equipment & PPE", selected: false },
      { code: "210", name: "Laboratory Equipment & Supplies", selected: false },
      { code: "211", name: "General Supplies", selected: false },
      { code: "212", name: "Manufacturers — Agricultural", selected: false },
      { code: "213", name: "General Manufacturers/Producers", selected: false },
      { code: "214", name: "Petroleum Products", selected: false },
      { code: "215", name: "Chemicals & Reagents", selected: false },
      { code: "216", name: "Textiles & Clothing", selected: false },
      { code: "217", name: "Stationery & Office Supplies", selected: false },
      { code: "218", name: "Cleaning Materials & Equipment", selected: false },
      { code: "219", name: "Other Supplies", selected: false },
    ]
  },
  {
    id: "consultants",
    name: "Consultants",
    icon: Users,
    codes: [
      { code: "301", name: "Architecture Services", selected: false },
      { code: "302", name: "Quantity Surveying", selected: false },
      { code: "303", name: "Civil Engineering", selected: false },
      { code: "304", name: "Electrical Engineering", selected: false },
      { code: "305", name: "Mechanical Engineering", selected: false },
      { code: "306", name: "Water Engineering", selected: false },
      { code: "307", name: "Mining Engineering", selected: false },
      { code: "308", name: "Building Engineering", selected: false },
      { code: "309", name: "Structural Engineering", selected: false },
      { code: "310", name: "Environmental Engineering", selected: false },
      { code: "311", name: "Project Management", selected: false },
      { code: "312", name: "Legal Services", selected: false },
      { code: "313", name: "Environmental Services", selected: false },
      { code: "314", name: "Finance Related Services", selected: false },
      { code: "315", name: "Human Resource Services", selected: false },
      { code: "316", name: "IT Consulting Services", selected: false },
      { code: "317", name: "Management Consulting", selected: false },
      { code: "318", name: "Audit & Accounting Services", selected: false },
      { code: "319", name: "Training & Development", selected: false },
      { code: "320", name: "Research & Development", selected: false },
      { code: "321", name: "Communication Services", selected: false },
      { code: "322", name: "Marketing & Public Relations", selected: false },
      { code: "323", name: "Other Consulting Services", selected: false },
    ]
  },
  {
    id: "works",
    name: "Works Contractors",
    icon: HardHat,
    codes: [
      { code: "01", name: "General Building Construction", selected: false },
      { code: "02", name: "Roads & Bridges Construction", selected: false },
      { code: "03", name: "Water & Sanitation Works", selected: false },
      { code: "04", name: "Electrical Installation Works", selected: false },
      { code: "05", name: "Mechanical Installation Works", selected: false },
      { code: "06", name: "Civil Engineering Works", selected: false },
      { code: "07", name: "Landscaping & Horticulture", selected: false },
      { code: "08", name: "Fencing & Security Works", selected: false },
      { code: "09", name: "Roofing Works", selected: false },
      { code: "10", name: "Plumbing Works", selected: false },
      { code: "11", name: "Painting & Decoration", selected: false },
      { code: "12", name: "Carpentry & Joinery", selected: false },
      { code: "13", name: "Metal Works & Fabrication", selected: false },
      { code: "14", name: "Air Conditioning & Refrigeration", selected: false },
      { code: "15", name: "Other Works", selected: false },
    ]
  }
];

type ProcurementCategoryCodesPickerProps = {
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  className?: string;
};

export function ProcurementCategoryCodesPicker({
  selectedCodes,
  onSelectionChange,
  className = ""
}: ProcurementCategoryCodesPickerProps) {
  const [categories, setCategories] = useState<CategoryGroup[]>(PROCUREMENT_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["supplies"]));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleCode = (groupId: string, codeIndex: number) => {
    const newCategories = categories.map(cat => {
      if (cat.id === groupId) {
        const newCodes = [...cat.codes];
        newCodes[codeIndex] = { ...newCodes[codeIndex], selected: !newCodes[codeIndex].selected };
        return { ...cat, codes: newCodes };
      }
      return cat;
    });
    setCategories(newCategories);

    const allSelected = newCategories
      .flatMap(cat => cat.codes)
      .filter(code => code.selected)
      .map(code => code.code);
    onSelectionChange(allSelected);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    codes: category.codes.filter(code =>
      searchTerm === "" ||
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.codes.length > 0);

  const selectedCount = selectedCodes.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Procurement Category Codes</h3>
            <p className="text-sm text-slate-500">Select codes to target eligible vendors</p>
          </div>
          <Badge variant="secondary">{selectedCount} selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search category codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Groups */}
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedGroups.has(category.id);
            const selectedInGroup = category.codes.filter(c => c.selected).length;

            return (
              <Collapsible
                key={category.id}
                open={isExpanded}
                onOpenChange={() => toggleGroup(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedInGroup}/{category.codes.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input
                      placeholder={`Search ${category.name}...`}
                      className="pl-9 h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {category.codes.map((code, index) => (
                      <div
                        key={code.code}
                        className="flex items-center gap-2 p-2 rounded hover:bg-slate-50"
                      >
                        <Checkbox
                          id={`code-${category.id}-${code.code}`}
                          checked={code.selected}
                          onCheckedChange={() => toggleCode(category.id, index)}
                        />
                        <label
                          htmlFor={`code-${category.id}-${code.code}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <span className="font-medium">{code.code}</span>
                          <span className="text-slate-600 ml-2">{code.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Selected Codes Summary */}
        {selectedCodes.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Selected Codes:</h4>
            <div className="flex flex-wrap gap-1">
              {selectedCodes.map(code => (
                <Badge key={code} variant="secondary" className="text-xs">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
