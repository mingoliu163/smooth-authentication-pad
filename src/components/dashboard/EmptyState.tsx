
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
  onRefresh?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  title, 
  message, 
  actionLabel, 
  actionLink,
  onRefresh,
  icon = <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
}: EmptyStateProps) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-gray-50">
      {icon}
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionLabel && actionLink && (
          <Button asChild>
            <Link to={actionLink}>{actionLabel}</Link>
          </Button>
        )}
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        )}
      </div>
    </div>
  );
};
