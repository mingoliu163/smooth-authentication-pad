
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  created_at: string;
  job?: {
    title: string;
    company: string;
  };
}

interface ApplicationsTabProps {
  applications: JobApplication[];
  isLoading: boolean;
}

export const ApplicationsTab = ({ applications, isLoading }: ApplicationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
        <CardDescription>
          Track the status of your job applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{application.job?.title || "Unknown Position"}</h3>
                    <p className="text-sm text-gray-600">{application.job?.company || "Unknown Company"}</p>
                    <p className="text-xs text-gray-500 mt-1">Applied on {new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    application.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                    application.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No applications yet" 
            message="You haven't applied to any jobs yet. Browse available positions and submit your first application." 
            actionLabel="Browse Jobs" 
            actionLink="/jobs" 
          />
        )}
      </CardContent>
    </Card>
  );
};
