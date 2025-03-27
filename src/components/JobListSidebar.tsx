
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface JobListSidebarProps {
  onFilter: (filters: any) => void;
}

const JobListSidebar = ({ onFilter }: JobListSidebarProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Search</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Job title, company, or keyword"
              className="pl-9"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Job Type</h3>
          <div className="space-y-2">
            {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
              <div className="flex items-center" key={type}>
                <Checkbox id={`job-type-${type}`} />
                <Label
                  htmlFor={`job-type-${type}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Experience Level</h3>
          <div className="space-y-2">
            {["Entry Level", "Mid Level", "Senior Level", "Director", "Executive"].map((level) => (
              <div className="flex items-center" key={level}>
                <Checkbox id={`exp-level-${level}`} />
                <Label
                  htmlFor={`exp-level-${level}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Salary Range</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="min-salary" className="text-sm text-gray-600">
                Min
              </Label>
              <Input type="number" id="min-salary" placeholder="$0" />
            </div>
            <div>
              <Label htmlFor="max-salary" className="text-sm text-gray-600">
                Max
              </Label>
              <Input type="number" id="max-salary" placeholder="No limit" />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button 
            className="bg-brand-700 hover:bg-brand-800 text-white w-full"
            onClick={() => onFilter({})}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobListSidebar;
