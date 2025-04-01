
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface Interview {
  id: string;
  date: string;
  candidate_id?: string;
  candidate_name: string;
  position: string;
  status: string;
}

interface InterviewsTabProps {
  interviews: Interview[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

export const InterviewsTab = ({ 
  interviews, 
  isLoading, 
  formatDate 
}: InterviewsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>
          Your scheduled interviews and assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : interviews.length > 0 ? (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{interview.position} Interview</h3>
                    <p className="text-sm text-gray-600">{formatDate(interview.date)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    interview.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {interview.status}
                  </span>
                </div>
                <div className="flex justify-end mt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/interviews/${interview.id}`}>
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No interviews scheduled" 
            message="You don't have any upcoming interviews at the moment."
          />
        )}
      </CardContent>
    </Card>
  );
};
