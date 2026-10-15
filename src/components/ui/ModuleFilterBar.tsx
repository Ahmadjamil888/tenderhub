import { useState } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { Search, X, Filter } from "lucide-react";

type FilterOption = {
  value: string;
  label: string;
};

type ModuleFilterBarProps = {
  ministries?: FilterOption[];
  departments?: FilterOption[];
  soes?: FilterOption[];
  units?: FilterOption[];
  financialYears?: FilterOption[];
  onFilterChange?: (filters: {
    ministry?: string;
    department?: string;
    soe?: string;
    unit?: string;
    financialYear?: string;
    focusFilter?: "ministry" | "department" | "soe" | "unit";
  }) => void;
  showSearch?: boolean;
  className?: string;
};

export function ModuleFilterBar({
  ministries = [],
  departments = [],
  soes = [],
  units = [],
  financialYears = [],
  onFilterChange,
  showSearch = true,
  className = ""
}: ModuleFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    ministry: "",
    department: "",
    soe: "",
    unit: "",
    financialYear: "",
    focusFilter: "ministry" as "ministry" | "department" | "soe" | "unit"
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      ministry: "",
      department: "",
      soe: "",
      unit: "",
      financialYear: "",
      focusFilter: "ministry" as const
    };
    setFilters(resetFilters);
    setSearchTerm("");
    onFilterChange?.(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "ministry") || searchTerm;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          {showSearch && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Filter Row */}
          <div className="grid grid-cols-5 gap-3">
            {/* Ministry */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Ministry</Label>
              <Select
                value={filters.ministry}
                onValueChange={(value) => handleFilterChange("ministry", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {ministries.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RadioGroup
                value={filters.focusFilter}
                onValueChange={(value) => handleFilterChange("focusFilter", value)}
                className="flex"
              >
                <RadioGroupItem value="ministry" id="focus-ministry" className="h-3 w-3" />
                <Label htmlFor="focus-ministry" className="text-xs text-slate-500 ml-1">
                  Focus
                </Label>
              </RadioGroup>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => handleFilterChange("department", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RadioGroup
                value={filters.focusFilter}
                onValueChange={(value) => handleFilterChange("focusFilter", value)}
                className="flex"
              >
                <RadioGroupItem value="department" id="focus-department" className="h-3 w-3" />
                <Label htmlFor="focus-department" className="text-xs text-slate-500 ml-1">
                  Focus
                </Label>
              </RadioGroup>
            </div>

            {/* SOE */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">SOE</Label>
              <Select
                value={filters.soe}
                onValueChange={(value) => handleFilterChange("soe", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {soes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RadioGroup
                value={filters.focusFilter}
                onValueChange={(value) => handleFilterChange("focusFilter", value)}
                className="flex"
              >
                <RadioGroupItem value="soe" id="focus-soe" className="h-3 w-3" />
                <Label htmlFor="focus-soe" className="text-xs text-slate-500 ml-1">
                  Focus
                </Label>
              </RadioGroup>
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Unit</Label>
              <Select
                value={filters.unit}
                onValueChange={(value) => handleFilterChange("unit", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RadioGroup
                value={filters.focusFilter}
                onValueChange={(value) => handleFilterChange("focusFilter", value)}
                className="flex"
              >
                <RadioGroupItem value="unit" id="focus-unit" className="h-3 w-3" />
                <Label htmlFor="focus-unit" className="text-xs text-slate-500 ml-1">
                  Focus
                </Label>
              </RadioGroup>
            </div>

            {/* Financial Year */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Financial Year</Label>
              <Select
                value={filters.financialYear}
                onValueChange={(value) => handleFilterChange("financialYear", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {financialYears.map((fy) => (
                    <SelectItem key={fy.value} value={fy.value}>
                      {fy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-5" /> {/* Spacer for alignment */}
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-slate-600 hover:text-slate-800"
              >
                <X className="mr-2 h-4 w-4" />
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
