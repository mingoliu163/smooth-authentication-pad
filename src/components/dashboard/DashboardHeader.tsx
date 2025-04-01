
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userEmail?: string | null;
  onSignOut: () => void;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userEmail}</p>
      </div>
      <Button 
        variant="outline" 
        onClick={onSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};
