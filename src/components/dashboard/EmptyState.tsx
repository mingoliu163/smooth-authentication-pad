
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

export const EmptyState = ({ 
  title, 
  message, 
  actionLabel, 
  actionLink 
}: EmptyStateProps) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-gray-50">
      <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 mb-4">
        {message}
      </p>
      {actionLabel && actionLink && (
        <Button asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
};
